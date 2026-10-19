import { useEffect, useRef, useState } from 'react'
import type { DatosTicket, Ticket as TicketVivo } from '@/lib/ticket3d'
import { cx } from './ui'

// El pase de socio. En el HTML (prerender, sin WebGL o con movimiento reducido) es un
// pase plano que escala con su caja; en el navegador se monta encima el pase de papel
// en 3D (lib/ticket3d.ts, ogl en un chunk aparte) y el plano queda solo para lectores
// de pantalla. Lo usan el héroe y el formulario.

export function Ticket({ datos, alBoton, className }: { datos: DatosTicket; alBoton?: () => void; className?: string }) {
  const caja = useRef<HTMLDivElement>(null)
  const vivo = useRef<TicketVivo | null>(null)
  const ultimo = useRef(datos)
  const [en3d, setEn3d] = useState(false)
  ultimo.current = datos

  useEffect(() => {
    const el = caja.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cancelado = false
    let montado: TicketVivo | null = null
    // Se monta cuando el pase se acerca a la pantalla (el del formulario no carga nada antes).
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const { montarTicket } = await import('@/lib/ticket3d')
        if (cancelado) return
        montado = await montarTicket(el, ultimo.current, { alBoton, zona: el.parentElement ?? el })
        if (cancelado) {
          montado?.destruir()
          return
        }
        vivo.current = montado
        if (montado) setEn3d(true)
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => {
      cancelado = true
      io.disconnect()
      montado?.destruir()
      vivo.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    vivo.current?.actualizar(datos)
  }, [datos])

  const d = datos
  return (
    <div ref={caja} className={cx('ticket-caja', en3d && 'ticket-caja--3d', className)}>
      {/* Pase plano: respaldo visible sin 3D y texto para lectores de pantalla con 3D */}
      <div className="ticket-plano">
        <div className="ticket-plano-cuerpo">
          <p className="ticket-micro">
            <strong>{d.titulo}</strong> · {d.sub}
          </p>
          <div className="ticket-plano-ruta">
            <p>
              <span className="ticket-micro">From</span>
              <span className="ticket-codigo">{d.de.codigo}</span>
              <span className="ticket-nota">{d.de.nota}</span>
            </p>
            <p className="text-right">
              <span className="ticket-micro">To</span>
              <span className="ticket-codigo">{d.a.codigo}</span>
              <span className="ticket-nota">{d.a.nota}</span>
            </p>
          </div>
          <dl className="ticket-plano-filas">
            {d.filas.map(([k, v]) => (
              <div key={k}>
                <dt className="ticket-micro">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="ticket-plano-talon">
          <span className="ticket-micro">{d.talon.arriba}</span>
          <span className="ticket-talon-grande">{d.talon.grande}</span>
          <span className="ticket-nota">{d.talon.abajo}</span>
        </div>
      </div>
    </div>
  )
}
