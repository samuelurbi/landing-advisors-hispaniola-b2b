// Copy de la propuesta B2B (variantes A y B).
//
// Fuente: la vista previa del cliente (WEB-SOCIOS-HISPANIOLA, 10 oct 2026) y sus reglas
// (01-LEER-PRIMERO.md), actualizadas con la entrega del 15 oct 2026 (material-recibido, MA-82):
// - sin precios de tours; la comisión SÍ se publica con las cifras del programa de incentivos
//   (10 Comision/COPY-WEB-COMISIONES.txt, confirmado por Raymond el 15 oct 2026);
// - el museo siempre «Coming soon, November 15, 2026»;
// - solo experiencias de día; reputación con fecha de lectura (7 oct 2026);
// - fuera «#1 on TripAdvisor», 1,782 reviews, «and the Caribbean», «the only floating kitchen».
// Lo que la empresa no ha validado va como `pendiente(...)` y se ve marcado en la página.
// MA-82 (15/10): todas las fotos deben ser de los barcos reales de Hispaniola. Las seis que no mostraban un
// barco de la flota ya son las de la entrega (`ma82-*`, propuesta pendiente de aprobación de Joshuard y
// Blanka y del permiso de imagen): ver FOTOS-MA82.md.

import { VARIANTE } from '@/lib/movimiento'

// Dato que la empresa no ha validado: se pinta marcado con <Pendiente>.
export type Texto = string | { pendiente: string }
export const pendiente = (texto: string) => ({ pendiente: texto })

export const NAV = [
  { id: 'why', label: 'Why us' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'partnership', label: 'How it works' },
  ...(VARIANTE === 'b' ? [{ id: 'referrals', label: 'Referrals' }] : []),
  { id: 'proof', label: 'Proof' },
  ...(VARIANTE === 'b' ? [{ id: 'faq', label: 'FAQ' }] : []),
]

// Capítulos del riel lateral, en el orden de la página (ids de las secciones).
export const CAPITULOS = [
  { id: 'top', label: 'Welcome' },
  { id: 'operator', label: 'Operator' },
  { id: 'why', label: 'Difference' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'journey', label: 'Guest day' },
  { id: 'confidence', label: 'Confidence' },
  { id: 'museum', label: 'Museum' },
  { id: 'partnership', label: 'Partnership' },
  ...(VARIANTE === 'b' ? [{ id: 'referrals', label: 'Referrals' }, { id: 'kit', label: 'Sales kit' }] : []),
  { id: 'proof', label: 'Proof' },
  { id: 'apply', label: 'Apply' },
  ...(VARIANTE === 'b' ? [{ id: 'faq', label: 'FAQ' }] : []),
]

/** Número de capítulo de una sección («02»…), según la variante. */
export const num = (id: string) => String(CAPITULOS.findIndex((c) => c.id === id) + 1).padStart(2, '0')

export const MARCA = {
  nombre: 'Hispaniola Aquatic Adventures',
  web: 'https://hispaniolaaquaticadventures.com/',
  lugar: 'Punta Cana, Dominican Republic',
  // Punto 09: el correo que la empresa ya publica, hasta que exista uno propio de socios.
  emailSocios: 'info@hispaniolaaquaticadventures.com',
  // WhatsApp de la web principal (landing de advisors original): solo como salida si falla el
  // formulario (Samuel, 20/10). Marketing pidió no usar el de clientes finales: confirmar otro.
  whatsappSocios: '18293052804',
}

