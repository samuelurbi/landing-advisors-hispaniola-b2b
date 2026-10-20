// El pase de socio en 3D, que se mueve como PAPEL y no como una tabla. Es la receta del
// «Reef Education & Conservation Tour» de bavaroreefs.org (src/ticket3d.js), portada a ogl
// (ya está en el proyecto y pesa una fracción de three) y con la piel de Hispaniola.
//
// El diseño se dibuja en un canvas 2D y se pega a un plano muy subdividido que el vertex
// shader deforma:
//   1. la curvatura va RETRASADA respecto al giro (el giro sigue al cursor con un muelle);
//   2. el cursor HUNDE un poco el papel bajo la punta y levanta los bordes;
//   3. moverse rápido lo hace ONDEAR, apenas, y se apaga solo.
// Dos formatos: apaisado y VERTICAL en móvil (< 640 px de ventana). Sin WebGL o con
// movimiento reducido queda el pase HTML de respaldo. Sin sombra proyectada: el papel
// se lee por su propia luz (la sombra sobraba en el héroe).

import { Mesh, Plane, Program, Raycast, Renderer, Texture, Transform, Camera, Vec2 } from 'ogl'
import { medio } from './medios'

export type DatosTicket = {
  titulo: string
  sub: string
  de: { codigo: string; nota: string }
  a: { codigo: string; nota: string }
  filas: [string, string][]
  anfitrion: [string, string]
  clase: [string, string]
  pie: [string, string]
  talon: { arriba: string; grande: string; abajo: string; boton?: string }
  sello?: string
}

const H_ = { tw: 2048, th: 1152, pw: 1.78, ph: 1.0, corte: 1560, btn: { x: 1594, y: 935, w: 420, h: 120 } }
const V_ = { tw: 1152, th: 2048, pw: 1.0, ph: 1.78, corte: 1560, btn: { x: 470, y: 1820, w: 590, h: 130 } }
type Formato = typeof H_

const NAVY = '#0b2545'
const CORAL = '#e5513b'
const AQUA = '#a9e5ee'
const F = 'Poppins, sans-serif'

// La forma del papel, compartida por la posición y por la normal (diferencias finitas):
// así no hace falta dFdx y funciona igual en WebGL1.
const ALTURA = /* glsl */ `
uniform float uT, uPress, uBendX, uBendY, uFlutter;
uniform vec2 uPtr;
float altura(vec2 q) {
  float x = q.x, y = q.y, z = 0.0;
  z += uBendX * x * x * 0.55;
  z += uBendY * y * y * 0.9;
  vec2 d = q - uPtr;
  z -= uPress * 0.065 * exp(-dot(d, d) * 4.5);
  z += uPress * 0.026 * (x * x * 0.6 + y * y);
  float r = length(d);
  z += uPress * 0.009 * sin(r * 13.0 - uT * 5.0) * exp(-r * 2.4);
  z += 0.009 * sin(x * 2.6 + uT * 1.1) * cos(y * 3.1 + uT * 0.8);
  z += uFlutter * 0.034 * sin(x * 7.0 - uT * 8.0) * smoothstep(0.05, 0.85, abs(x));
  return z;
}`

const VERT = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelMatrix, viewMatrix, projectionMatrix;
uniform mat3 normalMatrix;
${ALTURA}
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vec3 p = position;
  float e = 0.004;
  float z = altura(p.xy);
  float zx = altura(p.xy + vec2(e, 0.0)) - z;
  float zy = altura(p.xy + vec2(0.0, e)) - z;
  vNormal = normalize(mat3(modelMatrix) * normalize(vec3(-zx / e, -zy / e, 1.0)));
  p.z += z;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
}`

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vec4 c = texture2D(uMap, vUv);
  if (c.a < 0.02) discard;
  vec3 n = normalize(vNormal);
  vec3 L = normalize(vec3(-0.45, 0.65, 1.0));
  float dif = max(dot(n, L), 0.0);
  float sp = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 36.0) * 0.08;
  gl_FragColor = vec4(c.rgb * (0.7 + 0.36 * dif) + sp, c.a);
}`

// ---------- Dibujo del pase (canvas 2D) ----------

