import { useEffect, useState } from 'react'
import { NAV } from '@/data/b2b'
import { Boton, cx } from './ui'
import { medio } from '@/lib/medios'

// Un solo elemento fijo (iteración 2: fuera la barra inferior y el índice lateral, que
// tapaban contenido y repetían el menú).
// - Escritorio: el menú centrado. Sobre el héroe va transparente; al bajar se convierte en
//   la píldora de vidrio claro y suma a su derecha «Become a Partner».
// - Móvil: el logo y el botón se van con el scroll; pasado el héroe aparece una barra fina
//   arriba con el logo y el botón (no tapa lo que se está leyendo, que va al centro).
// La píldora y la barra callan su botón en el formulario y en el pie, que ya tienen el suyo.
export function Cabecera() {
  const [flota, setFlota] = useState(false)
  const [conCta, setConCta] = useState(true)

  useEffect(() => {
    const alBajar = () => setFlota(window.scrollY > window.innerHeight * 0.55)
    alBajar()
    window.addEventListener('scroll', alBajar, { passive: true })
    return () => window.removeEventListener('scroll', alBajar)
  }, [])

  useEffect(() => {
    const vigilados = [document.getElementById('apply'), document.querySelector('footer')].filter((x): x is HTMLElement => !!x)
    const asoma = new Map<Element, boolean>()
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) asoma.set(e.target, e.isIntersecting)
        setConCta(![...asoma.values()].some(Boolean))
      },
      { threshold: 0.15 },
    )
    vigilados.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <header className="absolute inset-x-0 top-0 z-50 px-2 sm:px-3">
      <div className="mx-auto mt-2 flex max-w-contenido items-center justify-between gap-4 px-4 py-4 sm:mt-3 sm:px-10 sm:py-5">
        <a href="#top" aria-label="Hispaniola Aquatic Adventures — back to top" className="block shrink-0">
          <img src={medio('/marca/logotipo-blanco.webp')} alt="" width={900} height={271} className="h-9 w-auto sm:h-11" />
        </a>
        <Boton href="#apply" rastreo="header">
          Become a Partner
        </Boton>
      </div>

      {/* Escritorio: menú fijo; con el CTA cuando flota */}
      <nav
        aria-label="Sections"
        className={cx(
          'fixed left-1/2 z-50 hidden -translate-x-1/2 items-center gap-7 rounded-full border transition-[top,background-color,box-shadow,border-color,padding] duration-500 ease-[cubic-bezier(.22,1,.36,1)] lg:flex',
          flota ? 'vidrio-claro top-[0.8125rem] border-white/70 py-1.5 pl-6 pr-1.5 shadow-card-flotante' : 'top-[2.375rem] border-transparent px-6 py-2.5',
        )}
      >
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className={cx('text-[0.9375rem] font-medium transition-colors', flota ? 'text-navy hover:text-aqua-dark' : 'text-white hover:text-aqua-claro')}
          >
            {n.label}
          </a>
        ))}
        <span className={cx('grid transition-[grid-template-columns,opacity] duration-500', flota && conCta ? 'grid-cols-[1fr] opacity-100' : 'grid-cols-[0fr] opacity-0')}>
          <span className="overflow-hidden">
            <Boton href="#apply" rastreo="nav" className="h-10" tabIndex={flota && conCta ? 0 : -1}>
              Become a Partner
            </Boton>
          </span>
        </span>
      </nav>

      {/* Móvil y tableta: barra fina arriba, solo pasado el héroe */}
      <div
        className={cx(
          'vidrio-claro fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 border-b border-white/70 px-4 py-2 transition-[translate,opacity] duration-500 lg:hidden',
          flota ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0',
        )}
        inert={!flota}
      >
        <a href="#top" aria-label="Back to top" className="block">
          <img src={medio('/marca/logotipo-negro.webp')} alt="" width={900} height={271} className="h-7 w-auto" />
        </a>
        <Boton href="#apply" rastreo="mobile_bar" className={cx('h-9 px-4 transition-opacity', !conCta && 'pointer-events-none opacity-0')} tabIndex={conCta ? 0 : -1}>
          Become a Partner
        </Boton>
      </div>
    </header>
  )
}
