// Tras el build: dist/api/reglas.json para /api/enviar.php (sitio, formulario, campos y su
// validación, y el texto exacto del consentimiento), sacado de los mismos datos que pinta el
// formulario (src/data/b2b.ts) para que cliente y servidor validen igual.
// El .htaccess de /api bloquea el acceso directo a este archivo.
import { mkdirSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] } })
const { SOLICITUD: s } = await vite.ssrLoadModule('/src/data/b2b.ts')
await vite.close()

const reglas = {
  sitio: 'hispaniolatravelagents',
  formulario: 'agentes',
  nombreWeb: 'Hispaniola Travel Agents (hispaniolatravelagents.com)',
  idioma: 'en',
  minMs: 3000,
  consentimiento: `${s.consentimiento} ${s.politica}.`,
  politica: 'https://hispaniolatravelagents.com/privacy/',
  novedades: s.novedades,
  // Mismo criterio que validar() en src/components/Solicitud.tsx.
  campos: {
    nombre: { etiqueta: 'Nombre', requerido: true, max: 120 },
    empresa: { etiqueta: 'Empresa', requerido: true, max: 160 },
    email: { etiqueta: 'Email', tipo: 'email', requerido: true, max: 160 },
    telefono: { etiqueta: 'Teléfono / WhatsApp', max: 40 },
    pais: { etiqueta: 'País', tipo: 'opcion', requerido: true, opciones: s.paises },
    tipo: { etiqueta: 'Tipo de negocio', tipo: 'opcion', requerido: true, opciones: s.tipos },
    intereses: { etiqueta: 'Intereses', tipo: 'lista', opciones: s.intereses },
    barcos: { etiqueta: 'Barcos', tipo: 'lista', opciones: s.barcos },
    referido: { etiqueta: 'Código de referido', max: 60 },
    novedades: { etiqueta: 'Acepta novedades del programa', tipo: 'si_no' },
  },
}
mkdirSync('dist/api', { recursive: true })
writeFileSync('dist/api/reglas.json', JSON.stringify(reglas, null, 2))
console.log('api: dist/api/reglas.json')
