import { useEffect } from 'react'
import { Cabecera } from './components/Cabecera'
import { Hero } from './components/Hero'
import { Operador } from './components/Operador'
import { Distincion } from './components/Distincion'
import { Portafolio } from './components/Portafolio'
import { Dia } from './components/Dia'
import { BajoElAgua } from './components/BajoElAgua'
import { Confianza } from './components/Confianza'
import { Museo } from './components/Museo'
import { Alianza } from './components/Alianza'
import { Kit, Preguntas, Referidos } from './components/Extras'
import { Reputacion } from './components/Reputacion'
import { Solicitud } from './components/Solicitud'
import { Pie } from './components/Cierre'
import { capturarUtm, vigilarSecciones } from './lib/analitica'
import { VARIANTE } from './lib/movimiento'
import { useRevela } from './lib/revela'

// Propuesta B2B. Variante A: fiel a la vista previa del cliente (10 capítulos).
// Variante B (VITE_VARIANTE=b): la misma, más referidos y kit de ventas tras la
// alianza, y FAQ al final.
export default function App() {
  useRevela()
  useEffect(() => capturarUtm(), [])
  useEffect(() => vigilarSecciones(), [])
  const b = VARIANTE === 'b'
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-btn focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Cabecera />
      <main id="main">
        <Hero />
        <Operador />
        <Distincion />
        <Portafolio />
        <Dia />
        <BajoElAgua>
          <Confianza />
          <Museo />
          <Alianza />
        </BajoElAgua>
        {b && <Referidos />}
        {b && <Kit />}
        <Reputacion />
        <Solicitud />
        {b && <Preguntas />}
      </main>
      <Pie />
    </>
  )
}
