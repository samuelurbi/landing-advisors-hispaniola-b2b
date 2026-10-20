import { useCallback, useRef, useState, type KeyboardEvent } from 'react'
import { DISTINCION, num } from '@/data/b2b'
import { evento } from '@/lib/analitica'
import { useAutoavance, useEnPantalla, useReducido } from '@/lib/movimiento'
import { Contenedor, Eyebrow, Foto, cx } from './ui'
import { medio } from '@/lib/medios'

// El catamarán con seis puntos. El diorama (Magnific; el barco es Maite, de la flota) es la escena; los
// puntos son pestañas: al elegir una, un foco ilumina esa parte del barco y al lado
// se cuentan las dos capas («Your client gets» / «Your business gets»), sin caja.
// El recorrido avanza SOLO (sin botón de play): se para mientras el ratón o el foco
// están en la sección y no se mueve con movimiento reducido.

const V = DISTINCION.ventajas

export function Distincion() {
  const seccion = useRef<HTMLElement>(null)
  const pestanas = useRef<(HTMLButtonElement | null)[]>([])
  const [actual, setActual] = useState(0)
  const [quieto, setQuieto] = useState(false)
  const reducido = useReducido()
  const visible = useEnPantalla(seccion)
  const v = V[actual]

  const siguiente = useCallback(() => setActual((i) => (i + 1) % V.length), [])
  useAutoavance(visible && !quieto && !reducido, 5500, siguiente)

  function elegir(i: number, enfocar = false) {
    setActual(i)
    evento('advantage_view', { n: i + 1 })
    if (enfocar) pestanas.current[i]?.focus()
  }
  function teclas(e: KeyboardEvent) {
    const mapa: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    if (e.key in mapa) elegir((actual + mapa[e.key] + V.length) % V.length, true)
    else if (e.key === 'Home') elegir(0, true)
    else if (e.key === 'End') elegir(V.length - 1, true)
    else return
    e.preventDefault()
  }

  return (
    <section
      id="why"
      ref={seccion}
      data-capitulo="why"
      aria-labelledby="distincion-titulo"
      className="bg-white py-seccion-sm sm:py-seccion"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setQuieto(true)}
      onPointerLeave={() => setQuieto(false)}
      onFocus={() => setQuieto(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setQuieto(false)}
    >
      <Contenedor>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="revela max-w-[54rem]">
            <Eyebrow>{num('why')} · {DISTINCION.capitulo}</Eyebrow>
            <h2 id="distincion-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
              {DISTINCION.titulo}
            </h2>
            <p className="mt-4 text-lead text-navy-sub">{DISTINCION.lead}</p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12">
          {/* Escena */}
          <div className="revela relative">
            <div className="diorama relative" style={{ ['--fx' as string]: `${v.x}%`, ['--fy' as string]: `${v.y}%` }}>
              <img
                src={medio('/ilustraciones/diorama.webp')}
                srcSet={medio('/ilustraciones/diorama-480.webp 800w, /ilustraciones/diorama.webp 1600w')}
                sizes="(min-width: 1024px) 52rem, 100vw"
                width={1443}
                height={1203}
                alt="Illustration of Maite, a Hispaniola sailing catamaran, with a cutaway of the reef below: guests on deck, the floating kitchen, a coral nursery and an underwater sculpture"
                loading="lazy"
                className="diorama-img relative block h-auto w-full"
              />
              <div aria-hidden className="diorama-foco" />
              <div role="tablist" aria-label="Six differences" aria-orientation="horizontal" onKeyDown={teclas}>
                {V.map((x, i) => (
                  <button
                    key={x.pin}
                    ref={(el) => {
                      pestanas.current[i] = el
                    }}
                    type="button"
                    role="tab"
                    id={`ventaja-${i}`}
                    aria-selected={i === actual}
                    aria-controls="ventaja-panel"
                    tabIndex={i === actual ? 0 : -1}
                    onClick={() => elegir(i)}
                    className={cx('diorama-pin', i === actual && 'diorama-pin--activo')}
                    style={{ left: `${x.x}%`, top: `${x.y}%` }}
                  >
                    <span className="diorama-pin-num">{x.pin}</span>
                    <span className="diorama-pin-etiqueta">{x.etiqueta}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* En móvil, las seis como chips debajo (los puntos quedan pequeños) */}
            <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:hidden" aria-hidden>
              {V.map((x, i) => (
                <button
                  key={x.pin}
                  type="button"
                  tabIndex={-1}
                  onClick={() => elegir(i)}
                  className={cx(
                    'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                    i === actual ? 'border-coral-boton bg-coral-boton text-white' : 'border-linea-fuerte bg-white text-navy',
                  )}
                >
                  {x.pin} · {x.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {/* Panel: sin caja. Arriba, el avance del recorrido (seis tramos). */}
          <div id="ventaja-panel" role="tabpanel" aria-labelledby={`ventaja-${actual}`} className="revela" style={{ ['--r' as string]: 1 }}>
            <div className="flex gap-1.5" aria-hidden>
              {V.map((x, i) => (
                <span key={x.pin} className="relative h-1 flex-1 overflow-hidden rounded-full bg-linea">
                  <span
                    className={cx('absolute inset-0 origin-left rounded-full bg-coral-boton', i < actual && 'scale-x-100', i > actual && 'scale-x-0', i === actual && (quieto || reducido ? 'scale-x-100' : 'ventaja-tramo'))}
                    key={i === actual ? `a${actual}` : x.pin}
                  />
                </span>
              ))}
            </div>
            <div key={actual} className="panel-entra mt-7">
              <p className="flex items-baseline gap-3">
                <span className="text-[2.75rem] font-bold leading-none tracking-[-0.03em] text-coral-boton">{v.pin}</span>
                <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-navy-soft">{v.etiqueta}</span>
              </p>
              <h3 className="mt-3 text-[1.625rem] font-semibold leading-tight tracking-[-0.01em] sm:text-[1.875rem]">{v.titulo}</h3>
              <div className="mt-5 aspect-[16/9] overflow-hidden rounded-card-grande">
                <Foto nombre={v.foto} alt={v.alt} sizes="(min-width: 1024px) 30rem, 100vw" className="h-full w-full object-cover" />
              </div>
              <dl className="mt-6 divide-y divide-linea border-y border-linea">
                <div className="grid gap-1 py-4 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-eyebrow font-semibold uppercase leading-5 tracking-[0.12em] text-aqua-dark">Your client gets</dt>
                  <dd className="font-medium leading-snug">{v.cliente}</dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-eyebrow font-semibold uppercase leading-5 tracking-[0.12em] text-coral-boton">Your business gets</dt>
                  <dd className="font-medium leading-snug">{v.negocio}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </Contenedor>
    </section>
  )
}