// Punto 10 / ajuste 1: programa de incentivos (COPY-WEB-COMISIONES.txt, bloques 1, 2 y 6).
// «Semi-private & own excursions» = Caribbean Escape, Coral Quest y Saona Island; «Private catamarans» = Private Charter.
export const COMISION = {
  titulo: 'Free membership. Commission that grows with you.',
  intro: 'Move up a tier by reaching either goal within a rolling 12 months. Sales with Hispaniola and Karaya count together.',
  niveles: ['Partner', 'Preferred', 'Elite'],
  filas: [
    { etiqueta: 'How to get there', valores: ['Approved registration', '10 bookings or US$15,000', '25 bookings or US$40,000'] },
    { etiqueta: 'Semi-private & own excursions', valores: ['12%', '14%', '15%'], cifra: true },
    { etiqueta: 'Private catamarans', valores: ['10%', '12%', '15%'], cifra: true },
    { etiqueta: 'Extra benefits', valores: ['Sales kit and training', 'Priority follow-up', 'Dedicated manager and co-marketing'] },
  ],
  nota: 'Commission is paid on the commissionable amount collected, after discounts, excluding taxes and third-party services. Saona Island, including the private speedboat, earns the semi-private rate. Net rates and full terms are shared with approved advisors.',
  bonos: [
    { cifra: 'US$50', titulo: 'First-sale bonus', texto: 'Your first completed booking with at least US$1,000 commissionable.' },
    { cifra: 'US$100', titulo: 'Fast-start bonus (total)', texto: 'Three bookings and US$3,000 commissionable in your first 90 days. Replaces the first-sale bonus.' },
  ],
}

// Bloque 4 / ajuste 5: programa de referidos de US$75 (sección propia tras «How it works», variante B).
export const REFERIDOS = {
  capitulo: 'Referral program',
  titulo: 'Know an advisor who sells Punta Cana? Earn US$75.',
  texto: 'Share your referral code. When the advisor you refer completes three bookings and US$3,000 commissionable within six months of approval, you earn US$75. They get all the regular bonuses too.',
  bueno: 'Good to know',
  reglas: [
    'The referral must be registered before their first booking.',
    'Up to five paid referrals per agency during the pilot.',
    "Self-referrals and advisors already in talks with us don't qualify.",
  ],
  cta: 'Register as an advisor',
}

export const HERO = {
  eyebrow: 'Partner program · Punta Cana, Dominican Republic',
  titulo: ['Give your clients', 'more of Punta Cana.'],
  lead: 'Partner with a local operator that runs its own boats and crew: catamaran, snorkeling, private and conservation-driven experiences in Punta Cana.',
  // Bloque 6 (opcional) del programa de incentivos.
  comision: 'Earn from 12% on every booking, up to 15% as you grow. Free to join.',
  remate: 'Built for travelers. Ready for travel partners.',
  ctaPrimario: 'Partner With Hispaniola',
  ctaSecundario: 'Discover Hispaniola',
  pase: {
    titulo: 'Partner pass',
    sub: 'For travel professionals',
    de: { etiqueta: 'From', valor: 'You', nota: 'Agency or advisor' },
    a: { etiqueta: 'To', valor: 'Punta Cana', nota: 'Dominican Republic' },
    datos: [
      { etiqueta: 'Operator', valor: 'Direct' },
      { etiqueta: 'Experiences', valor: 'Daytime only' },
      { etiqueta: 'Guest rating', valor: '4.9 on two platforms' },
    ],
    sello: 'Approved partner',
  },
}

// Pase de papel (Ticket / lib/ticket3d.ts): el del héroe. El del formulario se arma con lo que escriben.
export const TICKET_HERO = {
  titulo: 'PARTNER PASS',
  sub: 'FOR TRAVEL PROFESSIONALS',
  de: { codigo: 'YOU', nota: 'Agency or advisor' },
  a: { codigo: 'PUJ', nota: 'Punta Cana, DR' },
  filas: [
    ['OPERATOR', 'Direct'],
    ['EXPERIENCES', 'Daytime only'],
    ['GUEST RATING', '4.9 · two platforms'],
    ['PORTFOLIO', 'Six lines'],
  ] as [string, string][],
  anfitrion: ['HOST', 'Hispaniola Aquatic Adventures'] as [string, string],
  clase: ['CLASS', 'Commercial partner'] as [string, string],
  pie: ['HAA · PUNTA CANA', 'Nº 000-001'] as [string, string],
  talon: { arriba: 'YOUR CLIENTS', grande: 'Our boats', abajo: 'on the water', boton: 'Apply →' },
  sello: 'APPROVED PARTNER',
}

