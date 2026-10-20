import { useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'
import { MARCA, SOLICITUD, num } from '@/data/b2b'
import { evento } from '@/lib/analitica'
import { enviarFormulario } from '@/lib/enviar'
import type { DatosTicket } from '@/lib/ticket3d'
import { Eyebrow, Pendiente, cx } from './ui'
import { Ticket } from './Ticket'

// «Start a Partnership Conversation». A la izquierda, el pase de socio se rellena
// mientras escriben (empresa, nombre, país, tipo) y sella «Ready» al completar lo
// obligatorio. Campos y honeypot según 01-LEER-PRIMERO §6. A analítica solo van
// país y tipo de negocio: nombre y email nunca.

type Errores = Record<string, string>
type Borrador = { nombre: string; empresa: string; email: string; pais: string; tipo: string; consentimiento: boolean }

const campoBase =
  'h-12 w-full rounded-btn border bg-white px-4 text-[0.9375rem] text-navy outline-none transition-[border-color,box-shadow] placeholder:text-navy-soft/70 focus:border-aqua focus:ring-4 focus:ring-aqua/15'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function Campo({ id, etiqueta, opcional, error, children, className }: { id: string; etiqueta: string; opcional?: boolean; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {etiqueta}
        {opcional && <span className="ml-1 font-normal text-navy-soft">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-coral-boton">
          {error}
        </p>
      )}
    </div>
  )
}

function validar(d: FormData): Errores {
  const e: Errores = {}
  const txt = (k: string) => String(d.get(k) ?? '').trim()
  if (!txt('nombre')) e.nombre = 'Please enter your full name.'
  if (!txt('empresa')) e.empresa = 'Please enter your company name.'
  if (!txt('email')) e.email = 'Please enter your business email.'
  else if (!EMAIL.test(txt('email'))) e.email = 'Please enter a valid email address.'
  if (!txt('pais')) e.pais = 'Please choose your country.'
  if (!txt('tipo')) e.tipo = 'Please choose your business type.'
  if (d.get('consentimiento') !== 'on') e.consentimiento = 'Please confirm we may contact you.'
  return e
}

