import { useState } from 'react'
import { Camera, Check, FileText, GraduationCap, Plus, Tag, UserPlus } from 'lucide-react'
import { FAQ, KIT, REFERIDOS, num } from '@/data/b2b'
import { evento } from '@/lib/analitica'
import { Boton, Contenedor, Eyebrow, T, cx } from './ui'
import { medio } from '@/lib/medios'

// Solo variante B: referidos (US$75, ajuste 5), kit de ventas y FAQ, con los textos de la entrega
// de Hispaniola del 15 oct 2026.

// En el orden de KIT.piezas: tarifas netas, fichas, fotos y vídeos, formación.
const ICONOS_KIT = [Tag, FileText, Camera, GraduationCap]

// El kit, en blanco y sin cajas: el bodegón (render de Codex) flota a un lado y las
// cuatro piezas se ordenan como un índice numerado, separadas por filetes. Las dos columnas
// miden lo que su contenido y el conjunto va centrado (con 12 columnas iguales, la
// ilustración flotaba en una columna medio vacía y el peso caía a la derecha).
export function Kit() {
  return (
    <section id="kit" data-capitulo="kit" aria-labelledby="kit-titulo" className="bg-white py-seccion-sm sm:py-seccion">
      <Contenedor className="grid items-center gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,40rem)] lg:justify-center lg:gap-20">
        <div className="revela relative">
          <div aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(circle,var(--color-aqua-tint)_0%,transparent_70%)]" />
          <img
            src={medio('/objetos/objeto-kit-640.webp')}
            srcSet={medio('/objetos/objeto-kit-360.webp 360w, /objetos/objeto-kit-640.webp 640w')}
            sizes="(min-width: 1024px) 34rem, 80vw"
            alt="Illustration of the partner sales kit: product sheets and photos"
            loading="lazy"
            className="kit-flota mx-auto w-full max-w-[14rem] sm:max-w-[24rem] lg:max-w-none"
          />
        </div>
        <div className="min-w-0">
          <div className="revela">
            <Eyebrow>
              {num('kit')} · {KIT.capitulo}
            </Eyebrow>
            <h2 id="kit-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
              {KIT.titulo}
            </h2>
            <p className="mt-4 text-lead text-navy-sub">{KIT.texto}</p>
          </div>
          <ol className="mt-8 grid border-t border-linea sm:grid-cols-2 sm:gap-x-8">
            {KIT.piezas.map((p, i) => {
              const Icono = ICONOS_KIT[i]
              return (
                <li key={p} className="revela flex items-center gap-5 border-b border-linea py-5" style={{ ['--r' as string]: i }}>
                  <span className="w-8 text-sm font-semibold text-aqua-dark">{String(i + 1).padStart(2, '0')}</span>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-aqua-tint text-aqua-dark">
                    <Icono className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-[1.125rem] font-semibold">{p}</span>
                </li>
              )
            })}
          </ol>
          <div className="revela mt-8">
            <Boton href="#apply" tam="lg" flecha rastreo="kit">
              {KIT.cta}
            </Boton>
          </div>
        </div>
      </Contenedor>
    </section>
  )
}

// Acordeón propio (no <details>) para animar apertura y cierre; la respuesta sigue
// en el HTML prerenderizado.
function Pregunta({ q, i }: { q: (typeof FAQ.preguntas)[number]; i: number }) {
  const [abierto, setAbierto] = useState(false)
  const id = `faq-${i}`
  return (
    <div className="revela" style={{ ['--r' as string]: Math.min(i, 3) }}>
      <div className={cx('faq-item rounded-card bg-white ring-1 transition-[box-shadow] duration-300', abierto ? 'ring-aqua/40' : 'ring-linea hover:ring-linea-fuerte')} data-abierto={abierto}>
        <h3>
          <button
            type="button"
            aria-expanded={abierto}
            aria-controls={`${id}-panel`}
            id={`${id}-boton`}
            onClick={() => {
              if (!abierto) evento('faq_open', { question: q.p })
              setAbierto(!abierto)
            }}
            className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-card px-6 py-4 text-left font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
          >
            {q.p}
            <span className={cx('grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-300', abierto ? 'bg-aqua-dark text-white' : 'bg-aqua-tint text-aqua-dark')}>
              <Plus className="faq-icono size-4" aria-hidden />
            </span>
          </button>
        </h3>
        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-boton`} className="faq-panel" inert={!abierto}>
          <div>
            {/* Varias piezas = varias líneas (p. ej. capacidades, decisión de Marketing del 15 oct). */}
            <p className={cx('faq-respuesta px-6 pb-6 leading-relaxed text-navy-sub', q.r.length > 1 && '[&>span]:block')}>
              <T t={q.r} />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Preguntas() {
  return (
    <section id="faq" data-capitulo="faq" aria-labelledby="faq-titulo" className="bg-papel-hueso py-seccion-sm sm:py-seccion">
      <Contenedor>
        <div className="mx-auto max-w-[72rem]">
          <h2 id="faq-titulo" className="revela text-center text-[2rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.75rem]">
            {FAQ.titulo}
          </h2>
          <div className="mt-10 grid items-start gap-3 lg:grid-cols-2">
            {FAQ.preguntas.map((q, i) => (
              <Pregunta key={q.p} q={q} i={i} />
            ))}
          </div>
        </div>
      </Contenedor>
    </section>
  )
}

// Programa de referidos (bloque 4): sección propia tras «How it works», en blanco, con la cifra
// grande a un lado y las condiciones como lista.
export function Referidos() {
  return (
    <section id="referrals" data-capitulo="referrals" aria-labelledby="referidos-titulo" className="bg-papel-hueso py-seccion-sm sm:py-seccion">
      <Contenedor className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-20">
        <div className="revela">
          <Eyebrow>
            {num('referrals')} · {REFERIDOS.capitulo}
          </Eyebrow>
          <h2 id="referidos-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
            {REFERIDOS.titulo}
          </h2>
          <p className="mt-5 max-w-[40rem] text-lead text-navy-sub">{REFERIDOS.texto}</p>
          <div className="mt-8">
            <Boton href="#apply" tam="lg" flecha rastreo="referrals">
              {REFERIDOS.cta}
            </Boton>
          </div>
        </div>
        <div className="revela rounded-card bg-white p-7 ring-1 ring-linea sm:p-8" style={{ ['--r' as string]: 1 }}>
          <span className="grid size-12 place-items-center rounded-full bg-aqua-tint text-aqua-dark">
            <UserPlus className="size-6" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="mt-5 text-eyebrow font-semibold uppercase tracking-[0.14em] text-aqua-dark">{REFERIDOS.bueno}</p>
          <ul className="mt-3 grid gap-3">
            {REFERIDOS.reglas.map((r) => (
              <li key={r} className="flex gap-3 text-navy-sub">
                <Check className="mt-1 size-4 shrink-0 text-aqua-dark" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </Contenedor>
    </section>
  )
}