export const OPERADOR = {
  capitulo: 'The operator',
  titulo: 'Our own boats. Our own crew.',
  lead: 'Hispaniola owns the boats and employs the crew. When your client has a question, you talk to the people who deliver the day, not to a reseller.',
  cta: "Let's talk",
  hitos: [
    {
      perilla: '2013',
      eyebrow: 'January',
      grande: '2013',
      titulo: 'First listed on TripAdvisor',
      texto: ['Guest reviews on the platform go back to 2013.'] as Texto[],
      foto: 'b2b-catamaran-semi',
      alt: 'A Hispaniola catamaran full of guests in turquoise water',
    },
    {
      perilla: '2016',
      eyebrow: 'Reef restoration',
      grande: '2016',
      titulo: 'Reef restoration begins',
      texto: ['The Bávaro Reefs Foundation starts its coral restoration project. Hispaniola supports its work.'] as Texto[],
      foto: 'museo-vivero',
      alt: 'A coral nursery structure on the sandy sea floor',
    },
    {
      perilla: 'Nov 15',
      eyebrow: '2026 · Coming soon',
      grande: 'Nov 15',
      titulo: 'Underwater Museum',
      texto: ['A new stop inside the protected Marine Park.'] as Texto[],
      foto: 'museo-buzo',
      alt: 'A diver next to one of the Underwater Museum sculptures',
    },
    {
      perilla: 'Story',
      eyebrow: 'Since 2010',
      grande: 'Story',
      titulo: 'Our story',
      // Punto 08 (texto final de Hispaniola, 15 oct 2026). Sin apellido del fundador.
      texto: [
        "Hispaniola began in 2010 with a single catamaran, and Fernando, now general manager, as its first captain. Each new boat was made possible by the success of the one before it. Today the fleet is owned and maintained by Hispaniola's own technical team, with more than 70 people on the crew.",
      ] as Texto[],
      foto: 'ma82-story', // MA-82 · 01 Story: Forever Teresa desde el aire
      alt: 'Aerial view of a Hispaniola catamaran anchored over turquoise water, with guests swimming nearby',
    },
  ],
}

export type Ventaja = {
  pin: string
  etiqueta: string
  titulo: string
  cliente: string
  negocio: string
  foto: string
  alt: string
  // Posición del pin sobre el diorama (porcentaje del ancho y del alto de la imagen).
  x: number
  y: number
}

export const DISTINCION = {
  capitulo: 'What makes us different',
  titulo: 'Six reasons to recommend Hispaniola.',
  lead: 'Six differences your clients feel on the day. Tap a pin on the boat to see what each one means for your client and for your business.',
  ventajas: [
    {
      pin: '01',
      etiqueta: 'Space',
      titulo: 'More space. Less crowd.',
      cliente: 'A more comfortable shared catamaran, with room to move.',
      negocio: 'A differentiated alternative for clients who want more than a crowded mass-market boat.',
      foto: 'ma82-space', // MA-82 · 02 Space
      alt: 'A group relaxing with room to spare on the deck of a Hispaniola catamaran',
      x: 59,
      y: 47,
    },
    {
      pin: '02',
      etiqueta: 'Purpose',
      titulo: 'A day that gives back to the reef.',
      cliente: "Snorkeling next to real coral restoration, with the Foundation's team.",
      negocio: 'A purpose-driven story for travelers who care about responsible tourism.',
      foto: 'b2b-arrecife',
      alt: 'A snorkeler over a brain coral surrounded by fish',
      x: 53,
      y: 74,
    },
    {
      pin: '03',
      etiqueta: 'Kitchen',
      titulo: 'Lunch is made on board.',
      cliente: 'Lunch prepared on board in a floating kitchen.',
      negocio: 'Food becomes part of the experience: one more detail you can describe with confidence.',
      foto: 'cocina-flotante',
      alt: 'Crew members showing trays of fresh food from the floating kitchen',
      x: 35,
      y: 48,
    },
    {
      pin: '04',
      etiqueta: 'Taste',
      titulo: 'Your tour. Your taste.',
      cliente: 'Menu styles to choose from and charters shaped around the group.',
      negocio: 'The capability to serve private groups and special requests.',
      foto: 'ma82-taste', // MA-82 · 03 Taste
      alt: 'A family sharing plates from the floating kitchen on a catamaran deck',
      x: 44,
      y: 26,
    },
    {
      pin: '05',
      etiqueta: 'Direct',
      titulo: 'One team, accountable to you.',
      cliente: 'One team that runs the day, from pickup to return.',
      negocio: 'One accountable partner for you and your client.',
      foto: 'b2b-grupo-orilla',
      alt: 'A Hispaniola boat with its crew near the shore',
      x: 45,
      y: 58,
    },
    {
      pin: '06',
      etiqueta: 'Something new',
      titulo: 'A new stop: the Underwater Museum.',
      cliente: 'Sculptures on the sea floor, inside the protected Marine Park. Coming soon, November 15, 2026.',
      negocio: 'Something new to offer repeat clients, and a fresh reason to book again.',
      foto: 'museo-diablo',
      alt: 'The Carnival Devil sculpture on the sea floor',
      x: 79,
      y: 64,
    },
  ] satisfies Ventaja[],
}

