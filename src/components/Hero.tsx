import { useEffect, useRef } from 'react'
import { HERO, TICKET_HERO } from '@/data/b2b'
import { Boton, Eyebrow } from './ui'
import { Ticket } from './Ticket'
import { evento } from '@/lib/analitica'

// Héroe en la caja redondeada de la web, con el vídeo aéreo de la piscina natural.
// A la derecha, el pase de papel en 3D: el protagonista del héroe (la brújula se quitó
// en la iteración 2 para aligerarlo).
// El póster es la imagen LCP; el vídeo se pide tras el `load` y nunca con
// movimiento reducido o ahorro de datos.
export function Hero() {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = video.current
    if (!v) return
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ahorro = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (reducido || ahorro) return
    const cargar = () => {
      v.src = window.innerWidth < 768 ? '/video/hero-960.mp4' : '/video/hero.mp4'
      v.play().catch(() => {})
      v.addEventListener('playing', () => v.classList.remove('opacity-0'), { once: true })
    }
    if (document.readyState === 'complete') setTimeout(cargar, 300)
    else window.addEventListener('load', () => setTimeout(cargar, 300), { once: true })
  }, [])

  const [antes, acento] = HERO.titulo

  return (
    <section id="top" data-capitulo="hero" className="p-2 sm:p-3">
      <div className="relative isolate flex min-h-[86svh] flex-col overflow-hidden rounded-hero bg-navy lg:min-h-[78svh]">
        <img
          src="/fotos/hero-poster.webp"
          srcSet="/fotos/hero-poster-800.webp 800w, /fotos/hero-poster.webp 1600w"
          sizes="100vw"
          alt="Catamarans anchored in the turquoise natural pool of Punta Cana, seen from above"
          fetchPriority="high"
          className="hero-zoom absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-0 transition-opacity duration-1000"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(90deg, rgb(11 37 69 / 82%) 0%, rgb(11 37 69 / 58%) 45%, rgb(11 37 69 / 22%) 100%)',
          }}
        />

        <div className="mx-auto flex w-full max-w-contenido flex-1 flex-col justify-end px-5 pb-8 pt-28 sm:px-10 sm:pb-12 lg:pt-36">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-14">
            <div className="max-w-[44rem] text-white">
              <Eyebrow claro>{HERO.eyebrow}</Eyebrow>
              <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.025em] sm:text-[3.5rem] lg:text-[4.25rem]">
                <span className="hero-linea block" style={{ ['--i' as string]: 0 }}>
                  {antes}
                </span>
                <span className="hero-linea block text-aqua-claro" style={{ ['--i' as string]: 1 }}>
                  {acento}
                </span>
              </h1>
              <p className="mt-6 max-w-[36rem] text-lead text-white/85">
                {HERO.lead} <strong className="font-semibold text-white">{HERO.remate}</strong>
              </p>
              <p className="mt-4 inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm sm:text-base">
                {HERO.comision}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Boton href="#apply" tam="lg" flecha rastreo="hero_primary">
                  {HERO.ctaPrimario}
                </Boton>
                <Boton href="#operator" variante="vidrio" tam="lg" rastreo="hero_secondary">
                  {HERO.ctaSecundario}
                </Boton>
              </div>
            </div>

            <Ticket
              datos={TICKET_HERO}
              alBoton={() => {
                evento('partner_cta_click', { location: 'hero_ticket' })
                document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="hero-pase w-full max-w-[16rem] justify-self-center sm:max-w-[34rem] lg:justify-self-end"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
