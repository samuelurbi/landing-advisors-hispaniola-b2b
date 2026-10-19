import { useEffect, useRef, useState } from 'react'
import { DIA, num } from '@/data/b2b'
import { evento } from '@/lib/analitica'
import { Contenedor, Eyebrow, Foto, cx } from './ui'

// El día del cliente como un recorrido que avanza con el scroll: a la izquierda (fija en
// escritorio) la foto de la parada en curso; a la derecha las siete paradas sobre una
// línea que se va llenando, con la máscara de snorkel (render de Codex) bajando por
// ella. Nada de botones de play: lo mueve la lectura. Con movimiento reducido la línea
// queda llena y todas las paradas se ven igual.

const P = DIA.paradas

export function Dia() {
  const lista = useRef<HTMLOListElement>(null)
  const [actual, setActual] = useState(0)
  const [avance, setAvance] = useState(0)
  const vistas = useRef(new Set<number>())
  // Las fotos de la columna fija solo existen en escritorio (en móvil cada parada lleva la
  // suya): así no se descargan siete fotos ocultas en el teléfono, y en escritorio se piden
  // todas a la vez para que el fundido nunca caiga en una imagen sin cargar.
  const [escritorio, setEscritorio] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(min-width: 1024px)')
    setEscritorio(mq.matches)
    const cambio = () => setEscritorio(mq.matches)
    mq.addEventListener('change', cambio)
    return () => mq.removeEventListener('change', cambio)
  }, [])

  useEffect(() => {
    const el = lista.current
    if (!el) return
    let raf = 0
    const medir = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const centro = window.innerHeight * 0.55
      setAvance(Math.min(1, Math.max(0, (centro - r.top) / r.height)))
      const nodos = [...el.querySelectorAll<HTMLElement>('[data-parada]')]
      let i = 0
      nodos.forEach((n, k) => {
        if (n.getBoundingClientRect().top < centro) i = k
      })
      setActual(i)
      if (!vistas.current.has(i) && r.top < centro) {
        vistas.current.add(i)
        evento('route_stop_view', { n: i + 1 })
      }
    }
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(medir)
    }
    medir()
    window.addEventListener('scroll', alScroll, { passive: true })
    window.addEventListener('resize', alScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', alScroll)
      window.removeEventListener('resize', alScroll)
    }
  }, [])

  return (
    <section id="journey" data-capitulo="journey" aria-labelledby="dia-titulo" className="dia-fondo py-seccion-sm sm:py-seccion">
      <Contenedor className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Columna fija: título y la foto de la parada en curso */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <div className="revela">
              <Eyebrow>{num('journey')} · {DIA.capitulo}</Eyebrow>
              <h2 id="dia-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
                {DIA.titulo}
              </h2>
              <p className="mt-4 text-lead text-navy-sub">{DIA.lead}</p>
            </div>
            <div className="revela relative mt-8 hidden aspect-square overflow-hidden rounded-card-grande lg:block" aria-hidden>
              {escritorio &&
                P.map((x, i) => (
                  <img
                  key={x.foto + i}
                  src={`/fotos/${x.foto}-800.webp`}
                  srcSet={`/fotos/${x.foto}-800.webp 800w, /fotos/${x.foto}.webp 1600w`}
                  sizes="34vw"
                  alt=""
                  className={cx('absolute inset-0 h-full w-full object-cover transition-[opacity,scale] duration-700 ease-out', i === actual ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0')}
                />
              ))}
              <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-navy">{DIA.duracion}</span>
              <span className="absolute bottom-4 left-4 rounded-full bg-navy/85 px-3 py-1.5 text-xs font-semibold text-white">
                Stop {actual + 1} of {P.length} · {P[actual].corto}
              </span>
            </div>
          </div>
        </div>

        {/* El recorrido */}
        <ol ref={lista} className="dia-ruta relative lg:col-span-7 lg:pt-4" style={{ ['--avance' as string]: avance }}>
          <li aria-hidden className="dia-ruta-riel">
            <span className="dia-ruta-lleno" />
            <img src="/ilustraciones/mascara-480.webp" alt="" width={480} height={553} className="dia-ruta-mascara" />
          </li>
          {P.map((x, i) => (
            <li key={x.corto} data-parada className={cx('dia-parada', i <= actual && 'dia-parada--pasada', i === actual && 'dia-parada--actual')}>
              <span className="dia-parada-nodo" aria-hidden>
                {i + 1}
              </span>
              <h3 className="text-[1.25rem] font-semibold leading-tight sm:text-[1.375rem]">
                <span className="sr-only">Stop {i + 1}: </span>
                {x.titulo}
              </h3>
              <p className="mt-1.5 text-navy-sub">{x.texto}</p>
              <p className="mt-2 text-[0.9375rem] leading-snug">
                <span className="font-semibold text-coral-boton">{DIA.paraTi}: </span>
                <span className="font-medium">{x.paraTi}</span>
              </p>
              {/* Móvil: cada parada con su foto, la que pidió el cliente para ese hueco (Park y Return,
                  MA-82 05 y 06). En escritorio la enseña la columna fija. */}
              <div className="mt-4 aspect-[16/10] overflow-hidden rounded-card-grande lg:hidden">
                <Foto nombre={x.foto} alt={x.alt} sizes="100vw" className="h-full w-full object-cover" />
              </div>
            </li>
          ))}
        </ol>
      </Contenedor>
    </section>
  )
}