export const PORTAFOLIO = {
  capitulo: 'The portfolio',
  titulo: 'One partner. Six ways to sell Punta Cana.',
  lead: 'Shared days, private charters, snorkeling, Saona, conservation and group occasions: one operator for different travelers and occasions.',
  // Ajuste 8 (16 Tours y eventos, bloque 1): enfoque informativo, sin precios.
  intro: 'The facts you need to recommend Hispaniola: who each experience suits, how long it takes, how many guests it fits and what is included.',
  nota: 'Rates and full details are shared with approved advisors.',
  porQue: 'Why it matters to an agency',
  verFicha: 'At a glance',
  cta: 'Explore partnership opportunities',
  frentes: [
    {
      nombre: 'Shared Experiences',
      bajada: 'Premium social days at sea.',
      puntos: ['Caribbean Escape: about 4 hours, adults 15+', 'Coral Quest: about 4 hours, all ages', 'Lunch prepared on board'],
      porQue: 'Two shared products for two different guest profiles.',
      foto: 'b2b-catamaran-semi',
      alt: 'Guests cheering on a shared catamaran',
    },
    {
      nombre: 'Private Charters',
      bajada: 'The whole catamaran for one group.',
      puntos: ['3 or 4 hours, depending on the vessel', 'From small parties up to 85 guests', 'A dedicated coordinator'],
      porQue: 'Quoted per group: a natural fit for families, celebrations and incentive days.',
      foto: 'ma82-charter', // MA-82 · 04 Private Charters
      alt: 'One group waving from the deck of a Hispaniola catamaran in shallow turquoise water',
    },
    {
      nombre: 'Snorkeling and Marine',
      bajada: 'Reef, natural pool and a protected Marine Park.',
      puntos: ['Natural Pool with artificial reefs', 'Coral gardens in the Marine Park', 'Gear and guides on board'],
      porQue: 'An easy yes for first-time snorkelers.',
      foto: 'b2b-snorkel',
      alt: 'Two snorkelers above a large brain coral',
    },
    {
      nombre: 'Saona Island',
      bajada: "One of the Dominican Republic's iconic full-day experiences.",
      puntos: ['Full day, about 8 hours', 'Three vessel options, up to 70 guests', 'Bilingual guide and buffet lunch'],
      porQue: 'A full-day option that pairs with a half-day for longer stays.',
      foto: 'b2b-saona',
      alt: 'Aerial view of a white-sand beach lined with palm trees',
    },
    {
      nombre: 'Conservation',
      bajada: 'Snorkel with a purpose.',
      puntos: ["Coral Quest with the Foundation's team", 'Marine Interpretation Center and symbolic coral planting', 'Underwater Museum coming soon, November 15, 2026'],
      porQue: 'A story for travelers who care about responsible tourism.',
      foto: 'b2b-coral-ninos',
      alt: 'Children learning about coral restoration on board',
    },
    {
      nombre: 'Groups and Special Occasions',
      bajada: 'Pre and post event days for groups.',
      puntos: ['Birthdays, pre-wedding celebrations, reunions, incentive days', 'Private Charter: up to 85 guests', 'Party boat: from 10 to 120 guests'],
      porQue: 'One operator for the group days around your event.',
      foto: 'b2b-celebracion',
      alt: 'A guest celebrating a birthday with a cake on board',
    },
  ],
}