export function Solicitud() {
  const [errores, setErrores] = useState<Errores>({})
  const [estado, setEstado] = useState<'libre' | 'enviando' | 'hecho' | 'fallo'>('libre')
  const [b, setB] = useState<Borrador>({ nombre: '', empresa: '', email: '', pais: '', tipo: '', consentimiento: false })
  const formRef = useRef<HTMLFormElement>(null)
  const empezado = useRef(false)
  // Antispam: el servidor rechaza envíos hechos a menos de 3 s de ver el formulario.
  const visto = useRef(Date.now())
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`

  const hechos = [b.nombre.trim() && b.empresa.trim(), EMAIL.test(b.email.trim()), b.pais && b.tipo, b.consentimiento].filter(Boolean).length
  const listo = hechos === 4

  // El pase de papel se rellena mientras escriben; al completar lo obligatorio se sella.
  const ticket = useMemo<DatosTicket>(() => {
    const empresa = b.empresa.trim()
    return {
      titulo: 'PARTNER PASS',
      sub: 'HISPANIOLA AQUATIC ADVENTURES',
      de: { codigo: empresa ? empresa.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'YOU' : 'YOU', nota: empresa || 'Your company' },
      a: { codigo: 'PUJ', nota: 'Punta Cana, DR' },
      filas: [
        ['TYPE', b.tipo || '—'],
        ['REGION', b.pais || '—'],
        ['CONTACT', b.nombre.trim() || '—'],
        ['STATUS', listo ? 'Ready' : 'Draft'],
      ],
      anfitrion: ['HOST', 'Hispaniola Aquatic Adventures'],
      clase: ['CLASS', 'Commercial partner'],
      pie: ['HAA · PUNTA CANA', 'PARTNER INQUIRY'],
      talon: { arriba: 'YOUR PASS', grande: `${hechos}/4`, abajo: listo ? 'ready to sail' : 'steps done' },
      sello: listo ? 'READY TO SAIL' : undefined,
    }
  }, [b, hechos, listo])

  function cambio(e: FormEvent<HTMLFormElement>) {
    const t = e.target as HTMLInputElement
    if (!empezado.current) {
      empezado.current = true
      evento('form_start')
    }
    if (t.name in b) setB((x) => ({ ...x, [t.name]: t.type === 'checkbox' ? t.checked : t.value }))
  }

  async function enviar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const d = new FormData(ev.currentTarget)
    // Honeypot: un bot rellena el campo oculto; se finge éxito y no se envía nada.
    if (String(d.get('sitio_web') ?? '')) {
      setEstado('hecho')
      return
    }
    const e = validar(d)
    setErrores(e)
    if (Object.keys(e).length) {
      evento('form_error', { fields: Object.keys(e).join(',') })
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)?.focus()
      return
    }
    setEstado('enviando')
    const datos: Record<string, unknown> = {}
    d.forEach((v, k) => {
      if (k === 'sitio_web') return
      if (k === 'intereses' || k === 'barcos') datos[k] = d.getAll(k)
      else datos[k] = v
    })
    delete datos.consentimiento
    datos.novedades = d.get('novedades') === 'on'
    try {
      await enviarFormulario(datos, { consentimiento: true, hp: '', ms: Date.now() - visto.current })
      // Solo cuando el servidor confirma (guardado y aviso enviados).
      evento('form_submit_success', { country: datos.pais, business_type: datos.tipo, interests: (datos.intereses as string[]).join(',') })
      setEstado('hecho')
    } catch {
      setEstado('fallo')
    }
  }

  const err = (k: string) => (errores[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${id(k)}-error` } : {})
  const borde = (k: string) => (errores[k] ? 'border-coral' : 'border-linea-fuerte')
  const c = SOLICITUD.campos

  return (
    <section id="apply" data-capitulo="apply" aria-labelledby="solicitud-titulo" className="relative isolate overflow-hidden bg-aqua-tint py-seccion-sm sm:py-seccion">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_0%_0%,rgb(169_229_238/55%),transparent_70%)]" />
      <div className="mx-auto grid w-full max-w-contenido gap-10 px-5 sm:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="revela lg:sticky lg:top-24 lg:self-start">
          <Eyebrow>{num('apply')} · {SOLICITUD.capitulo}</Eyebrow>
          <h2 id="solicitud-titulo" className="mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem]">
            {SOLICITUD.titulo}
          </h2>
          <p className="mt-4 text-lead text-navy-sub">{SOLICITUD.lead}</p>

          <Ticket datos={ticket} className="mt-8 hidden w-full max-w-[30rem] sm:block" />
          <ul className="mt-6 hidden gap-2 text-sm text-navy-sub sm:grid">
            {SOLICITUD.checklist.map((x, i) => (
              <li key={x} className="flex items-center gap-2.5">
                <span className={cx('grid size-5 place-items-center rounded-full border-2 transition-colors', i < hechos ? 'border-menta-texto bg-menta-texto text-white' : 'border-linea-fuerte')}>
                  {i < hechos && <CheckCircle2 className="size-3" aria-hidden />}
                </span>
                {x}
              </li>
            ))}
          </ul>
        </div>

        <div className="revela rounded-card-grande bg-white p-5 ring-1 ring-linea sm:p-8" style={{ ['--r' as string]: 1 }}>
          {estado === 'hecho' ? (
            <div role="status" className="flex flex-col items-start py-10">
              <CheckCircle2 className="size-12 text-menta-texto" strokeWidth={1.5} />
              <h3 className="mt-5 text-2xl font-semibold">{SOLICITUD.exito.titulo}</h3>
              <p className="mt-2 text-navy-sub">{SOLICITUD.exito.texto}</p>
            </div>
          ) : (
            <form
              ref={formRef}
              action="/api/enviar.php"
              method="post"
              noValidate
              onSubmit={enviar}
              onChange={cambio}
              className="grid gap-5 sm:grid-cols-2"
              // WebMCP declarativo: un agente puede rellenarlo; el envío lo hace la persona.
              {...{
                toolname: 'start_partnership_conversation',
                tooldescription:
                  'Fill in a partnership inquiry for Hispaniola Aquatic Adventures (name, company, business email, country, business type, areas of interest). Leaves the form ready for the person to review and submit.',
              }}
            >
              <Campo id={id('nombre')} etiqueta={c.nombre} error={errores.nombre}>
                <input id={id('nombre')} name="nombre" autoComplete="name" className={cx(campoBase, borde('nombre'))} {...err('nombre')} />
              </Campo>
              <Campo id={id('empresa')} etiqueta={c.empresa} error={errores.empresa}>
                <input id={id('empresa')} name="empresa" autoComplete="organization" className={cx(campoBase, borde('empresa'))} {...err('empresa')} />
              </Campo>
              <Campo id={id('email')} etiqueta={c.email} error={errores.email}>
                <input id={id('email')} name="email" type="email" autoComplete="email" inputMode="email" className={cx(campoBase, borde('email'))} {...err('email')} />
              </Campo>
              <Campo id={id('telefono')} etiqueta={c.telefono} opcional>
                <input id={id('telefono')} name="telefono" type="tel" autoComplete="tel" className={cx(campoBase, 'border-linea-fuerte')} />
              </Campo>
              <Campo id={id('pais')} etiqueta={c.pais} error={errores.pais}>
                <div className="relative">
                  <select id={id('pais')} name="pais" defaultValue="" className={cx(campoBase, 'appearance-none pr-10', borde('pais'))} {...err('pais')}>
                    <option value="" disabled>
                      Choose…
                    </option>
                    {SOLICITUD.paises.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-navy-soft" />
                </div>
              </Campo>
              <Campo id={id('tipo')} etiqueta={c.tipo} error={errores.tipo}>
                <div className="relative">
                  <select id={id('tipo')} name="tipo" defaultValue="" className={cx(campoBase, 'appearance-none pr-10', borde('tipo'))} {...err('tipo')}>
                    <option value="" disabled>
                      Choose…
                    </option>
                    {SOLICITUD.tipos.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-navy-soft" />
                </div>
              </Campo>

              <fieldset className="sm:col-span-2">
                <legend className="mb-2 text-sm font-semibold">
                  {c.intereses}
                  <span className="ml-1 font-normal text-navy-soft">(optional)</span>
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {SOLICITUD.intereses.map((m) => (
                    <label
                      key={m}
                      className="flex cursor-pointer items-center gap-2.5 rounded-full border border-linea-fuerte px-4 py-2.5 text-[0.9375rem] font-medium transition-colors has-[:checked]:border-aqua has-[:checked]:bg-aqua-tint has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-aqua/20"
                    >
                      <input type="checkbox" name="intereses" value={m} className="size-4 accent-aqua-dark" />
                      {m}
                    </label>
                  ))}
                </div>
              </fieldset>

              <details className="group sm:col-span-2">
                <summary className="flex w-fit cursor-pointer list-none items-center gap-2 text-sm font-semibold text-aqua-dark [&::-webkit-details-marker]:hidden">
                  <ChevronDown className="size-4 -rotate-90 transition-transform group-open:rotate-0" aria-hidden />
                  {c.barcos}
                  <span className="font-normal text-navy-soft">(optional)</span>
                </summary>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {SOLICITUD.barcos.map((m) => (
                    <label
                      key={m}
                      className="flex cursor-pointer items-center gap-2 rounded-full border border-linea-fuerte px-3.5 py-2 text-sm font-medium has-[:checked]:border-aqua has-[:checked]:bg-aqua-tint"
                    >
                      <input type="checkbox" name="barcos" value={m} className="size-4 accent-aqua-dark" />
                      {m}
                    </label>
                  ))}
                </div>
              </details>

              <Campo id={id('referido')} etiqueta={SOLICITUD.referido} opcional className="sm:col-span-2 sm:max-w-[calc(50%-0.75rem)]">
                <input id={id('referido')} name="referido" type="text" autoComplete="off" className={cx(campoBase, 'border-linea-fuerte')} />
              </Campo>

              {/* Honeypot: invisible para personas y lectores de pantalla */}
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input name="sitio_web" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-navy-sub">
                  <input type="checkbox" name="consentimiento" className="mt-1 size-4 shrink-0 accent-aqua-dark" {...err('consentimiento')} />
                  <span>
                    {SOLICITUD.consentimiento}{' '}
                    {/* En pestaña nueva: no se pierde lo escrito en el formulario. */}
                    <a href="/privacy/" target="_blank" rel="noopener" className="font-semibold text-navy underline underline-offset-4">
                      {SOLICITUD.politica}
                    </a>
                    .{' '}
                    <Pendiente>{SOLICITUD.consentimientoPendiente}</Pendiente>
                  </span>
                </label>
                {errores.consentimiento && (
                  <p id={`${id('consentimiento')}-error`} className="mt-1.5 text-sm text-coral-boton">
                    {errores.consentimiento}
                  </p>
                )}
                <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-navy-sub">
                  <input type="checkbox" name="novedades" className="mt-1 size-4 shrink-0 accent-aqua-dark" />
                  <span>{SOLICITUD.novedades}</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={estado === 'enviando'}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-btn bg-coral-boton px-8 text-base font-semibold text-white transition-[background-color,translate] hover:-translate-y-0.5 hover:bg-coral-boton-hover disabled:opacity-70"
                >
                  {estado === 'enviando' && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  {SOLICITUD.cta}
                </button>
                <p aria-live="polite" className="mt-3 text-sm text-coral-boton">
                  {/* Salida si falla el guardado o el aviso: nunca un «enviado» falso. */}
                  {estado === 'fallo' && (
                    <>
                      {SOLICITUD.fallo}{' '}
                      <a href={`https://wa.me/${MARCA.whatsappSocios}?text=${encodeURIComponent(SOLICITUD.falloWhatsappTexto)}`} target="_blank" rel="noopener" className="font-semibold text-navy underline underline-offset-4">
                        {SOLICITUD.falloWhatsapp}
                      </a>{' '}
                      · <a href={`mailto:${MARCA.emailSocios}`} className="font-semibold text-navy underline underline-offset-4">{MARCA.emailSocios}</a>
                    </>
                  )}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

