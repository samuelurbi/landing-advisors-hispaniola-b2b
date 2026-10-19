import { useEffect, useRef } from 'react'
import { CloudRain, FileText, Headset, Sun } from 'lucide-react'
import { CONFIANZA, num } from '@/data/b2b'
import { evento } from '@/lib/analitica'
import { useUnaVez } from '@/lib/movimiento'
import { Contenedor, Eyebrow, T, cx } from './ui'

// Cuatro compromisos, sin cajas: columnas separadas por filetes que se encienden en
// secuencia al entrar (la línea de arriba se llena y el icono se ilumina). Vive en el
// tramo «bajo el agua»: fondo transparente sobre el navy continuo.

const ICONOS = { clima: CloudRain, sol: Sun, factura: FileText, escritorio: Headset }

export function Confianza() {
  const lista = useRef<HTMLUListElement>(null)
  const visto = useUnaVez(lista, 0.35)
  const avisado = useRef(false)
  useEffect(() => {
    if (visto && !avisado.current) {
      avisado.current = true
      evento('confidence_view')
    }
  }, [visto])

  return (
    <section id="confidence" data-capitulo="confidence" aria-labelledby="confianza-titulo" className="py-seccion-sm sm:py-seccion">
      <Contenedor>
        <div className="revela max-w-[46rem]">
          <Eyebrow claro>
            {num('confidence')} · {CONFIANZA.capitulo}
          </Eyebrow>
          <h2 id="confianza-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
            {CONFIANZA.titulo}
          </h2>
          <p className="mt-4 text-lead text-white/75">{CONFIANZA.lead}</p>
        </div>
        <ul ref={lista} className={cx('compromisos mt-10 grid gap-x-10 gap-y-7 sm:mt-14 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4', visto && 'compromisos--vistos')}>
          {CONFIANZA.compromisos.map((c, i) => {
            const Icono = ICONOS[c.icono as keyof typeof ICONOS]
            return (
              <li key={c.titulo} className="compromiso" style={{ ['--i' as string]: i }}>
                <span className="compromiso-icono">
                  <Icono className="size-6" strokeWidth={1.6} aria-hidden />
                </span>
                <h3 className="mt-6 text-[1.25rem] font-semibold">{c.titulo}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/75">
                  <T t={c.texto} />
                </p>
              </li>
            )
          })}
        </ul>
      </Contenedor>
    </section>
  )
}
