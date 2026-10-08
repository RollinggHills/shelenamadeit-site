/* One place for every business fact on the site.
   Pages fill [data-fill="..."] and [data-price="..."] from here, so a price or phone
   change happens once. Values marked CONFIRM are best guesses — check with Shelena. */

window.SMI = {
  name: "Shelena Made It",
  designer: "Shelena Shulterbrandt",
  established: 2018,
  city: "Austin, Texas",                 // her Instagram bio says ATX; business plan says Austin
  phone: "8323739260",
  phoneDisplay: "(832) 373-9260",
  email: "shebyshelena@gmail.com",
  hours: "Mon–Sat · 10am–6pm",
  instagram: "https://www.instagram.com/shebyshelena/",
  instagramHandle: "@shebyshelena",
  facebook: "https://www.facebook.com/shebyshelena/",
  pinterest: "https://www.pinterest.com/shebyshelena/",

  // Seasonal banner on the homepage. Set to null to hide it.
  // From her Instagram bio (2026): "Limited Prom 2027 Commissions · By Appointment Only · ATX"
  announcement: {
    text: "Now booking Prom 2027. Limited commissions.",
    link: "book.html?service=occasion",
    cta: "Reserve yours",
  },

  consult: {
    minutes: 30,
    fee: 75,                             // CONFIRM: from business plan; is it credited toward the order?
  },
  timeline: { standardMonths: "2–4", rushMonths: "1–2", rushFee: 200 },
  deposit: "50%",                        // non-refundable, due before production starts

  // Where booking requests go. FormSubmit emails each request to her inbox.
  // The FIRST submission triggers a one-time "activate" email to this address — click it once.
  formEndpoint: "https://formsubmit.co/ajax/shebyshelena@gmail.com",
  // Set to her Acuity link once online scheduling is switched back on (it is OFF as of Oct 2026).
  acuityUrl: null,
  // Her existing Mailchimp audience (found in her old site's Mailchimp popup script).
  // Signups from the popup and footer go straight into this list.
  mailchimp: { url: "https://mc.us15.list-manage.com/subscribe/post-json", u: "e9a2e08a67ecb3932eb57fd7a", id: "6a779a0637" },

  // Email-signup popup. Waits until the visitor is engaged; never on the booking page.
  // Set to null to turn it off. The discount code itself is sent by her Mailchimp welcome email.
  popup: {
    offer: "10% off your first order",
    text: "Be the first to hear about new pieces, open booking dates and private sales.",
    afterSeconds: 25,
    afterScrollPercent: 50,
    snoozeDays: 14,
  },

  // CONFIRM all prices. Business plan (Aug 2026) vs old site FAQ:
  //   bridal 1800 (site: 1500) · evening 1200 (site: prom gown 600) · menswear 600 (site: prom suit 400)
  services: [
    {
      id: "bridal", name: "Bridal", from: 1800,
      blurb: "Wedding gowns, reception looks and the whole bridal party.",
      img: "bride-train", alt: "Bride in an ivory gown with a long train of hand-applied gold leaves",
      kind: "bespoke",
    },
    {
      id: "occasion", name: "Prom & Evening", from: 1200,
      blurb: "Prom, galas, quinceañeras, milestone birthdays — a gown nobody else will wear.",
      img: "prom-couple", alt: "Prom couple in a coordinated red gown and black tuxedo",
      kind: "bespoke",
    },
    {
      id: "menswear", name: "Suits & Menswear", from: 600,
      blurb: "Custom suits and tuxedos cut to your measurements, in any colour.",
      img: "suit-purple", alt: "Young man in a custom purple suit with gold trim",
      kind: "bespoke",
    },
    {
      id: "kids", name: "Children's Couture", from: 400,
      blurb: "Flower girls, ring bearers, pageants and first birthdays.",
      img: "kids-gold", alt: "Girl in an ivory tulle dress with a gold-embroidered bodice",
      kind: "bespoke",
    },
    {
      id: "alterations", name: "Fittings & Alterations", from: null, priceNote: "Quoted at fitting",
      blurb: "Hems, take-ins and bridal alterations, including gowns bought elsewhere.",
      img: "studio-dressform", alt: "Shelena pinning an ivory garment on a dress form",
      kind: "alteration",
    },
    {
      id: "sewing", name: "Sewing Classes", from: null, priceNote: "Ask for rates",
      blurb: "Learn to make your own pieces, one-on-one with the designer.",
      img: "studio-sewing", alt: "Shelena in her studio beside a dress form",
      kind: "class",
    },
    {
      // CONFIRM price with Shelena; swap the image for photos of her real illustrations when she sends them
      id: "illustration", name: "Fashion Illustrations", from: null, priceNote: "Ask for rates",
      blurb: "Your gown, drawn by hand. On its own or added to a custom piece.",
      img: "gown-hanging", alt: "Ivory gown with gold leaf appliqué hanging on a brick wall",
      kind: "illustration",
    },
  ],
  illustrationTime: "5 days to 2 weeks",

  // Ready-to-wear, from her WooCommerce admin (Oct 2026). All made to order / pre-order; one price per product.
  // sizing "set" = separate top and bottom sizes. Old URLs: /product/<slug>/ (keep for 301 redirects).
  sizes: ["XS", "S", "M", "L", "XL", "2X", "3X"],
  products: [
    { id: "selene", slug: "custom-one-piece-sequin-swimsuit", name: "Selene One Piece", price: 99.99, cat: "Resort",
      img: "shop-selene", alt: "Model in an orange sequin one-piece swimsuit beside a pool", sizing: "single",
      colors: ["Black", "Blue", "Green", "Orange", "Pink", "Purple", "Red"],
      blurb: "Shimmering sequins, adjustable straps and a padded bustier for support." },
    { id: "chantel", slug: "fishnet-3-piece-swim-set", name: "Chantel 3-Piece Bikini Set", price: 99.99, cat: "Resort",
      img: "shop-chantel", alt: "Model in a lime fishnet three-piece bikini set on rocks by a waterfall", sizing: "set",
      colors: ["Black", "Blue", "Green", "Orange", "Pink", "Purple", "Red", "White"],
      blurb: "Textured fishnet over nude spandex, with a matching cropped shirt." },
    { id: "gizzele", slug: "balconette-swim-bra-french-bikini", name: "Gizzele Balconette Swim Bra Set", price: 69.99, cat: "Resort",
      img: "shop-gizzele", alt: "Model in a blue balconette two-piece standing in a pool", sizing: "set",
      colors: ["Black", "Blue", "Green", "Orange", "Pink", "Purple", "Red", "White", "Yellow"],
      blurb: "Bustier-style balconette top with matching French-cut bottoms." },
    { id: "celeste", slug: "lace-sequin-bikini-set", name: "Celeste Lace Sequin Bikini Set", price: 59.99, cat: "Resort",
      img: "shop-celeste", alt: "Model in a white lace bikini among tropical palms", sizing: "set",
      colors: ["Black", "White"],
      blurb: "Delicate lace and shimmering sequins, lined for comfort." },
    { id: "velvet-teddy", slug: "velvet-teddy-bodysuit", name: "Velvet Teddy", price: 89.99, cat: "Intimates",
      img: "shop-velvet-teddy", alt: "Model in a red velvet teddy against a crimson backdrop", sizing: "single",
      colors: ["Black", "Blue", "Green", "Pink", "Purple", "Red", "White"],
      blurb: "Plush velvet with built-in cups and adjustable straps." },
  ],
};