// Ajuste 8 · ficha «At a glance» de cada tarjeta (16 Tours y eventos, bloque 2). Sin precios.
export type Ficha = { titulo: string; lineas: [string, string][] }[]
const SNORKEL: Ficha = [
  {
    titulo: 'Snorkeling and conservation',
    lineas: [
      ['The Marine Park', "Snorkeling over coral gardens and artificial reefs, next to the Foundation's restoration work."],
      ['The Natural Pool', 'Shallow water with artificial reefs.'],
      ['Underwater Museum', 'Coming soon, November 15, 2026.'],
    ],
  },
]
export const FICHAS: Ficha[] = [
  [
    {
      titulo: 'Caribbean Escape',
      lineas: [
        ['Suits', 'Adults only (15+), in an intimate format with limited capacity.'],
        ['Duration', 'About 4 hours. Morning and afternoon departures; both finish before 6 PM.'],
        ['Group size', 'Up to 25 guests.'],
        ['Route', 'Marine Park, Secret Beach, Natural Pool and a lunch from the floating kitchen.'],
        ['Includes', 'Gourmet lunch, open bar, round-trip air-conditioned transfer, snorkeling in the Marine Park, Wi-Fi and photos.'],
      ],
    },
    {
      titulo: 'Coral Quest',
      lineas: [
        ['Suits', 'All ages. It is the family version of the shared experience, with the same coral nursery and floating kitchen.'],
        ['Duration', 'About 4 hours. Morning and afternoon departures; both finish before 6 PM.'],
        ['Group size', 'Up to 30 guests.'],
        ['Route', 'Marine Interpretation Center, Natural Pool with symbolic coral planting, Marine Park snorkeling and lunch on board.'],
        ['Guided', "With the Foundation's conservation team."],
        ['Includes', "Lunch (a children's menu is available), round-trip air-conditioned transfer, snorkeling in the Marine Park, Wi-Fi and photos."],
      ],
    },
  ],
  [
    {
      titulo: 'Private Charters',
      lineas: [
        ['Suits', 'One group that wants the whole catamaran.'],
        ['Duration', '3 or 4 hours, depending on the vessel.'],
        ['Group size', 'From small parties up to 85 guests.'],
        ['Includes', 'A dedicated coordinator, Wi-Fi, snorkel equipment and photos. The 4-hour charters include the floating-kitchen menu.'],
        ['Pickup', 'Charters with their own meeting point do not include hotel pickup.'],
      ],
    },
  ],
  SNORKEL,
  [
    {
      titulo: 'Saona Island',
      lineas: [
        ['Suits', 'Groups that want a full day.'],
        ['Duration', 'About 8 hours. Pickup around 8 AM, back at the hotel around 5 PM.'],
        ['Group size', 'Up to 70 guests, with three vessel options.'],
        ['Route', 'Departure from Bayahibe, the Natural Pool at Las Palmillas (shallow water with large starfish), buffet lunch at Catuano and beach time. The Speedboat Adventure option adds a stop at Mano Juan.'],
        ['Includes', 'Transfer, boat, buffet lunch, snorkel equipment and a bilingual guide.'],
        ['Good to know', 'Transfers from Casa de Campo carry a surcharge.'],
      ],
    },
  ],
  SNORKEL,
  [
    {
      titulo: 'Groups and special occasions',
      lineas: [
        ['Private events', 'The whole catamaran for one group.'],
        ['Party boat', 'Private group parties on board, from 10 to 120 guests.'],
        ['Pre- and post-wedding', 'Welcome gatherings, bachelor and bachelorette days and farewell days around a wedding.'],
        ['Corporate and MICE', 'Corporate groups, incentive days and team activities.'],
        ['Private Charter', 'For any of these, up to 85 guests.'],
        ['Formats and times', 'Agreed with our sales contact for each group.'],
      ],
    },
  ],
]

