import { useEffect, useRef, useState } from 'react'
import { REPUTACION, num } from '@/data/b2b'
import { useReducido, useUnaVez } from '@/lib/movimiento'
import { Contenedor, Eyebrow, cx } from './ui'
import { Estrellas } from './Insignia'

// Reputación con fecha de lectura (7 oct 2026), en blanco y sin fotos de fondo: tres notas
// grandes en fila (cuentan hacia arriba y su filete se dibuja al asomar) y el anillo del 96.5 %.
// Punto 14: TripAdvisor con su logo oficial (lockup horizontal, nunca por debajo de 20 px de alto,
// sin deformar ni recolorear); Google no permite su logo y Viator no tiene centro de marca, así que
// van con el nombre en texto. Los distintivos sin comprobar se quitaron (ajuste 4).

function Plataforma({ nombre, className }: { nombre: string; className?: string }) {
  if (nombre === 'TripAdvisor')
    return <img src="/marca/tripadvisor-logo.svg" alt="Tripadvisor" width={131} height={20} className={cx('h-5 w-auto max-w-none', className)} />
  return <span className={className}>{nombre}</span>
}

/** Círculos de TripAdvisor con relleno fraccionario (4.9 → el 5.º al 90 %). */
function Burbujas({ valor }: { valor: number }) {
  return (
    <span className="flex gap-1" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const p = Math.round(Math.min(Math.max(valor - i, 0), 1) * 100)
        return (
          <span key={i} className="relative size-4 overflow-hidden rounded-full border-2 border-[#00af87]">
            <span className="absolute inset-y-0 left-0 bg-[#00af87]" style={{ width: `${p}%` }} />
          </span>
        )
      })}
    </span>
  )
}

function Contador({ valor, decimales = 1, activo }: { valor: number; decimales?: number; activo: boolean }) {
  const reducido = useReducido()
  const [n, setN] = useState(valor)
  useEffect(() => {
    if (!activo || reducido) return
    let raf = 0
    const t0 = performance.now()
    const paso = (t: number) => {
      const k = Math.min((t - t0) / 1400, 1)
      setN(valor * (1 - Math.pow(1 - k, 3)))
      if (k < 1) raf = requestAnimationFrame(paso)
    }
    setN(0)
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [activo, reducido, valor])
  return <>{n.toFixed(decimales)}</>
}

export function Reputacion() {
  const rejilla = useRef<HTMLDivElement>(null)
  const visto = useUnaVez(rejilla, 0.35)
  const a = REPUTACION.anillo
  return (
    <section id="proof" data-capitulo="proof" aria-labelledby="reputacion-titulo" className="bg-white py-seccion-sm sm:py-seccion">
      <Contenedor>
        <div className="revela mx-auto max-w-[46rem] text-center">
          <Eyebrow>
            {num('proof')} · {REPUTACION.capitulo}
          </Eyebrow>
          <h2 id="reputacion-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
            {REPUTACION.titulo}
          </h2>
          <p className="mt-4 text-lead text-navy-sub">{REPUTACION.lead}</p>
        </div>

        <div ref={rejilla} className={cx('mt-10 sm:mt-14', visto && 'reputacion--vista')}>
          <div className="grid grid-cols-[1.45fr_1fr_1fr] gap-3 sm:grid-cols-3 sm:gap-8">
            {REPUTACION.tarjetas.map((t, i) => (
              <div key={t.plataforma} className="nota-plataforma min-w-0" style={{ ['--i' as string]: i }}>
                <p className="flex h-6 items-center text-base font-semibold sm:text-lg">
                  <Plataforma nombre={t.plataforma} />
                </p>
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-[2.5rem] font-bold leading-none tracking-[-0.04em] sm:text-[3.75rem]">
                    <Contador valor={t.valor} activo={visto} />
                  </span>
                  <span className="text-lg text-navy-soft">/5</span>
                </p>
                <div className="mt-4">{t.glifo === 'burbuja' ? <Burbujas valor={t.valor} /> : <Estrellas calificacion={t.valor} />}</div>
                <p className="mt-3 text-sm font-semibold sm:text-base">{t.detalle}</p>
                <p className="mt-1 text-xs text-navy-soft sm:text-sm">{REPUTACION.leido}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center border-t border-linea pt-8">
            <div className="flex items-center gap-6">
              <div className={cx('anillo relative size-36 shrink-0', visto && 'visible')} style={{ ['--valor' as string]: a.valor }}>
                <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden>
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-linea)" strokeWidth="2.5" />
                  <circle className="anillo-arco" cx="18" cy="18" r="15.9155" fill="none" stroke="#00af87" strokeWidth="2.5" strokeLinecap="round" pathLength={100} />
                </svg>
                <span className="absolute inset-0 grid place-items-center text-[1.75rem] font-bold tracking-tight">
                  <span>
                    <Contador valor={a.valor} activo={visto} />%
                  </span>
                </span>
              </div>
              <div>
                <p className="flex items-center">
                  <Plataforma nombre={a.plataforma} />
                </p>
                <p className="mt-2 text-[1.25rem] font-semibold">{a.titulo}</p>
                <p className="mt-1 text-sm text-navy-soft">{a.detalle}</p>
              </div>
            </div>

          </div>
          <p className="mt-10 text-center text-sm text-navy-soft">{REPUTACION.nota}</p>
        </div>
      </Contenedor>
    </section>
  )
}
