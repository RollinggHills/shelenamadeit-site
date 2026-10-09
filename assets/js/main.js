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
    consultFee: money(S.consult.fee), designFee: S.designFee ? `A ${money(S.designFee)} design fee` : "A design fee", rushFee: money(S.timeline.rushFee),
    standardMonths: S.timeline.standardMonths, illustrationTime: S.illustrationTime, rushMonths: S.timeline.rushMonths, deposit: S.deposit,
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

  // ---- newsletter: one subscribe() for the footer form and the popup ----
  // Mailchimp's JSONP endpoint works from a static site with no backend.
  function subscribe(email) {
    if (!S.mailchimp) {
      return fetch(S.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ _subject: "Newsletter signup", email, _template: "table" }),
      }).then((r) => { if (!r.ok) throw new Error(r.status); return "ok"; });
    }
    // Post to her hosted Mailchimp form in a new tab: Mailchimp shows its captcha (if needed)
    // and the "confirm your email" step there. Runs inside the click, so browsers allow the tab.
    const mc = S.mailchimp;
    const f = document.createElement("form");
    f.action = mc.url; f.method = "post"; f.target = "_blank"; f.hidden = true;
    const fields = { u: mc.u, id: mc.id, EMAIL: email, MERGE0: email, mc_signupsource: "shelenamadeit.com" };
    fields[`b_${mc.u}_${mc.id}`] = ""; // Mailchimp's own bot trap, left empty
    Object.entries(fields).forEach(([k, v]) => {
      const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = v; f.appendChild(i);
    });
    document.body.appendChild(f);
    f.submit();
    f.remove();
    return Promise.resolve("handed-off");
  }
  const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };
  const JOINED = "smi-joined", SNOOZE = "smi-popup-snooze";

  function wireSignup(form, msg, onDone) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      if (!validEmail(email)) { msg.textContent = "Please enter a valid email address."; form.email.focus(); return; }
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      msg.textContent = "Joining…";
      try {
        const how = await subscribe(email);
        store.set(JOINED, "1");
        msg.textContent = how === "handed-off"
          ? "Almost there. Finish in the Mailchimp tab that just opened, then confirm from your inbox to get your welcome code."
          : "You're on the list. Check your inbox for your welcome code.";
        form.reset();
        if (onDone) onDone();
      } catch {
        msg.textContent = "That didn't go through. Please try again in a moment.";
      } finally {
        btn.disabled = false;
      }
    });
  }
  document.querySelectorAll("form[data-newsletter]").forEach((form) =>
    wireSignup(form, form.parentElement.querySelector(".newsletter-msg")));

  // ---- signup popup ----
  const P = S.popup;
  const snoozed = Number(store.get(SNOOZE) || 0) > Date.now();
  const onBooking = document.body.classList.contains("book-page");
  if (P && !onBooking && !store.get(JOINED) && !snoozed && typeof HTMLDialogElement === "function") {
    const dlg = document.createElement("dialog");
    dlg.className = "signup";
    dlg.setAttribute("aria-labelledby", "signup-title");
    dlg.innerHTML = `
      <div class="signup-media" aria-hidden="true"><img src="assets/img/evening-sequin-800.webp" alt="" width="750" height="952" loading="lazy"></div>
      <div class="signup-body">
        <button class="signup-close" type="button" aria-label="Close">×</button>
        <p class="eyebrow">The list</p>
        <h2 id="signup-title">${P.offer}</h2>
        <p class="signup-text">${P.text}</p>
        <form novalidate>
          <label class="sr-only" for="signup-email">Email address</label>
          <input id="signup-email" name="email" type="email" autocomplete="email" placeholder="Your email" required>
          <button class="btn btn--block" type="submit">Join the list</button>
        </form>
        <p class="signup-msg" role="status" aria-live="polite"></p>
        <p class="signup-fine">No spam, ever. Unsubscribe any time.</p>
      </div>`;
    document.body.appendChild(dlg);
    const snooze = () => store.set(SNOOZE, String(Date.now() + P.snoozeDays * 86400000));
    const close = () => { if (dlg.open) dlg.close(); };
    dlg.addEventListener("close", () => { if (!store.get(JOINED)) snooze(); });
    dlg.querySelector(".signup-close").addEventListener("click", close);
    dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); }); // backdrop click
    wireSignup(dlg.querySelector("form"), dlg.querySelector(".signup-msg"), () => setTimeout(close, 5000));

    let shown = false;
    const show = () => {
      if (shown || document.querySelector(".mobile-menu:not([hidden])")) return;
      shown = true;
      dlg.showModal();
    };
    setTimeout(show, P.afterSeconds * 1000);
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      if ((h.scrollTop + innerHeight) / h.scrollHeight * 100 >= P.afterScrollPercent && h.scrollTop > 400) show();
    }, { passive: true });
    document.addEventListener("mouseout", (e) => { if (!e.relatedTarget && e.clientY <= 0) show(); }); // leaving on desktop
  }
})();
