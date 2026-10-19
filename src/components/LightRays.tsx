import { useEffect, useRef, useState } from 'react'

// Light Rays de React Bits (DavidHDev/react-bits, MIT), portado del fuente
// ts-tailwind tal cual en el shader. Cambios para la landing:
// - Solo nace desde arriba al centro (luz que entra en el agua desde la orilla).
// - Sale opaca y se mezcla con `screen`: sobre el turquesa, la luz se suma entera
//   (con alfa, la aportación era intensidad² y apenas se veía).
// - No arranca con movimiento reducido ni sin WebGL: queda el degradado de la
//   sección como fondo estático.
// - Se pausa fuera de pantalla y con la pestaña oculta; `dpr` máx. 1.5.
// - Sin seguir al ratón por defecto (en móvil no hay ratón y el haz se torcía).
// - `ogl` se importa al vuelo, cuando la sección asoma: no pesa en la carga inicial.

type Props = {
  color?: string
  velocidad?: number
  apertura?: number
  largo?: number
  desvanece?: number
  ruido?: number
  distorsion?: number
  saturacion?: number
  intensidad?: number
  className?: string
}

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1]
}

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`

const FRAG = `precision highp float;
uniform float iTime;
uniform vec2  iResolution;
uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float fadeDistance;
uniform float saturation;
uniform float noiseAmount;
uniform float distortion;
uniform float intensity;
varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);
  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );
  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor;
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec4 rays1 = vec4(1.0) * rayStrength(rayPos, rayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) * rayStrength(rayPos, rayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
  vec4 color = rays1 * 0.5 + rays2 * 0.4;
  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    color.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }
  float brightness = 1.0 - (coord.y / iResolution.y);
  color.x *= 0.1 + brightness * 0.8;
  color.y *= 0.3 + brightness * 0.6;
  color.z *= 0.5 + brightness * 0.5;
  if (saturation != 1.0) {
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(gray), color.rgb, saturation);
  }
  color.rgb *= raysColor;
  // Opaco: la capa se mezcla con screen sobre el agua (el negro no aporta).
  gl_FragColor = vec4(color.rgb * intensity, 1.0);
}`

export function LightRays({
  color = '#ffffff',
  velocidad = 1,
  apertura = 1,
  largo = 2,
  desvanece = 1,
  ruido = 0,
  distorsion = 0,
  saturacion = 1,
  intensidad = 1,
  className = '',
}: Props) {
  const caja = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = caja.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = caja.current
    if (!visible || !el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelado = false
    let limpiar = () => {}

    import('ogl').then(({ Mesh, Program, Renderer, Triangle }) => {
      if (cancelado) return
      let renderer: InstanceType<typeof Renderer>
      try {
        renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.5), alpha: false })
      } catch {
        return // sin WebGL: queda el degradado estático
      }
      const gl = renderer.gl
      if (!gl) return
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      el.appendChild(gl.canvas)

      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: hexToRgb(color) },
        raysSpeed: { value: velocidad },
        lightSpread: { value: apertura },
        rayLength: { value: largo },
        fadeDistance: { value: desvanece },
        saturation: { value: saturacion },
        noiseAmount: { value: ruido },
        distortion: { value: distorsion },
      intensity: { value: intensidad },
      }
      const mesh = new Mesh(gl, {
        geometry: new Triangle(gl),
        program: new Program(gl, { vertex: VERT, fragment: FRAG, uniforms }),
      })

      const colocar = () => {
        const { clientWidth: w, clientHeight: h } = el
        renderer.setSize(w, h)
        const W = w * renderer.dpr
        const H = h * renderer.dpr
        uniforms.iResolution.value = [W, H]
        uniforms.rayPos.value = [0.5 * W, -0.2 * H] // top-center, como el original
      }
      colocar()
      const ro = new ResizeObserver(colocar)
      ro.observe(el)

      let raf = 0
      const bucle = (t: number) => {
        uniforms.iTime.value = t * 0.001
        renderer.render({ scene: mesh })
        raf = requestAnimationFrame(bucle)
      }
      const alCambiarPestana = () => {
        cancelAnimationFrame(raf)
        if (!document.hidden) raf = requestAnimationFrame(bucle)
      }
      raf = requestAnimationFrame(bucle)
      document.addEventListener('visibilitychange', alCambiarPestana)

      // Aparece con un fundido: el haz no «se enciende» de golpe al llegar.
      gl.canvas.style.opacity = '0'
      gl.canvas.style.transition = 'opacity 1.2s ease-out'
      requestAnimationFrame(() => (gl.canvas.style.opacity = '1'))

      limpiar = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        document.removeEventListener('visibilitychange', alCambiarPestana)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
        gl.canvas.remove()
      }
    })

    return () => {
      cancelado = true
      limpiar()
    }
  }, [visible, color, velocidad, apertura, largo, desvanece, ruido, distorsion, saturacion, intensidad])

  return <div ref={caja} aria-hidden className={`pointer-events-none overflow-hidden ${className}`} />
}