export const DIA = {
  capitulo: 'The guest experience',
  titulo: 'What happens after you send them to us.',
  lead: 'From hotel pickup to the ride back, a day designed so your client is looked after at every step.',
  duracion: 'About 4 hours',
  paraTi: 'What this means for you',
  paradas: [
    { corto: 'Pickup', titulo: 'Pick up at the hotel', texto: 'Your client is collected at the hotel.', paraTi: 'Less logistics to explain at the point of sale.', foto: 'b2b-grupo-orilla', alt: 'A Hispaniola catamaran with its crew near the shore' },
    { corto: 'Learn', titulo: 'Marine Interpretation Center', texto: 'Guests learn about the reef before they get in the water.', paraTi: 'A story that makes the booking feel like more than an excursion.', foto: 'b2b-coral-ninos', alt: 'Children learning about coral restoration on board' },
    { corto: 'Plant', titulo: 'Symbolic coral planting', texto: 'Guests take part in the restoration with a symbolic planting.', paraTi: 'The moment clients photograph and tell friends about.', foto: 'museo-vivero', alt: 'A coral nursery on the sea floor' },
    { corto: 'Snorkel', titulo: 'Natural Pool and reef snorkeling', texto: 'Shallow turquoise water and snorkeling over artificial reefs.', paraTi: 'Easy for first-time snorkelers, so fewer worries before booking.', foto: 'b2b-snorkel', alt: 'Two snorkelers above a large brain coral' },
    { corto: 'Park', titulo: 'Marine Park', texto: 'Inside the protected park, next to the restoration gardens.', paraTi: 'A reason for repeat clients to come back.', foto: 'ma82-park', alt: 'A Hispaniola catamaran in the natural pool with guests in the water' }, // MA-82 · 05 Park
    { corto: 'Lunch', titulo: 'Lunch on board', texto: 'A gourmet lunch served on the catamaran.', paraTi: 'Food is where guests say the day felt well run.', foto: 'cocina-flotante', alt: 'Crew members showing trays of fresh food from the floating kitchen' },
    { corto: 'Return', titulo: 'Back to the marina', texto: 'Back to the marina and on to the hotel.', paraTi: 'A day with a clear start and finish, easy to plan around.', foto: 'ma82-return', alt: 'A Hispaniola catamaran sailing back with its wake, seen from above' }, // MA-82 · 06 Return
  ],
}

export const CONFIANZA = {
  capitulo: 'Operational confidence',
  titulo: 'What stands behind every day on the water.',
  lead: 'Four commitments an advisor can explain to a client in one sentence.',
  compromisos: [
    { icono: 'clima', titulo: 'Weather protection', texto: ['If we cancel for rain or unsafe seas, your client gets a full refund or a new date.'] as Texto[] },
    { icono: 'sol', titulo: 'Back before 6 PM', texto: ['Every Hispaniola experience ends before 6 PM.'] as Texto[] },
    { icono: 'factura', titulo: 'Formal invoicing', texto: ['Local and international invoicing for agencies and DMCs.'] as Texto[] },
    { icono: 'escritorio', titulo: 'A partner desk', texto: ['Write to info@hispaniolaaquaticadventures.com or use the form below. Our partnership team replies within one business day.'] as Texto[] },
  ],
}

export const MUSEO = {
  eyebrow: 'Tourism with a purpose · Underwater Museum',
  titulo: 'A reef that began as a sculpture.',
  lead: 'An underwater museum that works as an artificial reef, inside the Marine Park the Foundation helps restore.',
  piezas: [
    { tipo: 'Sculpture', titulo: 'Carnival Devil', foto: 'museo-diablo' },
    { tipo: 'Sculpture', titulo: 'Figure with crossed arms', foto: 'museo-brazos' },
    { tipo: 'Sculpture', titulo: 'Under the surface', foto: 'museo-superficie' },
    { tipo: 'Scale', titulo: 'A sculpture and a diver, for scale', foto: 'museo-buzo' },
  ],
  pronto: 'Coming soon',
  fecha: 'November 15, 2026',
  texto: 'A new stop for your clients inside the Marine Park.',
  cta: 'Talk to our partnership team',
  // Punto 12: nombres oficiales de la página del museo de la empresa. Autor: no se publica hasta que la Fundación lo confirme.
}

