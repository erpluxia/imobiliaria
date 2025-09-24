// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers para permitir chamadas do browser (Vite/localhost)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders } });
  }
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: { ...corsHeaders } });
    }

    const supabaseUrl = Deno.env.get('PROJECT_URL') ?? Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('ANON_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response('Missing environment variables', { status: 500, headers: { ...corsHeaders } });
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '');
    if (!jwt) return new Response('Unauthorized', { status: 401, headers: { ...corsHeaders } });

    // Client autenticado com o JWT do usuário para checar se é admin
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: me } = await supabase.auth.getUser();
    const userId = me?.user?.id;
    if (!userId) return new Response('Unauthorized', { status: 401, headers: { ...corsHeaders } });

    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (profErr) return new Response(profErr.message, { status: 500, headers: { ...corsHeaders } });
    if (prof?.role !== 'admin') return new Response('Forbidden', { status: 403, headers: { ...corsHeaders } });

    const body = await req.json().catch(() => ({}));
    const { email, password, fullName, phone, role = 'user', status = 'active' } = body as any;

    if (!email || !password) {
      return new Response('email/password required', { status: 400, headers: { ...corsHeaders } });
    }
    if (role !== 'user' && role !== 'admin') {
      return new Response('invalid role', { status: 400, headers: { ...corsHeaders } });
    }
    if (status !== 'active' && status !== 'blocked') {
      return new Response('invalid status', { status: 400, headers: { ...corsHeaders } });
    }

    // Client com service role para criar usuário
    const service = createClient(supabaseUrl, serviceRoleKey);

    const { data: created, error } = await service.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName ?? null, phone: phone ?? null },
      email_confirm: true,
    });
    if (error) return new Response(error.message, { status: 400, headers: { ...corsHeaders } });

    const newId = created.user?.id;
    if (newId) {
      const { error: upErr } = await service.from('profiles').upsert({
        id: newId,
        full_name: fullName ?? null,
        phone: phone ?? null,
        role,
        status,
      }, { onConflict: 'id' });
      if (upErr) return new Response(upErr.message, { status: 400, headers: { ...corsHeaders } });
    }

    return new Response(JSON.stringify({ userId: newId, email }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });
  } catch (e: any) {
    return new Response(e?.message ?? 'Internal error', { status: 500, headers: { ...corsHeaders } });
  }
});
