import { useEffect, useState } from 'react'
import api from '../services/api'

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"

export default function ClientesPage() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isAdmin = user?.rol === 'ADMIN'

  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    nit: '',
    nombre: ''
  })

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    nit: '',
    nombre: '',
    status: 1
  })

  const loadClientes = async () => {
    try {
      setLoading(true)
      const query = search ? `?search=${encodeURIComponent(search)}` : ''
      const { data } = await api.get(`/clientes${query}`)
      setClientes(data)
    } catch (error) {
      console.error(error)
      alert('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()

    if (!form.nit.trim() || !form.nombre.trim()) {
      alert('NIT y nombre son obligatorios')
      return
    }

    try {
      await api.post('/clientes', form)
      alert('Cliente creado correctamente')
      setForm({ nit: '', nombre: '' })
      loadClientes()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Error al crear cliente')
    }
  }

  const startEdit = (cliente) => {
    setEditingId(cliente.id)
    setEditForm({
      nit: cliente.nit,
      nombre: cliente.nombre,
      status: cliente.status
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      nit: '',
      nombre: '',
      status: 1
    })
  }

  const handleUpdate = async (id) => {
    if (!editForm.nit.trim() || !editForm.nombre.trim()) {
      alert('NIT y nombre son obligatorios')
      return
    }

    try {
      await api.put(`/clientes/${id}`, editForm)
      alert('Cliente actualizado correctamente')
      cancelEdit()
      loadClientes()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Error al actualizar cliente')
    }
  }

  const handleDelete = async (id) => {
    const ok = window.confirm('¿Desea inactivar este cliente?')
    if (!ok) return

    try {
      await api.delete(`/clientes/${id}`)
      alert('Cliente inactivado correctamente')
      loadClientes()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Error al inactivar cliente')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
              <p className="text-sm text-slate-500">Gestione los clientes de la empresa</p>
            </div>
          </div>
        </div>

        {/* Create client card */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-xs">1</span>
            Crear nuevo cliente
          </h2>

          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                NIT
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                value={form.nit}
                onChange={(e) => setForm({ ...form, nit: e.target.value })}
                className={inputClass}
                placeholder="Ingrese el NIT"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Nombre
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className={inputClass}
                placeholder="Ingrese el nombre del cliente"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Guardar cliente
              </button>
            </div>
          </form>
        </div>

        {/* Search card */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-xs">2</span>
            Buscar cliente
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Nombre o NIT</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={inputClass}
                  placeholder="Escriba el nombre o NIT del cliente"
                  onKeyPress={(e) => e.key === 'Enter' && loadClientes()}
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadClientes}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Clients table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">NIT</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                  {isAdmin && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span>Cargando clientes...</span>
                      </div>
                    </td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>No hay clientes registrados</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-600">
                        {cliente.id}
                      </td>

                      <td className="px-4 py-3">
                        {editingId === cliente.id ? (
                          <input
                            value={editForm.nit}
                            onChange={(e) => setEditForm({ ...editForm, nit: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
                          />
                        ) : (
                          <span className="font-mono text-slate-600">{cliente.nit}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editingId === cliente.id ? (
                          <input
                            value={editForm.nombre}
                            onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
                          />
                        ) : (
                          <span className="font-medium text-slate-900">{cliente.nombre}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editingId === cliente.id ? (
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: Number(e.target.value) })}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
                          >
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                          </select>
                        ) : cliente.status === 1 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            Inactivo
                          </span>
                        )}
                      </td>

                      {isAdmin && (
                        <td className="px-4 py-3">
                          {editingId === cliente.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdate(cliente.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Guardar
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancelar
                              </button>
                            </div>
                          ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(cliente)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Editar
                                </button>
                              </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results summary */}
          {!loading && clientes.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                Mostrando <span className="font-medium text-slate-700">{clientes.length}</span> cliente{clientes.length !== 1 && 's'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}