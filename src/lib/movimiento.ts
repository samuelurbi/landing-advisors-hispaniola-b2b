import { useEffect, useState, type RefObject } from 'react'

/** Variante de la propuesta: B (por defecto, la publicada) = con kit, referidos y FAQ; A (VITE_VARIANTE=a) = fiel a la vista previa. */
export const VARIANTE: 'a' | 'b' = import.meta.env.VITE_VARIANTE === 'a' ? 'a' : 'b'

/** prefers-reduced-motion, reactivo. En el servidor (prerender) cuenta como «sin preferencia». */
export function useReducido() {
  const [reducido, setReducido] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducido(mq.matches)
    const cambio = () => setReducido(mq.matches)
    mq.addEventListener('change', cambio)
    return () => mq.removeEventListener('change', cambio)
  }, [])
  return reducido
}

/** ¿El elemento está (al menos un poco) en pantalla? Sirve para pausar lo que se mueve solo. */
export function useEnPantalla(ref: RefObject<Element | null>, margen = '0px') {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: margen })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margen])
  return visible
}

/** Se activa una vez, la primera vez que el elemento entra en pantalla (para contadores y secuencias). */
export function useUnaVez(ref: RefObject<Element | null>, umbral = 0.3) {
  const [visto, setVisto] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setVisto(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisto(true)
          io.disconnect()
        }
      },
      { threshold: umbral },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, umbral])
  return visto
}

/**
 * Avance automático (carruseles, timón, día del huésped): cada `ms` llama a `paso`,
 * solo si está en pantalla, la pestaña visible, sin movimiento reducido y sin pausa.
 */
export function useAutoavance(activo: boolean, ms: number, paso: () => void) {
  useEffect(() => {
    if (!activo) return
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') paso()
    }, ms)
    return () => window.clearInterval(t)
  }, [activo, ms, paso])
}

/**
 * Vista de revisión (VITE_REVISION=1 al compilar): muestra los textos pendientes marcados en amarillo.
 * En producción (sin la variable) los pendientes no se pintan (ajuste 2 de Hispaniola, 15 oct 2026).
 */
export const REVISION = import.meta.env.VITE_REVISION === '1'
