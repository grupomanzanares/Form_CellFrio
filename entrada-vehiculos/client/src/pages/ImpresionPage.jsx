import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function ImpresionPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get(`/entradas/${id}`)
        setData(response.data)
      } catch (error) {
        console.error(error)
        alert('No se pudo cargar el formato de impresión')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const formatFecha = (f) =>
    f
      ? new Date(f).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : ''

  const formatHora = (f) =>
    f
      ? new Date(f).toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : ''

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-400">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>Cargando comprobante...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-slate-600">No se encontró el registro</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @page {
          size: 139.7mm 215.9mm;
          margin: 6mm 8mm 6mm 8mm;
        }

        @media print {
          html, body {
            width: 139.7mm;
            height: 215.9mm;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .no-print {
            display: none;
          }
        }
      `}</style>

      {/* Barra de acciones - solo pantalla */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Comprobante de ingreso
              </p>
              <p className="text-xs text-slate-500">
                ID #{id} · Media carta
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      </div>

      {/* Contenido para impresión */}
      <div className="flex justify-center bg-slate-50 py-8 print:block print:bg-white print:py-0">
        <div className="mx-auto w-[139.7mm] bg-white font-sans text-[8pt] text-slate-900 shadow-xl print:w-full print:shadow-none">
          
          {/* Header - Neutro */}
          <div className="mb-0 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <div className="text-[12pt] font-bold text-slate-800 leading-none tracking-[-0.3px]">
                Centro de Refrigeración
              </div>
              <div className="mt-1 text-[6.5pt] text-slate-500 tracking-[0.3px]">
                Comprobante de ingreso de vehículo
              </div>
            </div>

            <div className="bg-white px-4 py-2 text-center shadow-sm border border-slate-200">
              <div className="text-[5.5pt] font-bold uppercase tracking-[1px] text-slate-500">
                N° Ingreso
              </div>
              <div className="font-mono text-[16pt] font-medium leading-none text-slate-800">
                #{id}
              </div>
            </div>
          </div>

          {/* Fecha y hora - Neutro */}
          <div className="mb-3 flex justify-between border-b border-slate-200 bg-slate-100 px-5 py-1.5 text-[7pt] font-medium text-slate-600">
            <span>{formatFecha(data.fecha_hora)}</span>
            <span>{formatHora(data.fecha_hora)}</span>
          </div>

          {/* Secciones */}
          <Section title="Cliente">
            <InfoRow label="Razón social" value={data.cliente || '—'} />
            <InfoRow label="NIT" value={data.nit || '—'} mono />
          </Section>

          <Section title="Vehículo">
            <InfoRow
              label="Placa"
              value={
                <span className="inline-block border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11pt] font-medium tracking-[3px]">
                  {data.placa || '—'}
                </span>
              }
            />
            <InfoRow label="Conductor" value={data.nom_conductor || '—'} />
          </Section>

          <Section title="Carga">
            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="Canastas" value={data.num_canastas ?? '—'} />
              <MetricCard label="Canastillas" value={data.num_canastillas ?? '—'} />
              <MetricCard label="Sello" value={data.sello || '—'} small />
            </div>
          </Section>

          <Section title="Responsables">
            <InfoRow label="Recibe" value={data.recibe || '—'} />
            <InfoRow label="Responsable" value={data.responsable || '—'} />

            {data.encargados?.length > 0 && (
              <div className="flex flex-col gap-1 border-b border-slate-100 py-1 last:border-b-0 last:pb-0">
                <span className="w-full text-[6.5pt] font-medium uppercase tracking-[0.5px] text-slate-500">
                  Encargados de cargue
                </span>

                <div className="mt-1 flex flex-wrap gap-1">
                  {data.encargados.map((item, i) => (
                    <span
                      key={i}
                      className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[6.5pt] font-medium text-slate-700"
                    >
                      {i + 1}. {typeof item === 'string' ? item : item.nombre_encargado}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Firmas */}
          <div className="mt-3 grid grid-cols-2 gap-4">
            <SignatureBox
              label="Quien recibe"
              name={data.recibe || 'Responsable'}
            />
            <SignatureBox
              label="Conductor"
              name={data.nom_conductor || 'Conductor'}
            />
          </div>

          {/* Footer - Neutro */}
          <div className="mt-3 flex justify-between bg-slate-800 px-5 py-1.5 text-[5.5pt] tracking-[0.5px] text-white/70">
            <span>
              Generado: <strong className="text-white/90">{new Date().toLocaleDateString('es-CO')}</strong>
            </span>
            <strong className="text-white/90">
              Centro de Refrigeración · Ingreso #{id}
            </strong>
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-2.5 border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[6pt] font-bold uppercase tracking-[1.5px] text-slate-600">
        {title}
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-slate-100 py-1 last:border-b-0 last:pb-0">
      <span className="w-[32%] shrink-0 text-[6.5pt] font-medium uppercase tracking-[0.5px] text-slate-500">
        {label}
      </span>
      <span className={`flex-1 text-[8pt] font-medium text-slate-900 ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function MetricCard({ label, value, small = false }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-2 text-center">
      <span
        className={`block font-mono font-medium leading-none text-slate-800 ${
          small ? 'text-[9pt]' : 'text-[13pt]'
        }`}
      >
        {value}
      </span>
      <span className="mt-1 block text-[5.5pt] font-bold uppercase tracking-[0.8px] text-slate-500">
        {label}
      </span>
    </div>
  )
}

function SignatureBox({ label, name }) {
  return (
    <div className="border border-slate-200 px-3 py-2">
      <div className="mb-1.5 h-[11mm] border-b border-dashed border-slate-300" />
      <div className="text-[6pt] font-bold uppercase tracking-[1px] text-slate-600">
        {label}
      </div>
      <div className="mt-0.5 text-[6pt] text-slate-400">{name}</div>
    </div>
  )
}