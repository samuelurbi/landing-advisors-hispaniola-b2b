import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { OPERADOR, num } from '@/data/b2b'
import { evento } from '@/lib/analitica'
import { useAutoavance, useEnPantalla, useReducido } from '@/lib/movimiento'
import { Boton, Contenedor, Eyebrow, Foto, T, cx } from './ui'
import { medio } from '@/lib/medios'

// El timón de hitos. El timón (render de Codex) gira arrastrándolo con el ratón o
// el dedo, con las flechas del teclado, con los botones o con los puntos, y encaja
// en uno de los cuatro hitos con un muelle. Cada hito cambia la foto de fondo, el
// año grande y el texto. Gira solo cada 5 s hasta que alguien lo toca; se para
// fuera de pantalla y con movimiento reducido.

const N = OPERADOR.hitos.length
const PASO = 360 / N
const indice = (angulo: number) => (((Math.round(-angulo / PASO) % N) + N) % N)

export function Operador() {
  const seccion = useRef<HTMLElement>(null)
  const rueda = useRef<HTMLDivElement>(null)
  const [angulo, setAngulo] = useState(0)
  const [arrastrando, setArrastrando] = useState(false)
  const [tocado, setTocado] = useState(false)
  const reducido = useReducido()
  const visible = useEnPantalla(seccion)
  const arrastre = useRef<{ inicio: number; base: number; movido: boolean } | null>(null)
  const actual = indice(angulo)
  const hito = OPERADOR.hitos[actual]

  const ir = useCallback((destino: number, porUsuario: boolean) => {
    setAngulo((a) => {
      const ahora = indice(a)
      let d = destino - ahora
      if (d > N / 2) d -= N
      if (d < -N / 2) d += N
      return Math.round(a / PASO) * PASO - d * PASO
    })
    if (porUsuario) {
      setTocado(true)
      evento('milestone_open', { n: destino + 1 })
    }
  }, [])

  const avanzar = useCallback(() => ir((indice(angulo) + 1) % N, false), [angulo, ir])
  useAutoavance(visible && !tocado && !reducido && !arrastrando, 5000, avanzar)

  const anguloPuntero = (e: PointerEvent) => {
    const r = rueda.current!.getBoundingClientRect()
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI
  }
  function bajar(e: PointerEvent<HTMLDivElement>) {
    // En táctil, el gesto vertical sigue siendo scroll (touch-action: pan-y en CSS).
    rueda.current?.setPointerCapture(e.pointerId)
    arrastre.current = { inicio: anguloPuntero(e), base: angulo, movido: false }
    setArrastrando(true)
  }
  function mover(e: PointerEvent<HTMLDivElement>) {
    const a = arrastre.current
    if (!a) return
    let d = anguloPuntero(e) - a.inicio
    if (d > 180) d -= 360
    if (d < -180) d += 360
    if (Math.abs(d) > 2) a.movido = true
    setAngulo(a.base + d)
  }
  function soltar() {
    const a = arrastre.current
    arrastre.current = null
    setArrastrando(false)
    if (!a) return
    const destino = indice(angulo)
    setAngulo(Math.round(angulo / PASO) * PASO)
    if (a.movido) {
      setTocado(true)
      evento('milestone_open', { n: destino + 1 })
    }
  }
  function teclas(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ir((actual + 1) % N, true)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ir((actual + N - 1) % N, true)
    else if (e.key === 'Home') ir(0, true)
    else if (e.key === 'End') ir(N - 1, true)
    else return
    e.preventDefault()
  }

  return (
    <section
      id="operator"
      ref={seccion}
      data-capitulo="operator"
      aria-labelledby="operador-titulo"
      className="relative isolate overflow-hidden bg-white py-seccion-sm sm:py-seccion"
    >

      <Contenedor className="grid items-center gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]">
        <div className="min-w-0 lg:self-end">
          <div className="revela max-w-[38rem]">
            <Eyebrow>{num('operator')} · {OPERADOR.capitulo}</Eyebrow>
            <h2 id="operador-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
              {OPERADOR.titulo}
            </h2>
            <p className="mt-5 text-lead text-navy-sub">{OPERADOR.lead}</p>
          </div>

        </div>

        {/* El timón */}
        <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-[26rem] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-none">
          <div aria-hidden className="timon-ondas" />
          <span aria-hidden className="timon-indicador" />
          <div
            ref={rueda}
            role="slider"
            tabIndex={0}
            aria-label="Helm of milestones. Turn it, or use the arrow keys."
            aria-valuemin={1}
            aria-valuemax={N}
            aria-valuenow={actual + 1}
            aria-valuetext={`${hito.grande}: ${hito.titulo}`}
            onPointerDown={bajar}
            onPointerMove={mover}
            onPointerUp={soltar}
            onPointerCancel={soltar}
            onKeyDown={teclas}
            className={cx('timon relative aspect-square w-full select-none', arrastrando ? 'cursor-grabbing' : 'cursor-grab')}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `rotate(${angulo}deg)`,
                transition: arrastrando || reducido ? 'none' : 'transform 900ms cubic-bezier(0.34, 1.45, 0.5, 1)',
              }}
            >
              <img
                src={medio('/ilustraciones/timon.webp')}
                srcSet={medio('/ilustraciones/timon-480.webp 480w, /ilustraciones/timon.webp 900w')}
                sizes="(min-width: 1024px) 32rem, 80vw"
                alt=""
                draggable={false}
                loading="lazy"
                className="absolute inset-0 size-full drop-shadow-[0_24px_30px_rgb(11_37_69/0.22)]"
              />
              {OPERADOR.hitos.map((h, i) => (
                <span
                  key={h.perilla}
                  className="timon-perilla"
                  style={{ ['--a' as string]: `${i * PASO}deg`, ['--contra' as string]: `${-(angulo + i * PASO)}deg` }}
                >
                  <span className={cx('timon-perilla-texto', i === actual && 'timon-perilla-texto--activa')}>{h.perilla}</span>
                </span>
              ))}
            </div>
            <div className="timon-cubo" aria-hidden>
              <img src={medio('/marca/logotipo-blanco.webp')} alt="" width={900} height={271} className="w-[78%]" />
            </div>
          </div>
          <p className="mt-6 text-center text-eyebrow font-semibold uppercase tracking-[0.18em] text-navy-soft">Turn the helm</p>
        </div>

        <div className="min-w-0 lg:self-start">
          <div aria-live="polite" className="min-h-[11.5rem] sm:min-h-[13rem]">
            <div key={actual} className="hito-entra grid items-center gap-6 sm:grid-cols-[11rem_minmax(0,1fr)]">
              {/* La foto del hito también en móvil (MA-82 01: la foto del círculo del hito «Story»). */}
              <div className="relative aspect-square w-32 overflow-hidden rounded-full ring-4 ring-aqua-tint sm:w-auto">
                <Foto nombre={hito.foto} alt={hito.alt} sizes="11rem" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-aqua-dark">{hito.eyebrow}</p>
                <p className="hito-grande mt-2 text-[4.25rem] font-bold leading-[0.95] tracking-[-0.04em] sm:text-[5.5rem]">{hito.grande}</p>
                <h3 className="mt-3 text-[1.375rem] font-semibold sm:text-[1.5rem]">{hito.titulo}</h3>
                <p className="mt-2 max-w-[30rem] text-navy-sub">
                  <T t={hito.texto} />
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => ir((actual + N - 1) % N, true)} aria-label="Previous milestone" className="boton-redondo">
                <ArrowLeft className="size-5" />
              </button>
              <div className="flex items-center gap-2" role="group" aria-label="Milestones">
                {OPERADOR.hitos.map((h, i) => (
                  <button
                    key={h.perilla}
                    type="button"
                    onClick={() => ir(i, true)}
                    aria-label={`${h.grande}: ${h.titulo}`}
                    aria-current={i === actual}
                    className={cx('h-1.5 rounded-full transition-[width,background-color] duration-500', i === actual ? 'w-10 bg-coral-boton' : 'w-5 bg-navy/20 hover:bg-navy/40')}
                  />
                ))}
              </div>
              <button type="button" onClick={() => ir((actual + 1) % N, true)} aria-label="Next milestone" className="boton-redondo">
                <ArrowRight className="size-5" />
              </button>
            </div>
            <Boton href="#apply" flecha rastreo="operator">
              {OPERADOR.cta}
            </Boton>
          </div>
        </div>
      </Contenedor>
    </section>
  )
}
