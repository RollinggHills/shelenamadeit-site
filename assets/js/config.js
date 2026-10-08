/* One place for every business fact on the site.
   Pages fill [data-fill="..."] and [data-price="..."] from here, so a price or phone
   change happens once. Values marked CONFIRM are best guesses — check with Shelena. */

window.SMI = {
  name: "Shelena Made It",
  designer: "Shelena Shulterbrandt",
  established: 2018,
  city: "Austin, Texas",                 // CONFIRM: business plan says Austin; old site FAQ says ships from Houston
  phone: "8323739260",
  phoneDisplay: "(832) 373-9260",
  email: "shebyshelena@gmail.com",
  hours: "Mon–Sat · 10am–6pm",
  instagram: "https://www.instagram.com/shebyshelena/",
  instagramHandle: "@shebyshelena",
  facebook: "https://www.facebook.com/shebyshelena/",
  pinterest: "https://www.pinterest.com/shebyshelena/",

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
  // Mailchimp embedded-form action URL (Audience → Signup forms → Embedded). Until set,
  // newsletter signups are emailed through formEndpoint instead.
  mailchimpAction: null,

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
  ],

  // Ready-to-wear. Prices from the live shop, Oct 2026. Checkout provider not chosen yet,
  // so "Order" opens a request in the booking flow.
  products: [
    { id: "selene", name: "Selene One Piece", price: 99.99, img: "shop-selene", alt: "Model in an orange sequin one-piece swimsuit beside a pool", cat: "Resort" },
    { id: "chantel", name: "Chantel 3-Piece Bikini Set", price: 99.99, img: "shop-chantel", alt: "Model in a lime fishnet three-piece bikini set on rocks by a waterfall", cat: "Resort" },
    { id: "gizzele", name: "Gizzele Balconette Swim Bra Set", price: 69.99, img: "shop-gizzele", alt: "Model in a blue balconette two-piece standing in a pool", cat: "Resort" },
    { id: "celeste", name: "Celeste Lace Sequin Bikini Set", price: 59.99, img: "shop-celeste", alt: "Model in a white lace bikini among tropical palms", cat: "Resort" },
    { id: "velvet-teddy", name: "Velvet Teddy", price: 89.99, img: "shop-velvet-teddy", alt: "Model in a red velvet teddy against a crimson backdrop", cat: "Intimates" },
  ],
};
