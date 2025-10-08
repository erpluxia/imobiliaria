import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [business, setBusiness] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (city) params.set('city', city)
    if (business) params.set('business', business)
    navigate(`/resultados?${params.toString()}`)
  }

  return (
    <form onSubmit={onSubmit} className="w-full grid grid-cols-1 md:grid-cols-4 gap-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Busque por bairro, cidade ou palavra-chave"
        className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Cidade"
        className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select
        value={business}
        onChange={(e) => setBusiness(e.target.value)}
        className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Negócio</option>
        <option value="rent">Aluguel</option>
        <option value="sale">Venda</option>
      </select>
      <button type="submit" className="bg-black text-white rounded-md px-4 py-2 hover:bg-gray-900">
        Buscar
      </button>
    </form>
  )
}