function grano() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const im = g.createImageData(256, 256)
  for (let i = 0; i < im.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 70
    im.data[i] = im.data[i + 1] = im.data[i + 2] = v
    im.data[i + 3] = 255
  }
  g.putImageData(im, 0, 0)
  return c
}

function redondo(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

function txt(g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, peso = 600, color = '#fff', ls = 0, al: CanvasTextAlign = 'left', ancho?: number) {
  g.font = `${peso} ${px}px ${F}`
  try {
    ;(g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${ls}px`
  } catch {
    /* sin letterSpacing en canvas: se dibuja sin espaciado */
  }
  g.fillStyle = color
  g.textAlign = al
  // Si no cabe, se reduce hasta que quepa (nombres de empresa largos en el formulario).
  if (ancho) {
    let p = px
    while (p > 18 && g.measureText(s).width > ancho) {
      p -= 2
      g.font = `${peso} ${p}px ${F}`
    }
  }
  g.fillText(s, x, y)
  try {
    ;(g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
  } catch {
    /* idem */
  }
  g.textAlign = 'left'
}

/** Carta náutica de marca de agua: isóbatas onduladas y una rosa de los vientos fina. */
function carta(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.save()
  g.beginPath()
  g.rect(x, y, w, h)
  g.clip()
  g.strokeStyle = 'rgba(169,229,238,.10)'
  g.lineWidth = 3
  for (let k = 0; k < 14; k++) {
    g.beginPath()
    const base = y + (h / 13) * k
    for (let i = 0; i <= 60; i++) {
      const px = x + (w / 60) * i
      const py = base + Math.sin(i * 0.22 + k * 0.9) * 26 + Math.sin(i * 0.07 + k) * 40
      if (i === 0) g.moveTo(px, py)
      else g.lineTo(px, py)
    }
    g.stroke()
  }
  const cx = x + w * 0.8, cy = y + h * 0.3, r = Math.min(w, h) * 0.28
  g.strokeStyle = 'rgba(169,229,238,.14)'
  g.lineWidth = 3
  g.beginPath()
  g.arc(cx, cy, r, 0, Math.PI * 2)
  g.stroke()
  g.beginPath()
  g.arc(cx, cy, r * 0.82, 0, Math.PI * 2)
  g.stroke()
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const l = i % 4 === 0 ? r : i % 2 === 0 ? r * 0.7 : r * 0.45
    g.beginPath()
    g.moveTo(cx, cy)
    g.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l)
    g.stroke()
  }
  g.restore()
}

function catamaran(g: CanvasRenderingContext2D, x: number, y: number, k: number) {
  g.save()
  g.translate(x, y)
  g.scale(k, k)
  g.fillStyle = '#fff'
  g.beginPath()
  g.moveTo(26, 0)
  g.lineTo(26, 20)
  g.lineTo(9, 20)
  g.closePath()
  g.fill()
  g.fillStyle = AQUA
  g.beginPath()
  g.moveTo(29, 4)
  g.lineTo(29, 20)
  g.lineTo(44, 20)
  g.closePath()
  g.fill()
  g.fillStyle = CORAL
  g.beginPath()
  g.moveTo(2, 23)
  g.lineTo(52, 23)
  g.lineTo(47, 30)
  g.lineTo(7, 30)
  g.closePath()
  g.fill()
  g.restore()
}

function trayecto(g: CanvasRenderingContext2D, x1: number, x2: number, y: number, alto: number, k: number) {
  g.strokeStyle = 'rgba(255,255,255,.55)'
  g.lineWidth = 6
  g.setLineDash([4, 18])
  g.lineCap = 'round'
  g.beginPath()
  g.moveTo(x1, y)
  g.quadraticCurveTo((x1 + x2) / 2, y - alto, x2, y)
  g.stroke()
  g.setLineDash([])
  g.fillStyle = '#fff'
  g.beginPath()
  g.arc(x1, y, 11, 0, 7)
  g.fill()
  g.strokeStyle = CORAL
  g.lineWidth = 8
  g.beginPath()
  g.arc(x2, y, 16, 0, 7)
  g.stroke()
  catamaran(g, (x1 + x2) / 2 - 27 * k, y - alto / 2 - 36 * k, k)
}

function barras(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.fillStyle = 'rgba(255,255,255,.78)'
  let bx = x
  const pat = [3, 2, 6, 3, 2, 4, 9, 2, 3, 5, 2, 7, 3, 3, 2, 6]
  for (let i = 0; bx < x + w; i++) {
    const k = pat[i % pat.length]
    if (i % 2 === 0) g.fillRect(bx, y, k * 3, h)
    bx += k * 3 + 6
  }
}

function sello(g: CanvasRenderingContext2D, t: string, x: number, y: number, k: number) {
  if (k <= 0) return
  k = Math.min(1, k)
  const esc = 1.9 - 0.9 * k
  g.save()
  g.translate(x, y)
  g.rotate(-0.21)
  g.scale(esc, esc)
  g.globalAlpha = 0.95 * k
  g.font = `700 50px ${F}`
  const w = g.measureText(t).width + 80
  g.fillStyle = 'rgba(11,37,69,.86)'
  redondo(g, -w / 2, -54, w, 104, 18)
  g.fill()
  g.strokeStyle = CORAL
  g.lineWidth = 9
  g.stroke()
  txt(g, t, 0, 17, 50, 700, CORAL, 6, 'center')
  g.restore()
}

function boton(g: CanvasRenderingContext2D, b: Formato['btn'], t: string, px: number) {
  g.fillStyle = NAVY
  redondo(g, b.x, b.y, b.w, b.h, b.h / 2)
  g.fill()
  txt(g, t, b.x + b.w / 2, b.y + b.h / 2 + px * 0.36, px, 600, '#fff', 0, 'center')
}

function papel(g: CanvasRenderingContext2D, L: Formato, ruido: HTMLCanvasElement, vertical: boolean) {
  const { tw, th, corte } = L
  g.clearRect(0, 0, tw, th)
  g.save()
  redondo(g, 0, 0, tw, th, 60)
  g.clip()
  const [mx, my, mw, mh] = vertical ? [0, 0, tw, corte] : [0, 0, corte, th]
  const [sx, sy, sw, sh] = vertical ? [0, corte, tw, th - corte] : [corte, 0, tw - corte, th]
  g.fillStyle = NAVY
  g.fillRect(mx, my, mw, mh)
  const lz = g.createRadialGradient(mw * 0.15, -mh * 0.1, 40, mw * 0.15, -mh * 0.1, Math.max(mw, mh) * 0.95)
  lz.addColorStop(0, 'rgba(14,140,156,.38)')
  lz.addColorStop(1, 'rgba(14,140,156,0)')
  g.fillStyle = lz
  g.fillRect(mx, my, mw, mh)
  carta(g, mx, my, mw, mh)
  // Talón coral con ondas grabadas
  g.fillStyle = CORAL
  g.fillRect(sx, sy, sw, sh)
  g.save()
  g.beginPath()
  g.rect(sx, sy, sw, sh)
  g.clip()
  g.strokeStyle = 'rgba(255,255,255,.16)'
  g.lineWidth = 5
  for (let k = 0; k < 12; k++) {
    g.beginPath()
    for (let i = 0; i <= 40; i++) {
      const px = sx + (sw / 40) * i
      const py = sy + sh * 0.55 + k * 34 + Math.sin(i * 0.5 + k * 0.7) * 14
      if (i === 0) g.moveTo(px, py)
      else g.lineTo(px, py)
    }
    g.stroke()
  }
  g.restore()
  g.globalAlpha = 0.07
  g.globalCompositeOperation = 'overlay'
  g.fillStyle = g.createPattern(ruido, 'repeat')!
  g.fillRect(0, 0, tw, th)
  g.globalAlpha = 1
  g.globalCompositeOperation = 'source-over'
  g.restore()
  // Perforación y muescas
  g.strokeStyle = 'rgba(255,255,255,.7)'
  g.lineWidth = 6
  g.setLineDash([22, 18])
  g.beginPath()
  if (vertical) {
    g.moveTo(60, corte)
    g.lineTo(tw - 60, corte)
  } else {
    g.moveTo(corte, 60)
    g.lineTo(corte, th - 60)
  }
  g.stroke()
  g.setLineDash([])
  g.globalCompositeOperation = 'destination-out'
  g.beginPath()
  if (vertical) {
    g.arc(0, corte, 46, 0, 7)
    g.arc(tw, corte, 46, 0, 7)
  } else {
    g.arc(corte, 0, 46, 0, 7)
    g.arc(corte, th, 46, 0, 7)
  }
  g.fill()
  g.globalCompositeOperation = 'source-over'
}

function cabecera(g: CanvasRenderingContext2D, d: DatosTicket, logo: HTMLImageElement | null, x: number, y: number) {
  let tx = x
  if (logo) {
    const h = 96
    const w = (logo.width / logo.height) * h
    g.drawImage(logo, x, y + 6, w, h)
    tx = x + w + 36
    g.fillStyle = 'rgba(255,255,255,.3)'
    g.fillRect(tx - 18, y + 8, 3, h - 6)
  }
  txt(g, d.titulo, tx, y + 56, 44, 700, '#fff', 7)
  txt(g, d.sub, tx, y + 98, 26, 600, AQUA, 4)
}

function dibujarH(cv: HTMLCanvasElement, d: DatosTicket, k: number, ruido: HTMLCanvasElement, logo: HTMLImageElement | null) {
  const g = cv.getContext('2d')!
  const L = H_
  papel(g, L, ruido, false)
  const X = 96, MAIN = L.corte
  cabecera(g, d, logo, X, 62)
  g.fillStyle = 'rgba(255,255,255,.22)'
  g.fillRect(X, 200, MAIN - 2 * X, 3)
  const RX = 1040
  txt(g, 'FROM', X, 280, 32, 600, AQUA, 5)
  txt(g, d.de.codigo, X - 6, 420, 150, 700, '#fff', 2, 'left', 380)
  txt(g, d.de.nota, X, 482, 40, 600, '#fff', 0, 'left', 400)
  txt(g, 'TO', RX, 280, 32, 600, AQUA, 5)
  txt(g, d.a.codigo, RX - 6, 420, 150, 700, '#fff', 2)
  txt(g, d.a.nota, RX, 482, 40, 600, '#fff')
  trayecto(g, 500, 990, 372, 110, 2.4)
  g.strokeStyle = 'rgba(255,255,255,.3)'
  g.lineWidth = 3
  g.setLineDash([10, 12])
  g.beginPath()
  g.moveTo(X, 548)
  g.lineTo(MAIN - X, 548)
  g.stroke()
  g.setLineDash([])
  const cx = [X, 420, 760, 1080]
  d.filas.slice(0, 4).forEach(([kk, v], i) => {
    txt(g, kk, cx[i], 624, 28, 600, AQUA, 4)
    txt(g, v, cx[i], 684, 40, 600, '#fff', 0, 'left', 300)
  })
  txt(g, d.anfitrion[0], X, 780, 28, 600, AQUA, 4)
  txt(g, d.anfitrion[1], X, 836, 38, 600, '#fff', 0, 'left', 900)
  txt(g, d.clase[0], 1080, 780, 28, 600, AQUA, 4)
  txt(g, d.clase[1], 1080, 836, 38, 700, '#ffc2b5', 0, 'left', 380)
  barras(g, X, 930, 960, 120)
  txt(g, d.pie[0], 1100, 1000, 28, 600, 'rgba(255,255,255,.55)', 4)
  txt(g, d.pie[1], 1100, 1046, 28, 600, 'rgba(255,255,255,.55)', 4)
  if (d.sello) sello(g, d.sello, 420, 990, k)
  const SX = MAIN + (L.tw - MAIN) / 2
  txt(g, d.talon.arriba, SX, 130, 30, 600, '#fff', 6, 'center')
  txt(g, d.talon.grande, SX, 250, 92, 700, '#fff', 0, 'center', 420)
  txt(g, d.talon.abajo, SX, 310, 34, 600, 'rgba(255,255,255,.9)', 0, 'center', 420)
  if (d.talon.boton) boton(g, L.btn, d.talon.boton, 38)
}

function dibujarV(cv: HTMLCanvasElement, d: DatosTicket, k: number, ruido: HTMLCanvasElement, logo: HTMLImageElement | null) {
  const g = cv.getContext('2d')!
  const L = V_
  papel(g, L, ruido, true)
  const X = 90, D = L.tw - X
  cabecera(g, d, logo, X, 62)
  g.fillStyle = 'rgba(255,255,255,.22)'
  g.fillRect(X, 200, L.tw - 2 * X, 3)
  txt(g, 'FROM', X, 286, 32, 600, AQUA, 5)
  txt(g, d.de.codigo, X - 6, 420, 136, 700, '#fff', 2, 'left', 400)
  txt(g, d.de.nota, X, 480, 38, 600, '#fff', 0, 'left', 420)
  txt(g, 'TO', D, 286, 32, 600, AQUA, 5, 'right')
  txt(g, d.a.codigo, D + 4, 420, 136, 700, '#fff', 2, 'right')
  txt(g, d.a.nota, D, 480, 38, 600, '#fff', 0, 'right')
  trayecto(g, 390, 760, 580, 70, 1.6)
  g.strokeStyle = 'rgba(255,255,255,.3)'
  g.lineWidth = 3
  g.setLineDash([10, 12])
  g.beginPath()
  g.moveTo(X, 650)
  g.lineTo(D, 650)
  g.stroke()
  g.setLineDash([])
  const C2 = 600
  d.filas.slice(0, 4).forEach(([kk, v], i) => {
    const x = i % 2 === 0 ? X : C2
    const y = i < 2 ? 730 : 890
    txt(g, kk, x, y, 30, 600, AQUA, 5)
    txt(g, v, x, y + 62, 46, 600, '#fff', 0, 'left', 470)
  })
  txt(g, d.anfitrion[0], X, 1050, 30, 600, AQUA, 5)
  txt(g, d.anfitrion[1], X, 1108, 42, 600, '#fff', 0, 'left', D - X)
  txt(g, d.clase[0], X, 1220, 30, 600, AQUA, 5)
  txt(g, d.clase[1], X, 1278, 44, 700, '#ffc2b5', 0, 'left', D - X)
  barras(g, X, 1360, D - X, 110)
  if (d.sello) sello(g, d.sello, 340, 1415, k)
  txt(g, d.talon.arriba, X, 1660, 32, 600, '#fff', 6)
  txt(g, d.talon.grande, X, 1760, 84, 700, '#fff', 0, 'left', 560)
  txt(g, d.talon.abajo, X + 4, 1812, 34, 600, 'rgba(255,255,255,.9)', 0, 'left', 560)
  if (d.talon.boton) boton(g, L.btn, d.talon.boton, 42)
}

function cargar(src: string) {
  return new Promise<HTMLImageElement | null>((ok) => {
    const i = new Image()
    i.decoding = 'async'
    i.crossOrigin = 'anonymous' // en GHL el logo viene de otro dominio (mediateca) y va a WebGL
    i.onload = () => ok(i)
    i.onerror = () => ok(null)
    i.src = src
  })
}

type Muelle = { x: number; v: number; obj: number; k: number; amort: number }
const muelle = (k: number, amort: number): Muelle => ({ x: 0, v: 0, obj: 0, k, amort })
const paso = (s: Muelle) => {
  s.v += (s.obj - s.x) * s.k
  s.v *= s.amort
  s.x += s.v
}

export type Ticket = { actualizar: (d: DatosTicket) => void; destruir: () => void }

/**
 * Monta el pase en `caja` (un div con la proporción del pase). El canvas sobresale de la
 * caja para que la inclinación no se corte. Devuelve null si no hay WebGL.
 */
export async function montarTicket(
  caja: HTMLElement,
  datos: DatosTicket,
  { alBoton = () => {}, zona = caja }: { alBoton?: () => void; zona?: HTMLElement } = {},
): Promise<Ticket | null> {
  const tope = new Promise((ok) => setTimeout(ok, 3000))
  let logo: HTMLImageElement | null = null
  await Promise.race([
    Promise.all([
      document.fonts.load(`600 40px Poppins`).catch(() => {}),
      document.fonts.load(`700 90px Poppins`).catch(() => {}),
      cargar(medio('/marca/logotipo-blanco.webp')).then((i) => (logo = i)),
    ]),
    tope,
  ])

  let renderer: Renderer
  try {
    renderer = new Renderer({ dpr: Math.min(devicePixelRatio || 1, 2), alpha: true, antialias: true, premultipliedAlpha: false })
  } catch {
    return null
  }
  const gl = renderer.gl
  if (!gl) return null
  gl.clearColor(0, 0, 0, 0)
  const cv = gl.canvas as HTMLCanvasElement
  cv.className = 'ticket-3d'
  cv.setAttribute('aria-hidden', 'true')
  caja.appendChild(cv)

  const escena = new Transform()
  const cam = new Camera(gl, { fov: 28, near: 0.1, far: 20 })
  const esVertical = () => window.innerWidth < 640
  let fmt: 'h' | 'v' = esVertical() ? 'v' : 'h'
  let L = fmt === 'v' ? V_ : H_
  const lienzo = document.createElement('canvas')
  lienzo.width = L.tw
  lienzo.height = L.th
  const ruido = grano()
  let d = datos
  let selloK = d.sello ? 0 : 1
  const redibujar = () => (fmt === 'v' ? dibujarV : dibujarH)(lienzo, d, selloK, ruido, logo)
  redibujar()
  const tex = new Texture(gl, { image: lienzo, generateMipmaps: true, anisotropy: 8 })

  const u = {
    uMap: { value: tex },
    uT: { value: 0 },
    uPress: { value: 0 },
    uBendX: { value: 0 },
    uBendY: { value: 0 },
    uFlutter: { value: 0 },
    uPtr: { value: new Vec2(10, 10) },
  }
  const malla = () => new Plane(gl, { width: L.pw, height: L.ph, widthSegments: fmt === 'v' ? 54 : 96, heightSegments: fmt === 'v' ? 96 : 54 })
  const pase = new Mesh(gl, { geometry: malla(), program: new Program(gl, { vertex: VERT, fragment: FRAG, uniforms: u, transparent: true, cullFace: false }) })
  pase.setParent(escena)

  const reformatear = () => {
    const nuevo = esVertical() ? 'v' : 'h'
    if (nuevo === fmt) return
    fmt = nuevo
    L = fmt === 'v' ? V_ : H_
    lienzo.width = L.tw
    lienzo.height = L.th
    redibujar()
    tex.needsUpdate = true
    pase.geometry.remove()
    pase.geometry = malla()
  }

  let W = 0, H = 0
  const ajustar = () => {
    reformatear()
    const r = cv.getBoundingClientRect(), c = caja.getBoundingClientRect()
    if (r.width < 2 || c.width < 2) return
    if (r.width === W && r.height === H) return
    W = r.width
    H = r.height
    renderer.setSize(W, H)
    cam.perspective({ aspect: W / H })
    const fw = (c.width * 0.97) / W, fh = (c.height * 0.97) / H
    const alto = Math.max(L.pw / (fw * (W / H)), L.ph / fh)
    cam.position.set(0, 0, alto / 2 / Math.tan((28 * Math.PI) / 360))
    if (!corriendo) pintar(performance.now())
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const rx = muelle(0.045, 0.84), ry = muelle(0.045, 0.84), pr = muelle(0.06, 0.82), px = muelle(0.15, 0.72), py = muelle(0.15, 0.72)
  let flutter = 0, ultimo = -1e9
  const ray = new Raycast()
  const ndc = new Vec2()
  type Golpe = { uv: Vec2 } | null
  const golpe = (e: PointerEvent): Golpe => {
    const r = cv.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.castMouse(cam, ndc)
    const hits = ray.intersectMeshes([pase], { includeUV: true, cullFace: false })
    const h = hits[0] as (Mesh & { hit?: { uv: Vec2 } }) | undefined
    return h?.hit ? { uv: h.hit.uv } : null
  }
  const enBoton = (h: Golpe) => {
    if (!h || !d.talon.boton) return false
    const b = L.btn, x = h.uv.x * L.tw, y = (1 - h.uv.y) * L.th
    return x > b.x - 20 && x < b.x + b.w + 20 && y > b.y - 20 && y < b.y + b.h + 20
  }
  const mover = (e: PointerEvent) => {
    const c = caja.getBoundingClientRect()
    const nx = ((e.clientX - c.left) / c.width) * 2 - 1
    const ny = -((e.clientY - c.top) / c.height) * 2 + 1
    const vel = Math.hypot(e.movementX || 0, e.movementY || 0)
    flutter = Math.min(0.7, flutter + vel * 0.006)
    ry.obj = Math.max(-1, Math.min(1, nx)) * (fmt === 'v' ? 0.14 : 0.2)
    rx.obj = -Math.max(-1, Math.min(1, ny)) * 0.12
    const h = golpe(e)
    pr.obj = h ? 1 : 0
    if (h) {
      px.obj = (h.uv.x - 0.5) * L.pw
      py.obj = (h.uv.y - 0.5) * L.ph
    }
    zona.style.cursor = enBoton(h) ? 'pointer' : ''
    ultimo = performance.now()
  }
  const salir = () => {
    pr.obj = 0
    zona.style.cursor = ''
  }
  const clic = (e: PointerEvent) => {
    if (enBoton(golpe(e))) alBoton()
  }
  if (!reduce) {
    zona.addEventListener('pointermove', mover, { passive: true })
    zona.addEventListener('pointerleave', salir)
  }
  zona.addEventListener('click', clic as EventListener)

  let corriendo = false, visible = true, raf = 0, selloIni = 0
  const t0 = performance.now()
  const pose = (t: number) => {
    pase.rotation.set(rx.x, ry.x, -0.035)
    u.uT.value = t
    u.uPress.value = pr.x
    u.uPtr.value.set(px.x, py.x)
    u.uBendX.value = (ry.obj - ry.x) * 1.8 + ry.v * 4.5
    u.uBendY.value = (rx.obj - rx.x) * 1.5 + rx.v * 3.8
    u.uFlutter.value = flutter
  }
  function pintar(ahora: number) {
    const t = (ahora - t0) / 1000
    if (!reduce) {
      if (ahora - ultimo > 2500) {
        ry.obj = Math.sin(t * 0.4) * 0.07
        rx.obj = Math.sin(t * 0.3 + 1) * 0.04
        pr.obj = 0
      }
      ;[rx, ry, pr, px, py].forEach(paso)
      flutter *= 0.95
      if (d.sello && selloK < 1) {
        if (!selloIni) selloIni = ahora + 500
        if (ahora > selloIni) {
          selloK = Math.min(1, (ahora - selloIni) / 420)
          redibujar()
          tex.needsUpdate = true
        }
      }
    }
    pose(t)
    renderer.render({ scene: escena, camera: cam })
  }
  const bucle = (ahora: number) => {
    if (!corriendo) return
    pintar(ahora)
    raf = requestAnimationFrame(bucle)
  }
  const arrancar = () => {
    if (corriendo || reduce || !visible || document.hidden) return
    corriendo = true
    raf = requestAnimationFrame(bucle)
  }
  const parar = () => {
    corriendo = false
    cancelAnimationFrame(raf)
  }
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible) arrancar()
    else parar()
  })
  io.observe(caja)
  const alVisibilidad = () => (document.hidden ? parar() : arrancar())
  document.addEventListener('visibilitychange', alVisibilidad)
  const vigia = new ResizeObserver(ajustar)
  vigia.observe(caja)
  vigia.observe(cv)
  ajustar()
  pintar(performance.now())
  arrancar()

  return {
    actualizar(nuevo) {
      const selloNuevo = nuevo.sello && nuevo.sello !== d.sello
      d = nuevo
      if (selloNuevo) {
        selloK = reduce ? 1 : 0
        selloIni = 0
      }
      redibujar()
      tex.needsUpdate = true
      if (!corriendo) pintar(performance.now())
    },
    destruir() {
      parar()
      io.disconnect()
      vigia.disconnect()
      document.removeEventListener('visibilitychange', alVisibilidad)
      zona.removeEventListener('pointermove', mover)
      zona.removeEventListener('pointerleave', salir)
      zona.removeEventListener('click', clic as EventListener)
      cv.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
