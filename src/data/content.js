export const eventDate = "2027-02-20T14:00:00+01:00";
const asset = (path) => `assets/${path}`;

export const content = {
  en: {
    couple: {
      partnerOne: "Regnier",
      partnerTwo: "Alizee",
    },
    meta: {
      title: "Regnier & Alizee | Wedding Invitation",
    },
    navigation: {
      welcome: "Welcome",
      venue: "Venue",
      programme: "Programme",
      stay: "Stay",
      rsvp: "RSVP",
    },
    audio: {
      on: "Music on",
      off: "Music off",
      helper: "Demo control",
    },
    hero: {
      announcement: "We’re Getting Married",
      date: "20 February 2027",
      cta: "RSVP",
      scroll: "Scroll to discover",
    },
    countdown: {
      title: "Until 20 February 2027",
      units: {
        days: "Days",
        hours: "Hours",
        minutes: "Minutes",
      },
    },
    welcome: {
      title: "Welcome!",
      text:
        "We warmly invite you to celebrate our wedding day with us in the beautiful town of Ronda, Andalusia. We look forward to sharing this unforgettable moment with our most special people.",
      gallery: [
        {
          title: "A painted afternoon",
          text: "Soft ceremony light, florals, and a quiet Andalusian horizon.",
          image: asset("gallery-1.svg"),
        },
        {
          title: "The editorial mood",
          text: "Muted blush, olive branches, and timeless romantic styling.",
          image: asset("gallery-2.svg"),
        },
        {
          title: "Ronda in bloom",
          text: "Stone textures, warm air, and refined Mediterranean tones.",
          image: asset("gallery-3.svg"),
        },
        {
          title: "Ceremony softness",
          text: "Watercolor silhouettes and paper-toned details.",
          image: asset("gallery-4.svg"),
        },
      ],
    },
    venue: {
      title: "The Venue",
      subtitle: "Where we celebrate",
      name: "Finca El Olivar",
      date: "20 February 2027",
      time: "14:00",
      addressLine1: "Camino de los Olivos s/n, Ronda",
      addressLine2: "Málaga, 29400 – España",
      mapsLabel: "Open in Maps",
      mapsHref:
        "https://www.google.com/maps/search/?api=1&query=Finca+El+Olivar+Camino+de+los+Olivos+Ronda+Malaga",
      image: asset("venue-watercolor.svg"),
    },
    programme: {
      title: "Day Programme",
      items: [
        ["14:00", "Arrival"],
        ["14:30", "Ceremony"],
        ["16:00", "Cocktails"],
        ["18:00", "Dinner"],
        ["20:00", "Cutting the Cake"],
        ["00:00", "Finish"],
      ],
    },
    dressCode: {
      title: "Dress Code",
      women: "Cocktail or formal dress",
      men: "Dark suit and tie",
    },
    preWedding: {
      title: "Pre-Wedding Events",
      subtitle: "Come Say Hello...",
      intro:
        "These are informal gatherings, so feel free to join us if you’re in the area.",
      events: [
        {
          title: "Welcome Drinks",
          date: "Friday, September 11th, 2026",
          time: "8:00 PM",
          location: "Bodega García Hidalgo, Ronda",
        },
        {
          title: "Farewell Brunch",
          date: "Sunday, September 13th, 2026",
          time: "12:00 PM",
          location: "Parador de Ronda (terrace)",
        },
      ],
    },
    location: {
      title: "Location & Transportation",
      address:
        "Finca El Olivar, Camino de los Olivos s/n, 29400 Ronda, Málaga – Spain",
      mapsLabel: "Google Maps",
      mapsHref:
        "https://www.google.com/maps/search/?api=1&query=Finca+El+Olivar+Camino+de+los+Olivos+Ronda+Malaga",
      routes: [
        "From Málaga: ~1h 30min via A-357 and A-367",
        "From Seville: ~2h via A-376",
        "From Marbella: ~1h via A-397",
      ],
    },
    accommodation: {
      title: "Accommodation",
      intro:
        "Finca El Olivar does not offer lodging. Here are some recommended options nearby.",
      items: [
        {
          name: "Parador de Ronda",
          location: "Ronda",
          distance: "2 km de la finca",
          phone: "+34 952 877 500",
          email: "ronda@parador.es",
          href: "https://www.parador.es/es/paradores/parador-de-ronda",
          label: "Visit Website",
        },
        {
          name: "Hotel Catalonia Ronda",
          location: "Ronda",
          distance: "1.5 km",
          phone: "+34 952 872 315",
          email: "ronda@hoteles-catalonia.es",
          href: "https://www.cataloniahotels.com/es/hotel/catalonia-ronda",
          label: "Visit Website",
          promoCode: "BODA2026",
        },
        {
          name: "Hotel Montelirio",
          location: "Ronda",
          distance: "Boutique | Sobre el Tajo",
          phone: "+34 952 873 855",
          email: "reservas@hotelmontelirio.com",
          href: "https://www.hotelmontelirio.com",
          label: "Visit Website",
        },
      ],
      footnote:
        "For hotels without direct agreements, please mention ‘Wedding at Finca El Olivar’ to access preferential rates.",
    },
    gifts: {
      title: "Gifts",
      text:
        "Your presence is our greatest gift. If you wish to give us something, please find our bank account information below:",
      accounts: [
        {
          bank: "CaixaBank – Alizee",
          iban: "IBAN: ES12 2100 0418 4502 0005 1332",
          swift: "SWIFT: CAIXESBBXXX",
        },
        {
          bank: "Banco Santander – Regnier",
          iban: "IBAN: ES76 0049 1500 5127 1034 2799",
          swift: "SWIFT: BSCHESMMXXX",
        },
      ],
    },
    rsvp: {
      title: "RSVP",
      subtitle: "Let us know if you can make it",
      honeypot: "Website",
      attendanceLabel: "Attendance",
      attendanceYes: "Yes, I’ll be there",
      attendanceNo: "Unfortunately, I can’t make it",
      guestCount: "Guest count",
      mainContact: "Person 1 (Main contact)",
      name: "Name",
      email: "Email",
      dietary: "Dietary requirements",
      children: "Children attending",
      childrenYes: "Yes",
      childrenNo: "No",
      message: "Message for the couple",
      submit: "Send RSVP",
      success: "Thank you. Your RSVP has been prepared beautifully.",
    },
    footer: {
      credit: "Made with love by The Digital Yes",
    },
  },
  es: {
    couple: {
      partnerOne: "Regnier",
      partnerTwo: "Alizee",
    },
    meta: {
      title: "Regnier & Alizee | Invitación de Boda",
    },
    audio: {
      on: "Música activada",
      off: "Música desactivada",
      helper: "Control",
    },
    hero: {
      announcement: "Nos Casamos",
      date: "20 de febrero de 2027",
      cta: "Confirmar asistencia",
      scroll: "Descubre más",
    },
    countdown: {
      title: "Faltan para el 20 de febrero de 2027",
      units: {
        days: "Días",
        hours: "Horas",
        minutes: "Minutos",
      },
    },
    welcome: {
      title: "¡Bienvenidos!",
      text:
        "Los invitamos con muchísima ilusión a celebrar nuestro gran día en la hermosa ciudad de Ronda, Andalucía. Nos encantará compartir este momento inolvidable con las personas más especiales de nuestra vida.",
      gallery: [
        {
          title: "Una tarde pintada",
          text: "Luz suave de ceremonia, flores y un horizonte andaluz en calma.",
          image: asset("gallery-1.svg"),
        },
        {
          title: "El tono editorial",
          text: "Blush empolvado, ramas de olivo y una elegancia atemporal.",
          image: asset("gallery-2.svg"),
        },
        {
          title: "Ronda en flor",
          text: "Piedra, aire cálido y una paleta mediterránea refinada.",
          image: asset("gallery-3.svg"),
        },
        {
          title: "Ceremonia suave",
          text: "Siluetas acuareladas y detalles de papel románticos.",
          image: asset("gallery-4.svg"),
        },
      ],
    },
    venue: {
      title: "El Lugar",
      subtitle: "Donde celebramos",
      name: "Finca El Olivar",
      date: "20 de febrero de 2027",
      time: "14:00",
      addressLine1: "Camino de los Olivos s/n, Ronda",
      addressLine2: "Málaga, 29400 – España",
      mapsLabel: "Abrir en Maps",
      mapsHref:
        "https://www.google.com/maps/search/?api=1&query=Finca+El+Olivar+Camino+de+los+Olivos+Ronda+Malaga",
      image: asset("venue-watercolor.svg"),
    },
    programme: {
      title: "Programa del día",
      items: [
        ["14:00", "Llegada"],
        ["14:30", "Ceremonia"],
        ["16:00", "Coctel"],
        ["18:00", "Cena"],
        ["20:00", "Corte de Tarta"],
        ["00:00", "Fin"],
      ],
    },
    dressCode: {
      title: "Código de Vestimenta",
      women: "Vestido cocktail o formal",
      men: "Traje oscuro y corbata",
    },
    preWedding: {
      title: "Eventos Pre-Boda",
      subtitle: "Vengan a saludarnos...",
      intro:
        "Son reuniones informales, así que si andan por la zona nos dará muchísimo gusto verlos.",
      events: [
        {
          title: "Copa de Bienvenida",
          date: "Viernes, 11 de septiembre de 2026",
          time: "20:00",
          location: "Bodega García Hidalgo, Ronda",
        },
        {
          title: "Brunch de Despedida",
          date: "Domingo, 13 de septiembre de 2026",
          time: "12:00",
          location: "Parador de Ronda (terraza)",
        },
      ],
    },
    location: {
      title: "Ubicación y Transporte",
      address:
        "Finca El Olivar, Camino de los Olivos s/n, 29400 Ronda, Málaga – España",
      mapsLabel: "Abrir en Google Maps",
      mapsHref:
        "https://www.google.com/maps/search/?api=1&query=Finca+El+Olivar+Camino+de+los+Olivos+Ronda+Malaga",
      routes: [
        "Desde Málaga: aprox. 1 h 30 min por la A-357 y la A-367",
        "Desde Sevilla: aprox. 2 h por la A-376",
        "Desde Marbella: aprox. 1 h por la A-397",
      ],
    },
    gifts: {
      title: "Regalos",
      text:
        "Su presencia es nuestro mejor regalo. Si desean tener un detalle con nosotros, aquí pueden encontrar nuestros datos bancarios:",
      accounts: [
        {
          bank: "CaixaBank – Alizee",
          iban: "IBAN: ES12 2100 0418 4502 0005 1332",
          swift: "SWIFT: CAIXESBBXXX",
        },
        {
          bank: "Banco Santander – Regnier",
          iban: "IBAN: ES76 0049 1500 5127 1034 2799",
          swift: "SWIFT: BSCHESMMXXX",
        },
      ],
    },
    rsvp: {
      title: "Confirmación",
      subtitle: "Queremos saber si podrán acompañarnos",
      honeypot: "Sitio web",
      attendanceLabel: "Asistencia",
      attendanceYes: "Sí, asistiré",
      attendanceNo: "Lamento no poder asistir",
      guestCount: "Número de invitados",
      mainContact: "Persona 1 (Contacto principal)",
      name: "Nombre",
      email: "Email",
      dietary: "Restricciones alimentarias",
      children: "¿Asisten niños?",
      childrenYes: "Sí",
      childrenNo: "No",
      message: "Mensaje para nosotros",
      submit: "Enviar confirmación",
      success: "Gracias. Tu confirmación quedó lista con mucho cariño.",
    },
    footer: {
      credit: "Hecho con cariño por The Digital Yes",
    },
  },
};
