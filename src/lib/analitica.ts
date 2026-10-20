// Eventos para las campañas: todo va al dataLayer (GTM lo recoge cuando se
// instale). Los UTM de la visita se guardan al llegar y viajan con el formulario.

type Evento = { event: string; [k: string]: unknown }

declare global {
  interface Window {
    dataLayer?: Evento[]
  }
}

// Cada evento lleva device y language (01-LEER-PRIMERO §7). El país solo se conoce
// cuando el socio lo elige en el formulario: ahí viaja con form_submit_success.
// Nombre y email nunca van a analítica, solo al CRM.
export function evento(nombre: string, datos: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  const device = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
  window.dataLayer.push({ event: nombre, device, language: navigator.language, ...datos })
}

/** section_view: una vez por sección con [data-capitulo] cuando entra en el 60 % superior de la
 *  pantalla (margen y no umbral de área: en móvil hay secciones de varias pantallas que nunca
 *  llegaban al 35 % visible). */
export function vigilarSecciones() {
  const secciones = document.querySelectorAll<HTMLElement>('[data-capitulo]')
  if (!('IntersectionObserver' in window)) return () => {}
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        evento('section_view', { section: el.dataset.capitulo })
        if (el.dataset.capitulo === 'partnership') evento('reached_commission_section')
        io.unobserve(el)
      }
    },
    { rootMargin: '0px 0px -40% 0px' },
  )
  secciones.forEach((s) => io.observe(s))
  return () => io.disconnect()
}

const CLAVES_UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']
const ALMACEN = 'hispaniola-advisors-utm'

/** Se llama una vez al cargar: guarda los UTM de la URL para no perderlos al navegar por anclas. */
export function capturarUtm() {
  try {
    const params = new URLSearchParams(window.location.search)
    const utm: Record<string, string> = {}
    for (const k of CLAVES_UTM) {
      const v = params.get(k)
      if (v) utm[k] = v
    }
    if (Object.keys(utm).length) sessionStorage.setItem(ALMACEN, JSON.stringify(utm))
  } catch {
    /* almacenamiento bloqueado: se sigue sin UTM */
  }
}

export function leerUtm(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(ALMACEN) || '{}')
  } catch {
    return {}
  }
}
