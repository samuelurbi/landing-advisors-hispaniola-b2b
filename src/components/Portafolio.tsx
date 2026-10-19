import { useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { FICHAS, PORTAFOLIO, num } from '@/data/b2b'
import { evento } from '@/lib/analitica'
import { Boton, Contenedor, Eyebrow, cx } from './ui'

// Los seis frentes en una rejilla 3×2 (iteración 2: antes eran seis bloques enormes
// que esperaban a aparecer con el scroll). Cada tarjeta enseña foto, nombre y bajada; el
// detalle (puntos y «por qué le importa a una agencia») sube al pasar el ratón, al
// enfocar o al tocar «Details». En móvil, una tira que se desliza de lado. Nada espera a
// una animación de entrada: las tarjetas están desde el primer momento.
// Ajuste 8 (15 oct 2026): cada tarjeta abre su ficha «At a glance» (para quién es, duración,
// tamaño de grupo, qué incluye; sin precios) en un <dialog> nativo.

const F = PORTAFOLIO.frentes

export function Portafolio() {
  const [abierta, setAbierta] = useState<number | null>(null)
  const [ficha, setFicha] = useState(0)
  const dialogo = useRef<HTMLDialogElement>(null)

  function verFicha(i: number) {
    setFicha(i)
    dialogo.current?.showModal()
    evento('portfolio_glance', { name: F[i].nombre })
  }

  function alternar(i: number) {
    const nueva = abierta === i ? null : i
    setAbierta(nueva)
    if (nueva !== null) evento('portfolio_view', { name: F[i].nombre })
  }

  return (
    <section id="portfolio" data-capitulo="portfolio" aria-labelledby="portafolio-titulo" className="bg-white py-seccion-sm sm:py-seccion">
      <Contenedor>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[46rem]">
            <Eyebrow>{num('portfolio')} · {PORTAFOLIO.capitulo}</Eyebrow>
            <h2 id="portafolio-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
              {PORTAFOLIO.titulo}
            </h2>
            <p className="mt-4 text-lead text-navy-sub">{PORTAFOLIO.lead}</p>
            <p className="mt-3 text-navy-sub">{PORTAFOLIO.intro}</p>
          </div>
          <div className="hidden lg:block">
            <Boton href="#partnership" flecha rastreo="portfolio">
              {PORTAFOLIO.cta}
            </Boton>
          </div>
        </div>

        <ul className="frentes -mx-5 mt-10 px-5 sm:mt-12 lg:mx-0 lg:px-0">
          {F.map((f, i) => {
            const abierto = abierta === i
            return (
              <li key={f.nombre} className={cx('frente-tarjeta', abierto && 'frente-tarjeta--abierta')}>
                <img
                  src={`/fotos/${f.foto}-800.webp`}
                  srcSet={`/fotos/${f.foto}-800.webp 800w, /fotos/${f.foto}.webp 1600w`}
                  sizes="(min-width: 1024px) 30vw, 80vw"
                  alt={f.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div aria-hidden className="frente-velo" />
                <div className="frente-cara">
                  <p className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-aqua-claro">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-1.5 text-[1.375rem] font-semibold leading-tight text-white sm:text-[1.5rem]">{f.nombre}</h3>
                  <p className="mt-1 text-[0.9375rem] text-white/85">{f.bajada}</p>
                </div>
                <div className="frente-detalle" id={`frente-${i}`}>
                  <p className="mb-3 text-[1.125rem] font-semibold text-white" aria-hidden>
                    {f.nombre}
                  </p>
                  <ul className="grid gap-2 text-[0.9375rem] text-white/90">
                    {f.puntos.map((p) => (
                      <li key={p} className="flex gap-2.5">
                        <span aria-hidden className="mt-[0.65rem] h-0.5 w-3 shrink-0 rounded-full bg-coral" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-white/20 pt-3">
                    <span className="block text-eyebrow font-semibold uppercase tracking-[0.14em] text-coral">{PORTAFOLIO.porQue}</span>
                    <span className="mt-1 block font-semibold leading-snug text-white">{f.porQue}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => verFicha(i)}
                    tabIndex={abierto ? 0 : -1}
                    className="absolute bottom-4 left-5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-navy transition-colors hover:bg-aqua-tint"
                  >
                    {PORTAFOLIO.verFicha}
                  </button>
                </div>
                <button
                  type="button"
                  className="frente-boton"
                  aria-expanded={abierto}
                  aria-controls={`frente-${i}`}
                  aria-label={`${abierto ? 'Hide' : 'Show'} details: ${f.nombre}`}
                  onClick={() => alternar(i)}
                >
                  <Plus className="size-4" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>

        <p className="mt-6 text-sm text-navy-soft">{PORTAFOLIO.nota}</p>

        <dialog
          ref={dialogo}
          aria-labelledby="ficha-titulo"
          onClick={(e) => e.target === e.currentTarget && dialogo.current?.close()}
          className="ficha-dialogo m-auto w-[min(44rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-card bg-white p-0 text-navy shadow-2xl backdrop:bg-navy/60"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-aqua-dark">{PORTAFOLIO.verFicha}</p>
                <h3 id="ficha-titulo" className="mt-1 text-[1.5rem] font-semibold leading-tight sm:text-[1.75rem]">
                  {F[ficha].nombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => dialogo.current?.close()}
                aria-label="Close"
                className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-aqua-tint text-aqua-dark hover:bg-aqua/20"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {FICHAS[ficha].map((bloque) => (
              <div key={bloque.titulo} className="mt-6">
                {FICHAS[ficha].length > 1 && <h4 className="text-[1.125rem] font-semibold">{bloque.titulo}</h4>}
                <dl className="mt-2 divide-y divide-linea border-y border-linea">
                  {bloque.lineas.map(([k, v]) => (
                    <div key={k} className="grid gap-1 py-3 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4">
                      <dt className="text-sm font-semibold text-aqua-dark">{k}</dt>
                      <dd className="text-[0.9375rem] leading-relaxed text-navy-sub">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            <p className="mt-5 text-sm text-navy-soft">{PORTAFOLIO.nota}</p>
          </div>
        </dialog>

        <div className="mt-8 flex justify-center lg:hidden">
          <Boton href="#partnership" flecha rastreo="portfolio">
            {PORTAFOLIO.cta}
          </Boton>
        </div>
      </Contenedor>
    </section>
  )
}
