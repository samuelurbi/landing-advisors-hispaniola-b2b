import type { ReactNode } from 'react'
import { BURBUJAS } from '@/data/burbujas'
import { LightRays } from './LightRays'

// El tramo «bajo el agua»: confianza, museo y alianza comparten UN fondo navy continuo
// que baja de la orilla al fondo y vuelve a subir. Entra y sale con la banda de espuma
// del pie de la web (la misma máscara), arriba con el color de la sección anterior y
// abajo con el blanco de la siguiente. La luz entra desde la superficie (Light Rays,
// WebGL diferido) y las burbujas suben por todo el tramo. Sin fotos de fondo.
export function BajoElAgua({ children }: { children: ReactNode }) {
  return (
    <div className="bajo-agua relative isolate overflow-hidden text-white">
      <div aria-hidden className="espuma espuma--arriba" />
      <LightRays
        color="#e8fdff"
        velocidad={0.55}
        apertura={0.75}
        largo={2.4}
        desvanece={1.1}
        ruido={0.1}
        distorsion={0.05}
        intensidad={0.6}
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[110vh] mix-blend-screen [mask-image:linear-gradient(180deg,black_45%,transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {BURBUJAS.map((b, i) => (
          <span
            key={i}
            className="burbuja"
            style={{ ['--x' as string]: b.x, ['--s' as string]: b.s, ['--d' as string]: b.d, ['--w' as string]: b.w, ['--b' as string]: b.b }}
          />
        ))}
      </div>
      {children}
      <div aria-hidden className="espuma espuma--abajo" />
    </div>
  )
}
