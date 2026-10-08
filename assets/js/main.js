/* Shared behaviour for every page: header, mobile menu, sticky book bar,
   scroll reveals, filling business facts from config.js, newsletter signup. */
(function () {
  const S = window.SMI;
  document.documentElement.classList.remove("no-js");

  // ---- business facts from config ----
  const money = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const fills = {
    phone: S.phoneDisplay, email: S.email, hours: S.hours, city: S.city,
    year: String(new Date().getFullYear()), years: String(new Date().getFullYear() - S.established),
    established: String(S.established), consultMinutes: String(S.consult.minutes),
    consultFee: money(S.consult.fee), rushFee: money(S.timeline.rushFee),
    standardMonths: S.timeline.standardMonths, rushMonths: S.timeline.rushMonths, deposit: S.deposit,
  };
  document.querySelectorAll("[data-fill]").forEach((el) => {
    const v = fills[el.dataset.fill];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll("[data-href]").forEach((el) => {
    const kind = el.dataset.href;
    if (kind === "tel") el.href = "tel:+1" + S.phone;
    if (kind === "sms") el.href = "sms:+1" + S.phone;
    if (kind === "email") el.href = "mailto:" + S.email;
    if (S[kind]) el.href = S[kind];
  });
  document.querySelectorAll("[data-price]").forEach((el) => {
    const svc = S.services.find((s) => s.id === el.dataset.price);
    if (!svc) return;
    el.innerHTML = svc.from ? `<small>From</small>${money(svc.from)}` : svc.priceNote;
  });

  // plain amount inside a sentence: "bridal from $1,800"
  document.querySelectorAll("[data-amount]").forEach((el) => {
    const svc = S.services.find((s) => s.id === el.dataset.amount);
    if (svc && svc.from) el.textContent = money(svc.from);
  });

  // ---- header ----
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- mobile menu ----
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
  }

  // ---- sticky book bar: appears once the hero's own buttons scroll away ----
  const bar = document.querySelector(".book-bar");
  const heroCta = document.querySelector("[data-hero-cta]");
  if (bar && heroCta && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle("is-visible", show);
      bar.inert = !show;
    }).observe(heroCta);
    bar.inert = true;
  } else if (bar) {
    bar.classList.add("is-visible");
  }

  // ---- reveal on scroll ----
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // ---- newsletter ----
  document.querySelectorAll("form[data-newsletter]").forEach((form) => {
    const msg = form.parentElement.querySelector(".newsletter-msg");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = "Please enter a valid email address."; form.email.focus(); return; }
      if (S.mailchimpAction) { form.action = S.mailchimpAction; form.method = "post"; form.submit(); return; }
      msg.textContent = "Joining…";
      try {
        const r = await fetch(S.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ _subject: "Newsletter signup", email, _template: "table" }),
        });
        if (!r.ok) throw new Error(r.status);
        msg.textContent = "You're on the list. Welcome.";
        form.reset();
      } catch {
        msg.textContent = "That didn't go through. Please try again in a moment.";
      }
    });
  });
})();
