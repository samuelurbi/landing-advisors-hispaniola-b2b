import { ArrowUpRight, Mail } from 'lucide-react'
import { MARCA, PIE } from '@/data/b2b'
import { Boton } from './ui'

// Footer «océano» de la web: banda de espuma + foto del mar con velo.
export function Pie() {
  return (
    <footer className="relative overflow-hidden bg-oceano-footer px-5 pb-8 pt-[calc(9rem+2.5rem)] text-white sm:pt-[calc(11rem+2rem)]">
      <div className="absolute inset-0" aria-hidden>
        <img
          src="/fotos/footer-oceano.webp"
          srcSet="/fotos/footer-oceano-800.webp 800w, /fotos/footer-oceano.webp 1600w"
          sizes="100vw"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[rgb(6_42_50/45%)]" />
      </div>
      <div className="footer-espuma" aria-hidden />

      <div className="relative mx-auto max-w-contenido sm:px-5">
        <div className="flex flex-col items-center text-center">
          <img
            src="/marca/logotipo-blanco.webp"
            alt="Hispaniola Aquatic Adventures"
            width={900}
            height={271}
            loading="lazy"
            className="h-14 w-auto sm:h-16"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Boton href="#apply" tam="lg" rastreo="footer" flecha>
              Start a Partnership Conversation
            </Boton>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/20 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/85">Hispaniola Aquatic Adventures · Punta Cana, Dominican Republic</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <li className="flex items-center gap-2 text-white/85">
              <Mail className="size-4" aria-hidden />
              <a href={`mailto:${MARCA.emailSocios}`} className="underline-offset-4 hover:underline">
                {MARCA.emailSocios}
              </a>
            </li>
            <li>
              <a
                href={MARCA.web}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-1 font-semibold text-aqua-claro underline-offset-4 hover:underline"
              >
                Main website
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </li>
          </ul>
        </div>
        <p className="mt-6 text-xs text-white/60">{PIE.aviso}</p>
        <p className="mt-2 text-xs text-white/60">© 2026 Hispaniola Aquatic Adventures.</p>
      </div>
    </footer>
  )
}
