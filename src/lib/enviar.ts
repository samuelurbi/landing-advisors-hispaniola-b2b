import { leerUtm } from './analitica'

// Envío del formulario de socios. Sin GHL (20/10/2026): POST JSON a /api/enviar.php, que va en el
// propio zip de Hostinger (public/api/) y guarda en MySQL y avisa por SMTP. Solo cuenta como
// enviado si el servidor contesta { ok: true }; si no, lanza y la web enseña el error con la
// salida por WhatsApp. En `npm run dev` no hay PHP: se simula, salvo con VITE_FORM_ENDPOINT.
const ENDPOINT = (import.meta.env.VITE_FORM_ENDPOINT as string | undefined)?.trim() || (import.meta.env.DEV ? '' : '/api/enviar.php')

export async function enviarFormulario(campos: Record<string, unknown>, extra: { consentimiento: boolean; hp: string; ms: number }) {
  const cuerpo = {
    campos,
    consentimiento: { aceptado: extra.consentimiento },
    utm: leerUtm(),
    pagina: window.location.href,
    referrer: document.referrer,
    idioma: document.documentElement.lang || 'en',
    _hp: extra.hp,
    _ms: extra.ms,
  }
  if (!ENDPOINT) {
    await new Promise((r) => setTimeout(r, 700))
    console.info('[preview] Formulario no enviado (sin PHP en dev):', cuerpo)
    return
  }
  const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })
  const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
  if (!res.ok || j?.ok !== true) throw new Error(j?.error ?? `HTTP ${res.status}`)
}