export const ALIANZA = {
  capitulo: 'How it works',
  titulo: "Let's grow together.",
  lead: 'Bring your clients closer to exceptional Punta Cana experiences while building a commercial relationship with a trusted local operator.',
  // Bloque 3 del programa de incentivos: cuatro pasos (los referidos tienen su propia sección, REFERIDOS).
  filas: [
    { etiqueta: 'Step 1', titulo: 'Register', texto: 'Two-minute form. We review and approve every advisor personally.' },
    { etiqueta: 'Step 2', titulo: 'Get your kit', texto: 'Net rates, product sheets, photos, videos and a short training session.' },
    { etiqueta: 'Step 3', titulo: 'Quote and book', texto: "Send us your client's dates and group size. Book with your advisor code." },
    { etiqueta: 'Step 4', titulo: 'Get paid monthly', texto: 'Monthly statement and payout once the experience is completed and paid.' },
  ],
  cta: 'Become a Hispaniola Partner',
}

export const REPUTACION = {
  capitulo: 'Reputation',
  titulo: 'Proof your clients will recognize.',
  lead: 'Ratings from the platforms your clients already trust, read on October 7, 2026.',
  leido: 'Read Oct 7, 2026',
  tarjetas: [
    { plataforma: 'TripAdvisor', valor: 4.9, glifo: 'burbuja', detalle: '4,041 reviews' },
    { plataforma: 'Viator', valor: 4.9, glifo: 'estrella', detalle: 'Across our 3 group tours' },
    { plataforma: 'Google', valor: 4.8, glifo: 'estrella', detalle: '887 reviews' },
  ],
  anillo: { plataforma: 'TripAdvisor', valor: 96.5, titulo: 'Five-bubble reviews', detalle: '3,900 of 4,042 · Oct 7, 2026' },
  // Ajuste 4 / punto 14: los distintivos («Badge of Excellence», «Travelers' Choice») no están comprobados
  // en las plataformas, así que no se publican. TripAdvisor con su logo oficial; Viator y Google, solo el nombre.
  nota: 'Figures read on October 7, 2026 from each platform.',
}

export const SOLICITUD = {
  capitulo: 'How to become a partner',
  titulo: 'Bring better Punta Cana experiences to your clients.',
  lead: "Whether you're a travel agency, tour operator, travel advisor network or destination specialist, let's explore how Hispaniola can become part of the experiences you confidently recommend.",
  listo: 'Ready to sail',
  checklist: ['Your name and company', 'A business email', 'Business type and country', 'Your consent to be contacted'],
  campos: {
    nombre: 'Full name',
    empresa: 'Company name',
    email: 'Business email',
    telefono: 'Phone or WhatsApp',
    pais: 'Country',
    tipo: 'Business type',
    intereses: 'Areas of interest',
    barcos: 'Boats of interest',
  },
  paises: ['United States', 'Canada', 'United Kingdom', 'Europe (other)', 'Latin America', 'Other'],
  tipos: [
    'Travel agency',
    'Tour operator',
    'Travel advisor network',
    'DMC',
    'Destination experience distributor',
    'Travel wholesaler',
    'Hotel or concierge',
    'Other',
  ],
  intereses: ['Caribbean Escape', 'Coral Quest', 'Private Charter', 'Saona Island'],
  barcos: ['Maite', 'Grandpa', 'Santa Maria', 'Forever Teresa', 'Saona catamaran', 'Saona speedboat (private)', 'Saona Speedboat Adventure'],
  referido: 'Referral code',
  // Punto 15 + Marketing 20/10: dice exactamente a qué se consiente y enlaza la política (/privacy/,
  // con huecos hasta el texto legal). Borrador hasta la aprobación del abogado.
  consentimiento: 'I agree that Hispaniola Aquatic Adventures may store the details I submit in this form and use them to contact me by email or phone about this partnership inquiry. I can withdraw my consent at any time. Read our',
  politica: 'Privacy Policy',
  consentimientoPendiente: 'Draft pending legal approval; link added once the policy is published',
  // Bloque 7: casilla opcional propuesta en el documento del programa (también la aprueba el abogado).
  novedades: 'I agree to receive program updates by email. I can unsubscribe at any time.',
  fallo: "We couldn't send your request. Please try again, or reach us directly:",
  falloWhatsapp: 'Message us on WhatsApp',
  falloWhatsappTexto: "Hi! I tried to send the partner form on hispaniolatravelagents.com and it didn't go through.",
  cta: 'Start a Partnership Conversation',
  exito: {
    titulo: 'Thank you. We have your inquiry.',
    texto: 'Our partnership team will review it and get in touch to start the conversation.',
  },
}

