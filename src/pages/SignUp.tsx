import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; phone?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function normalizePhone(v: string) { return v.replace(/\D+/g, '') }
  function isValidBRPhone(digits: string) { return digits.length === 10 || digits.length === 11 }
  function formatBR(digits: string) {
    if (digits.length === 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
    if (digits.length === 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
    return digits
  }

  function validate() {
    const next: typeof errors = {}

    if (!fullName.trim()) next.fullName = 'Informe seu nome completo'

    if (!email.trim()) next.email = 'Informe seu e-mail'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'E-mail inválido'

    if (!password) next.password = 'Informe uma senha'
    else if (password.length < 8) next.password = 'A senha deve ter no mínimo 8 caracteres'

    const digits = normalizePhone(phone)
    if (!digits) next.phone = 'Informe seu telefone'
    else if (!isValidBRPhone(digits)) next.phone = 'Telefone inválido. Use DDD: 11912345678'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError(null)
    const digits = normalizePhone(phone)
    const { error } = await signUp({ email, password, fullName, phone: digits })
    setSubmitting(false)
    if (error) {
      setSubmitError(error)
      return
    }
    // Opcional: o Supabase pode enviar e-mail de confirmação, então direcionamos para login
    navigate('/login')
  }

  function onPhoneChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = normalizePhone(e.target.value)
    setPhone(digits)
    setErrors((prev) => ({ ...prev, phone: digits ? (isValidBRPhone(digits) ? undefined : 'Telefone inválido. Use DDD: 11912345678') : 'Informe seu telefone' }))
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Crie sua conta</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome e sobrenome</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Seu nome completo"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="seu@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha (mínimo 8 caracteres)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="********"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              value={formatBR(normalizePhone(phone))}
              onChange={onPhoneChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-sky-600 text-white rounded-md px-4 py-2 font-medium hover:bg-sky-700 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Enviando...' : 'Cadastrar'}
          </button>

        {submitError && <p className="text-center text-sm text-red-600 mt-2">{submitError}</p>}
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Já possui uma conta?{' '}
          <Link to="/" className="text-sky-700 hover:underline">Entre aqui</Link>
        </p>
      </div>
    </div>
  )
}
