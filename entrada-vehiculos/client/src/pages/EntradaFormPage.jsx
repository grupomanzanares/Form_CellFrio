import { useState } from "react";
import ClientAutocomplete from "../components/ClientAutocomplete";
import api from "../services/api";

const nowLocal = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
        {hint && <span className="ml-2 text-xs font-normal text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200";

export default function EntradaFormPage() {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fecha_hora: nowLocal(),
    placa: "",
    nom_conductor: "",
    num_canastas: "",
    num_canastillas: "",
    sello: "",
    recibe: "",
    responsable: "",
    encargados: [""],
  });

  const handleChange = (field, value) => {
    if (field === "placa") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEncargadoChange = (index, value) => {
    const nuevos = [...form.encargados];
    nuevos[index] = value;
    setForm((prev) => ({ ...prev, encargados: nuevos }));
  };

  const addEncargado = () => {
    if (form.encargados.length >= 5) return;
    setForm((prev) => ({ ...prev, encargados: [...prev.encargados, ""] }));
  };

  const removeEncargado = (index) => {
    if (form.encargados.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      encargados: prev.encargados.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cliente?.id) return alert("Debe seleccionar un cliente");

    setLoading(true);
    try {
      const payload = {
        fecha_hora: form.fecha_hora.replace("T", " ") + ":00",
        cliente_id: cliente.id,
        placa: form.placa,
        nom_conductor: form.nom_conductor,
        num_canastas: Number(form.num_canastas || 0),
        num_canastillas: Number(form.num_canastillas || 0),
        sello: form.sello,
        recibe: form.recibe,
        responsable: form.responsable,
        encargados: form.encargados.filter(Boolean),
      };

      const { data } = await api.post("/entradas", payload);
      window.open(`${window.location.origin}/cellfrio-web/impresion/${data.id}`, "_blank");
      alert(`Entrada registrada correctamente. ID: ${data.id}`);

      setCliente(null);
      setForm({
        fecha_hora: nowLocal(),
        placa: "",
        nom_conductor: "",
        num_canastas: "",
        num_canastillas: "",
        sello: "",
        recibe: "",
        responsable: "",
        encargados: [""],
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error al guardar la entrada");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 8h4l3 5v3h-7V8z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Registro de entrada</h1>
              <p className="text-sm text-slate-500">Complete los datos del vehículo y la carga</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Sección 1: Fecha y cliente */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-xs">1</span>
              Información general
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Fecha y hora" required>
                <input
                  type="datetime-local"
                  value={form.fecha_hora}
                  onChange={(e) => handleChange("fecha_hora", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Cliente" required>
                <ClientAutocomplete value={cliente} onSelect={setCliente} />
              </Field>
            </div>
          </div>

          {/* Sección 2: Vehículo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-xs">2</span>
              Datos del vehículo
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Placa" required>
                <input
                  value={form.placa}
                  onChange={(e) => handleChange("placa", e.target.value)}
                  className={`${inputClass} font-mono tracking-widest uppercase`}
                  placeholder="ABC123"
                  maxLength={6}
                />
              </Field>
              <Field label="Nombre del conductor" required>
                <input
                  value={form.nom_conductor}
                  onChange={(e) => handleChange("nom_conductor", e.target.value)}
                  className={inputClass}
                  placeholder="Nombre completo"
                />
              </Field>
            </div>
          </div>

          {/* Sección 3: Carga */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-xs">3</span>
              Detalles de la carga
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="N° de canastas" required>
                <input
                  type="number"
                  min="0"
                  value={form.num_canastas}
                  onChange={(e) => handleChange("num_canastas", e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </Field>
              <Field label="N° de canastillas">
                <input
                  type="number"
                  min="0"
                  value={form.num_canastillas}
                  onChange={(e) => handleChange("num_canastillas", e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </Field>
              <Field label="Sello">
                <input
                  value={form.sello}
                  onChange={(e) => handleChange("sello", e.target.value)}
                  className={inputClass}
                  placeholder="Número de sello"
                />
              </Field>
            </div>
          </div>

          {/* Sección 4: Responsables */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-xs">4</span>
              Responsables
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Recibe" hint="Opcional">
                <input
                  value={form.recibe}
                  onChange={(e) => handleChange("recibe", e.target.value)}
                  className={inputClass}
                  placeholder="Nombre de quien recibe"
                />
              </Field>
              <Field label="Responsable" hint="Opcional">
                <input
                  value={form.responsable}
                  onChange={(e) => handleChange("responsable", e.target.value)}
                  className={inputClass}
                  placeholder="Nombre del responsable"
                />
              </Field>
            </div>

            {/* Encargados de cargue */}
            <div className="mt-4">
              <Field label="Encargado(s) de cargue" hint={`${form.encargados.length}/5`}>
                <div className="space-y-2">
                  {form.encargados.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                        {index + 1}
                      </div>
                      <input
                        value={item}
                        onChange={(e) => handleEncargadoChange(index, e.target.value)}
                        className={inputClass}
                        placeholder={`Encargado ${index + 1}`}
                      />
                      {form.encargados.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEncargado(index)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {form.encargados.length < 5 && (
                  <button
                    type="button"
                    onClick={addEncargado}
                    className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                    </svg>
                    Agregar encargado
                  </button>
                )}
              </Field>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <p className="text-sm text-slate-500">
              Los campos con <span className="text-red-500 font-medium">*</span> son obligatorios
            </p>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  Guardar entrada
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}