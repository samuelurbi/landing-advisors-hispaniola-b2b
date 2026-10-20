import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Texto } from '@/data/b2b'
import { evento } from '@/lib/analitica'
import { REVISION } from '@/lib/movimiento'
import { medio } from '@/lib/medios'

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

/** Dato que falta del cliente: solo se ve en la vista de revisión (VITE_REVISION=1); en producción no se pinta. */
export function Pendiente({ children }: { children: ReactNode }) {
  if (!REVISION) return null
  return (
    <span
      title="Pending: to be confirmed by Hispaniola"
      className="rounded-[4px] border border-dashed border-[#e2b93b] bg-[#fff8df] px-1 text-[#7a5a00] [box-decoration-break:clone]"
    >
      {children}
    </span>
  )
}

export function T({ t }: { t: Texto | Texto[] }) {
  const lista = Array.isArray(t) ? t : [t]
  return (
    <>
      {lista.map((x, i) =>
        typeof x === 'string' ? <span key={i}>{x}</span> : <Pendiente key={i}>{x.pendiente}</Pendiente>,
      )}
    </>
  )
}

export function Eyebrow({ children, claro, className }: { children: ReactNode; claro?: boolean; className?: string }) {
  return (
    <p
      className={cx(
        'text-eyebrow font-semibold uppercase tracking-[0.12em]',
        claro ? 'text-aqua-claro' : 'text-aqua-dark',
        className,
      )}
    >
      {children}
    </p>
  )
}

export function Contenedor({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-contenido px-5 sm:px-10', className)}>{children}</div>
}

/** <img> con variante de 800 px para móvil (generadas por scripts/medios.sh). */
export function Foto({
  nombre,
  alt,
  className,
  sizes = '(max-width: 640px) 100vw, 50vw',
  prioridad,
}: {
  nombre: string
  alt: string
  className?: string
  sizes?: string
  prioridad?: boolean
}) {
  return (
    <img
      src={medio(`/fotos/${nombre}.webp`)}
      srcSet={medio(`/fotos/${nombre}-800.webp 800w, /fotos/${nombre}.webp 1600w`)}
      sizes={sizes}
      alt={alt}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  )
}

type BotonProps = ComponentPropsWithoutRef<'a'> & {
  variante?: 'coral' | 'vidrio' | 'navy' | 'contorno'
  tam?: 'md' | 'lg'
  flecha?: boolean
  rastreo?: string
}

export function Boton({ variante = 'coral', tam = 'md', flecha, rastreo, className, children, onClick, ...p }: BotonProps) {
  return (
    <a
      {...p}
      onClick={(e) => {
        if (rastreo) evento('partner_cta_click', { location: rastreo })
        onClick?.(e)
      }}
      className={cx(
        'group inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background-color,translate,box-shadow,color] duration-200',
        tam === 'lg' ? 'h-14 rounded-btn px-8 text-base' : 'h-11 rounded-full px-5 text-sm',
        variante === 'coral' && 'bg-coral-boton text-white hover:bg-coral-boton-hover',
        variante === 'coral' && tam === 'lg' && 'hover:-translate-y-0.5',
        variante === 'vidrio' && 'vidrio text-white hover:bg-white/20',
        variante === 'navy' && 'bg-navy text-white hover:bg-[#123461]',
        variante === 'contorno' && 'border border-linea-fuerte bg-white text-navy hover:border-navy',
        className,
      )}
    >
      {children}
      {flecha && <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
    </a>
  )
}