export const PIE = {
  aviso: 'Daytime experiences only. Net rates and full terms are shared with approved advisors. Nothing on this page guarantees earnings.',
}

// ---------- Solo variante B: kit, referidos y FAQ, adaptados a las reglas nuevas ----------

export const KIT = {
  capitulo: 'Sales support',
  titulo: 'Ready-to-use sales kit',
  // Marketing (15 oct): el kit se mantiene; frase aprobada sin «the same day».
  texto: 'Once your registration is approved, you get your kit: net rates, product sheets, photos, videos and a short training session.',
  // Las cuatro piezas, las de la frase aprobada (antes «FAQs» y «Booking guide», que el kit no trae).
  piezas: ['Net rates', 'Product sheets', 'Photos and videos', 'Short training session'],
  cta: 'Start the conversation',
}

// Bloque 5 del programa de incentivos (comisión, cambios, recogida, idiomas) y bloque 3 de tours y eventos
// (horario, familias, grupos). Las dos preguntas de idiomas del cliente se unen en una sola.
export const FAQ = {
  titulo: 'Questions partners ask',
  preguntas: [
    { p: 'Who can become a partner?', r: ['Travel agencies, tour operators, travel advisor networks, DMCs, wholesalers, and hotels or concierges that recommend Punta Cana experiences.'] },
    { p: 'How does commission work?', r: ['Commission is paid on the commissionable amount collected, after discounts, excluding taxes and third-party services. You earn 12% on semi-private catamarans and our own excursions and 10% on private catamarans, rising to up to 15% as you move up tiers. Net rates and full terms are shared with approved advisors.'] },
    { p: 'Does it cost anything to join?', r: ['No. Membership is free. Tiers are earned by production, not paid for.'] },
    { p: 'When and how do I get paid?', r: ['Monthly, after the experience is completed and paid, with a statement of your bookings. We pay your agency or the entity you designate.'] },
    { p: 'Net rate or commissionable rate?', r: ['You choose per booking. Approved advisors get both rate sheets.'] },
    { p: 'What happens with changes, cancellations or bad weather?', r: ["Free cancellation up to 7 days before the tour date, with the deposit refunded in full. Cancellations inside the 7 days before the tour are not refundable unless the date is changed, subject to availability. If a tour is cancelled for rain or rough seas, at the captain's discretion for safety, your client gets a full refund or a new date at no cost, never a lost deposit. Date changes are made with the booking code, subject to availability. The same terms apply to every tour."] },
    { p: 'Is hotel pickup included?', r: ['Shared tours include hotel pickup in Bávaro and Punta Cana. We confirm the exact pickup time the afternoon before the tour. Private charters with their own meeting point do not include hotel pickup.'] },
    { p: 'Which languages do you support?', r: ['Our guides and team speak English and Spanish.'] },
    { p: 'When do the experiences run?', r: ['Every Hispaniola experience is daytime and finishes before 6 PM.'] },
    { p: 'Which experience suits families?', r: ['Coral Quest is open to all ages. Caribbean Escape is adults only (15+). Private Charters and Saona Island are arranged per group.'] },
    { p: 'Which experience suits a larger group?', r: ['Private Charter: up to 85 guests.', 'Party boat: from 10 to 120 guests.', 'Saona Island: up to 70 guests.', 'Our sales contact helps build the quote.'] },
  ] as { p: string; r: Texto[] }[],
}
