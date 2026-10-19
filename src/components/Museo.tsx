import { useEffect, useRef, useState } from 'react'
import { MUSEO, num } from '@/data/b2b'
import { evento } from '@/lib/analitica'
import { Boton, Contenedor, Eyebrow, Foto } from './ui'

// El museo, en el centro del tramo «bajo el agua» (el fondo, la luz y las burbujas los
// pone BajoElAgua). Las esculturas van en abanico y se arrastran de lado. Regla del paquete: el museo siempre «Coming soon,
// November 15, 2026», nunca «open» ni «included».

const APERTURA = new Date('2026-11-15T09:00:00-04:00')


function DiasParaAbrir() {
  // Solo en el cliente: el HTML prerenderizado no envejece.
  const [dias, setDias] = useState<number | null>(null)
  useEffect(() => {
    setDias(Math.ceil((APERTURA.getTime() - Date.now()) / 86_400_000))
  }, [])
  if (dias === null || dias <= 0) return null
  return (
    <p className="mt-3 flex items-baseline gap-2">
      <span className="text-[2.25rem] font-semibold leading-none tracking-tight">{dias}</span>
      <span className="text-sm text-white/75">{dias === 1 ? 'day to go' : 'days to go'}</span>
    </p>
  )
}

export function Museo() {
  const pista = useRef<HTMLDivElement>(null)
  const avisado = useRef(false)
  return (
    <section id="museum" data-capitulo="museum" aria-labelledby="museo-titulo" className="py-seccion-sm sm:py-seccion">
        <Contenedor className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <div className="revela">
            <Eyebrow claro>{num('museum')} · {MUSEO.eyebrow}</Eyebrow>
            <h2 id="museo-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
              {MUSEO.titulo}
            </h2>
            <p className="mt-4 text-lead text-white/80">{MUSEO.lead}</p>
            <div className="vidrio-oscuro mt-8 inline-block rounded-[1.25rem] px-5 py-4">
              <p className="flex items-center gap-2 text-eyebrow font-semibold uppercase tracking-[0.12em] text-white/90">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2 rounded-full bg-coral" />
                </span>
                {MUSEO.pronto}
              </p>
              <p className="mt-2 text-lg font-semibold leading-tight">{MUSEO.fecha}</p>
              <DiasParaAbrir />
            </div>
            <p className="mt-6 max-w-[28rem] text-white/80">{MUSEO.texto}</p>
            <Boton href="#apply" tam="lg" flecha rastreo="museum" className="mt-8">
              {MUSEO.cta}
            </Boton>
          </div>

          <div
            ref={pista}
            className="museo-pista revela -mx-5 lg:mx-0"
            style={{ ['--r' as string]: 1 }}
            tabIndex={0}
            role="region"
            aria-label="Sculptures of the Underwater Museum. Scroll sideways to see more."
            onScroll={() => {
              if (avisado.current) return
              avisado.current = true
              evento('museum_scroll')
            }}
          >
            {MUSEO.piezas.map((p, i) => (
              <figure key={p.titulo} className="museo-carta">
                <Foto nombre={p.foto} alt={`${p.titulo}, Underwater Museum`} sizes="(min-width: 1024px) 26rem, 78vw" className="h-full w-full object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgb(1_3_7/80%),transparent)] px-5 pb-5 pt-16">
                  <span className="block text-eyebrow font-semibold uppercase tracking-[0.14em] text-aqua-claro">
                    {String(i + 1).padStart(2, '0')} · {p.tipo}
                  </span>
                  <span className="mt-1 block text-[1.25rem] font-semibold">{p.titulo}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Contenedor>
    </section>
  )
}
