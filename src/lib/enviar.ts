import { leerUtm } from './analitica'

// El destino real (CRM / Odoo / GHL) lo decide Marketing. Mientras tanto, sin
// VITE_FORM_ENDPOINT la landing simula el envío: la preview muestra el éxito y
// no se pierde nada porque no se promete nada a nadie fuera de la preview.
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT as string | undefined

export async function enviarFormulario(tipo: 'registro' | 'cotizacion', datos: Record<string, unknown>) {
  const cuerpo = {
    tipo,
    marca: 'hispaniola',
    origen: typeof window !== 'undefined' ? window.location.href : '',
    enviado: new Date().toISOString(),
    utm: leerUtm(),
    ...datos,
  }
  if (!ENDPOINT) {
    await new Promise((r) => setTimeout(r, 700))
    console.info('[preview] Formulario no enviado (falta VITE_FORM_ENDPOINT):', cuerpo)
    return
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
