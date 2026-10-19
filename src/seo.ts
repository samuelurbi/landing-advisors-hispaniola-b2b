// Datos de SEO de la landing. Solo datos (nada de componentes): los lee
// scripts/prerender.mjs para escribir la cabecera, robots.txt, sitemap.xml y
// llms.txt con el dominio de la variable SITIO.
import { CAPITULOS, MARCA, PORTAFOLIO } from './data/b2b'

export const SEO = {
  // ≤ 60 caracteres
  titulo: 'Partner Program · Hispaniola Aquatic Adventures',
  // ~150–155 caracteres
  descripcion:
    'Partner with a local Punta Cana operator: catamaran, snorkeling, private and conservation-driven experiences for agencies, tour operators and DMCs.',
  ogTitulo: 'Give your clients more of Punta Cana.',
  ogDescripcion:
    'Hispaniola Aquatic Adventures partner program for travel agencies, tour operators, advisor networks and DMCs. Free to join, commission from 12% up to 15%.',
  ogImagen: '/og-hispaniola-advisors.jpg',
  logo: '/marca/logotipo-negro.webp',
  marca: MARCA.nombre,
  webPrincipal: MARCA.web,
}

// Secciones con ancla, para llms.txt
export const SECCIONES = CAPITULOS.map((c) => ({ id: c.id, label: c.label }))

export const RESUMEN = {
  productos: PORTAFOLIO.frentes.map((f) => `${f.nombre} — ${f.bajada}`),
}
