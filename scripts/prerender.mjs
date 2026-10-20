// Tras `vite build`:
// 1. Inyecta el HTML de la página en dist/index.html: el contenido y el LCP llegan
//    sin esperar al JS, y los buscadores / previsualizaciones lo leen entero.
// 2. Reescribe la cabecera SEO con el dominio de SITIO (canonical, og:url y las
//    imágenes absolutas, JSON-LD) y decide la indexación con INDEXAR.
// 3. Genera robots.txt, sitemap.xml y llms.txt desde los mismos datos (src/seo.ts).
//
//   SITIO=https://hispaniolatravelagents.com INDEXAR=1 npm run build
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const raiz = resolve(import.meta.dirname, '..')
const dist = resolve(raiz, 'dist')
// Cada variante va a su propio proyecto de Vercel: landing-advisors-hispaniola-a / -b.
const VARIANTE = process.env.VITE_VARIANTE === 'a' ? 'a' : 'b'
// Por defecto, el dominio final en el Hostinger del cliente (20/10).
const SITIO = (process.env.SITIO || 'https://hispaniolatravelagents.com').replace(/\/+$/, '')
const INDEXAR = process.env.INDEXAR === '1'
const url = `${SITIO}/`
const abs = (ruta) => `${SITIO}${ruta}`
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const { render, SEO, SECCIONES, RESUMEN } = await import(pathToFileURL(resolve(raiz, 'dist-ssr/entry-server.js')).href)

// --- Cabecera ---
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SEO.webPrincipal}#organization`,
      name: SEO.marca,
      url: SEO.webPrincipal,
      logo: abs(SEO.logo),
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: SEO.titulo,
      description: SEO.descripcion,
      inLanguage: 'en',
      publisher: { '@id': `${SEO.webPrincipal}#organization` },
      primaryImageOfPage: abs(SEO.ogImagen),
    },
  ],
}

const cabecera = `<title>${esc(SEO.titulo)}</title>
    <meta name="description" content="${esc(SEO.descripcion)}" />
    <meta name="robots" content="${INDEXAR ? 'index, follow' : 'noindex, nofollow'}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(SEO.marca)}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(SEO.ogTitulo)}" />
    <meta property="og:description" content="${esc(SEO.ogDescripcion)}" />
    <meta property="og:image" content="${abs(SEO.ogImagen)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(SEO.ogTitulo)}" />
    <meta name="twitter:description" content="${esc(SEO.ogDescripcion)}" />
    <meta name="twitter:image" content="${abs(SEO.ogImagen)}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`

// La fuente del H1 (Poppins 600, latin): precargarla adelanta el LCP de texto.
const fuenteH1 = readdirSync(resolve(dist, 'assets')).find((f) => /^poppins-latin-600-normal-.*\.woff2$/.test(f))
const precargaFuente = fuenteH1
  ? `\n    <link rel="preload" as="font" type="font/woff2" href="/assets/${fuenteH1}" crossorigin />`
  : ''

const ruta = resolve(dist, 'index.html')
let html = readFileSync(ruta, 'utf8')
if (!html.includes('<div id="root"></div>')) throw new Error('No encuentro <div id="root"></div> en dist/index.html')
const marcas = /<!-- seo:inicio[\s\S]*?<!-- seo:fin -->/
if (!marcas.test(html)) throw new Error('No encuentro el bloque <!-- seo:inicio … seo:fin --> en dist/index.html')
html = html.replace(marcas, cabecera + precargaFuente).replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
writeFileSync(ruta, html)

// --- robots.txt, sitemap.xml, llms.txt ---
writeFileSync(
  resolve(dist, 'robots.txt'),
  INDEXAR
    ? `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`
    : `# Vista previa: sin indexar hasta el lanzamiento (build con INDEXAR=1).\nUser-agent: *\nDisallow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`,
)

const hoy = new Date().toISOString().slice(0, 10)
writeFileSync(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}</loc>
    <lastmod>${hoy}</lastmod>
  </url>
</urlset>
`,
)

writeFileSync(
  resolve(dist, 'llms.txt'),
  `# ${SEO.titulo}

> ${SEO.descripcion} Free membership; commission from 12% (10% on private catamarans) up to 15% by tier, paid monthly. Daytime experiences only; the Underwater Museum is coming soon, November 15, 2026.

## Sections

${SECCIONES.map((s) => `- [${s.label}](${url}#${s.id})`).join('\n')}

## The portfolio

${RESUMEN.productos.map((p) => `- ${p}`).join('\n')}

## More

- [${SEO.marca} — main website](${SEO.webPrincipal})
`,
)

rmSync(resolve(raiz, 'dist-ssr'), { recursive: true, force: true })
console.log(`Prerender OK → ${ruta}\n  SITIO=${SITIO} · ${INDEXAR ? 'INDEXABLE' : 'noindex'} · robots.txt, sitemap.xml, llms.txt`)
