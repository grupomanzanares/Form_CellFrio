import { useEffect, useState } from 'react'
import api from '../services/api'

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    nombre: '',
    rol_id: 2,
    status: 1,
    clave: ''
  })

  const [form, setForm] = useState({
    nombre: '',
    clave: '',
    rol_id: 2,
    status: 1
  })

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/usuarios')
      setUsuarios(data)
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsuarios()
  }, [])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    if (!form.nombre.trim() || !form.clave.trim()) {
      alert('Nombre y clave son obligatorios')
      return
    }

    setCreating(true)
    try {
      await api.post('/usuarios', form)
      alert('Usuario creado correctamente')

      setForm({
        nombre: '',
        clave: '',
        rol_id: 2,
        status: 1
      })

      loadUsuarios()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Error al crear usuario')
    } finally {
      setCreating(false)
    }
  }

  // Iniciar edición
  const startEdit = (usuario) => {
    setEditingId(usuario.id)
    setEditForm({
      nombre: usuario.nombre,
      rol_id: usuario.rol_id,
      status: usuario.status,
      clave: '' // La contraseña se deja vacía, solo se actualiza si se escribe
    })
  }

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      nombre: '',
      rol_id: 2,
      status: 1,
      clave: ''
    })
  }

  // Actualizar usuario
  const handleUpdate = async (id) => {
    if (!editForm.nombre.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    try {
      // Solo enviar clave si se escribió una nueva
      const updateData = {
        nombre: editForm.nombre,
        rol_id: editForm.rol_id,
        status: editForm.status
      }
      
      if (editForm.clave && editForm.clave.trim()) {
        updateData.clave = editForm.clave
      }

      await api.put(`/usuarios/${id}`, updateData)
      alert('Usuario actualizado correctamente')
      cancelEdit()
      loadUsuarios()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Error al actualizar usuario')
    }
  }

  // Eliminar (inactivar) usuario
  const handleDelete = async (id) => {
    const ok = window.confirm('¿Desea inactivar este usuario?')
    if (!ok) return

    try {
      await api.delete(`/usuarios/${id}`)
      alert('Usuario inactivado correctamente')
      loadUsuarios()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Error al inactivar usuario')
    }
  }

  const getRolBadge = (rol) => {
    if (rol === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
          ADMIN
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
        USUARIO
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Usuarios</h1>
              <p className="text-sm text-slate-500">Gestione los usuarios del sistema</p>
            </div>
          </div>
        </div>

        {/* Create user card */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-xs">1</span>
            Crear nuevo usuario
          </h2>

          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Nombre
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <input
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  className={inputClass}
                  placeholder="Ingrese el nombre"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Clave
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.clave}
                  onChange={(e) => handleChange('clave', e.target.value)}
                  className={inputClass}
                  placeholder="Ingrese la clave"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Rol</label>
                <select
                  value={form.rol_id}
                  onChange={(e) => handleChange('rol_id', Number(e.target.value))}
                  className={inputClass}
                >
                  <option value={1}>ADMIN</option>
                  <option value={2}>USUARIO</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange('status', Number(e.target.value))}
                  className={inputClass}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Guardar usuario
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Users table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span>Cargando usuarios...</span>
                      </div>
                    </td>
                  </tr>
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>No hay usuarios registrados</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-600">
                        {usuario.id}
                      </td>
                      
                      <td className="px-4 py-3">
                        {editingId === usuario.id ? (
                          <input
                            value={editForm.nombre}
                            onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
                          />
                        ) : (
                          <span className="font-medium text-slate-900">{usuario.nombre}</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        {editingId === usuario.id ? (
                          <select
                            value={editForm.rol_id}
                            onChange={(e) => setEditForm({ ...editForm, rol_id: Number(e.target.value) })}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
                          >
                            <option value={1}>ADMIN</option>
                            <option value={2}>USUARIO</option>
                          </select>
                        ) : (
                          getRolBadge(usuario.rol)
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        {editingId === usuario.id ? (
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: Number(e.target.value) })}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
                          >
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                          </select>
                        ) : usuario.status === 1 ? (
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
                      
                      <td className="px-4 py-3">
                        {editingId === usuario.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(usuario.id)}
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
                              onClick={() => startEdit(usuario)}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results summary */}
          {!loading && usuarios.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                Mostrando <span className="font-medium text-slate-700">{usuarios.length}</span> usuario{usuarios.length !== 1 && 's'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}