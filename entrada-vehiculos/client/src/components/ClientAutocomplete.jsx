import { useEffect, useState } from 'react'
import api from '../services/api'

export default function ClientAutocomplete({ value, onSelect }) {
  const [search, setSearch] = useState(value?.nombre || '')
  const [options, setOptions] = useState([])
  const [showOptions, setShowOptions] = useState(false)

  useEffect(() => {
    setSearch(value?.nombre || '')
  }, [value])

  useEffect(() => {
    const loadClients = async () => {
      if (!search.trim()) {
        setOptions([])
        setShowOptions(false)
        return
      }

      try {
        const { data } = await api.get(`/clientes?search=${encodeURIComponent(search)}`)
        setOptions(data)
        setShowOptions(true)
      } catch (error) {
        console.error(error)
      }
    }

    const timer = setTimeout(loadClients, 250)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          onSelect(null)
        }}
        onFocus={() => {
          if (options.length > 0) setShowOptions(true)
        }}
        placeholder="Escriba el cliente"
        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
        autoComplete="off"
      />

      {showOptions && options.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {options.map((item) => (
            <div
              key={item.id}
              onMouseDown={() => {
                onSelect(item)
                setSearch(item.nombre)
                setShowOptions(false)
              }}
              className="cursor-pointer px-3 py-2 hover:bg-slate-100"
            >
              <div className="font-medium">{item.nombre}</div>
              <div className="text-xs text-slate-500">NIT: {item.nit}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}