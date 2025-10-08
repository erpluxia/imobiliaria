type Props = {
  phone: string // Ex.: "5511940569156"
}

export default function FloatingWhatsAppButton({ phone }: Props) {
  // Garante apenas dígitos
  const target = (phone || '').replace(/\D+/g, '')
  const href = `https://wa.me/${encodeURIComponent(target)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale no WhatsApp"
      title="Fale no WhatsApp"
      className="fixed z-50 bottom-6 right-6 inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300"
    >
      {/* Ícone WhatsApp */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04 0C5.46.02.17 5.31.19 11.89c0 2.09.55 4.13 1.6 5.94L0 24l6.36-1.66a11.87 11.87 0 0 0 5.67 1.45h.05c6.58 0 11.96-5.39 11.98-11.97A11.74 11.74 0 0 0 20.52 3.48ZM12.08 21.3h-.04a9.39 9.39 0 0 1-4.79-1.31l-.34-.2-3.77.99 1.01-3.68-.22-.38a9.37 9.37 0 0 1-1.43-4.96C2.47 6.64 6.6 2.5 11.98 2.5c2.5 0 4.85.98 6.62 2.75a9.27 9.27 0 0 1 2.73 6.58c-.02 5.36-4.38 9.47-9.25 9.47Zm5.36-7.04c-.29-.15-1.7-.84-1.97-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.9 1.14-.17.2-.33.22-.62.07-.29-.15-1.24-.46-2.36-1.47-.87-.78-1.46-1.75-1.63-2.04-.17-.29-.02-.45.13-.59.13-.13.29-.33.43-.49.14-.16.19-.27.29-.46.1-.2.05-.36-.02-.51-.07-.15-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49-.16-.01-.35-.01-.54-.01-.2 0-.52.07-.79.36-.27.29-1.03 1-1.03 2.44 0 1.44 1.06 2.84 1.21 3.03.15.2 2.09 3.19 5.07 4.47.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34Z"/>
      </svg>
    </a>
  )
}
