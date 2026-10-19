import { Gift, Handshake } from 'lucide-react'
import { ALIANZA, COMISION, num } from '@/data/b2b'
import { Boton, Contenedor, Eyebrow, cx } from './ui'

// «How it works»: a la izquierda la propuesta, a la derecha los cuatro pasos del programa como
// índice de filas grandes separadas por filetes. Debajo, el programa de incentivos que Hispaniola
// pidió publicar el 15 oct 2026 (ajuste 1): tres niveles como tarjetas (en móvil, una bajo otra) y
// los dos bonos. Cierra el tramo «bajo el agua».
export function Alianza() {
  const [acceso, semi, privado, extra] = COMISION.filas
  return (
    <section id="partnership" data-capitulo="partnership" aria-labelledby="alianza-titulo" className="py-seccion-sm sm:py-seccion">
      <Contenedor className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="revela lg:col-span-5">
          <Eyebrow claro>
            {num('partnership')} · {ALIANZA.capitulo}
          </Eyebrow>
          <h2 id="alianza-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
            {ALIANZA.titulo}
          </h2>
          <p className="mt-5 text-lead text-white/80">{ALIANZA.lead}</p>
          <Boton href="#apply" tam="lg" flecha rastreo="partnership" className="mt-10">
            {ALIANZA.cta}
          </Boton>
        </div>

        <ol className="lg:col-span-7 lg:self-center">
          {ALIANZA.filas.map((f, i) => (
            <li key={f.titulo} className="revela alianza-fila" style={{ ['--r' as string]: i }}>
              <span className="alianza-num" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-aqua-claro">{f.etiqueta}</p>
                <h3 className="mt-2 text-[1.375rem] font-semibold sm:text-[1.625rem]">{f.titulo}</h3>
                <p className="mt-2 max-w-[34rem] text-white/75">{f.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </Contenedor>

      <Contenedor className="mt-16 sm:mt-24">
        <div id="commission" className="revela flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-coral-boton">
            <Handshake className="size-5" aria-hidden />
          </span>
          <div className="max-w-[44rem]">
            <h3 className="text-[1.625rem] font-semibold leading-tight sm:text-[2.25rem]">{COMISION.titulo}</h3>
            <p className="mt-3 text-white/80">{COMISION.intro}</p>
          </div>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {COMISION.niveles.map((nivel, i) => (
            <li
              key={nivel}
              className={cx(
                'revela flex flex-col rounded-card p-6 ring-1 sm:p-7',
                i === 2 ? 'bg-white text-navy ring-white' : 'bg-white/[0.06] ring-white/20',
              )}
              style={{ ['--r' as string]: i }}
            >
              <p className={cx('text-eyebrow font-semibold uppercase tracking-[0.16em]', i === 2 ? 'text-aqua-dark' : 'text-aqua-claro')}>
                {String(i + 1).padStart(2, '0')} · {nivel}
              </p>
              <p className={cx('mt-2 text-sm', i === 2 ? 'text-navy-sub' : 'text-white/75')}>
                <span className="sr-only">{acceso.etiqueta}: </span>
                {acceso.valores[i]}
              </p>
              <dl className={cx('mt-5 grid grid-cols-2 gap-4 border-t pt-5', i === 2 ? 'border-linea' : 'border-white/15')}>
                {[semi, privado].map((f) => (
                  <div key={f.etiqueta} className="flex flex-col-reverse justify-end">
                    <dt className={cx('mt-2 text-[0.8125rem] leading-snug', i === 2 ? 'text-navy-sub' : 'text-white/70')}>{f.etiqueta}</dt>
                    <dd className="text-[2.5rem] font-bold leading-none tracking-[-0.03em]">{f.valores[i]}</dd>
                  </div>
                ))}
              </dl>
              <p className={cx('mt-auto border-t pt-4 text-sm font-semibold', i === 2 ? 'border-linea' : 'border-white/15')}>
                <span className={cx('block text-xs font-normal', i === 2 ? 'text-navy-soft' : 'text-white/60')}>{extra.etiqueta}</span>
                {extra.valores[i]}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-[56rem] text-sm text-white/65">{COMISION.nota}</p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
          {COMISION.bonos.map((b, i) => (
            <li key={b.titulo} className="revela flex items-start gap-4 rounded-card bg-white/[0.06] p-6 ring-1 ring-white/20" style={{ ['--r' as string]: i }}>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-aqua-claro/15 text-aqua-claro">
                <Gift className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-[1.375rem] font-semibold">
                  {b.cifra} <span className="text-white/80">· {b.titulo}</span>
                </span>
                <span className="mt-1 block text-white/75">{b.texto}</span>
              </span>
            </li>
          ))}
        </ul>
      </Contenedor>
    </section>
  )
}
