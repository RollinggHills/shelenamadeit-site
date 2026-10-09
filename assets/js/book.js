/* Booking flow: 4 short steps → one email to Shelena.
   - ?service=bridal preselects a service and skips to step 2
   - ?item=selene turns it into a ready-to-wear order request (no consultation step)
   - progress is saved as a draft in this browser until the request is sent */
(function () {
  const S = window.SMI;
  const form = document.getElementById("booking");
  if (!form) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const DRAFT_KEY = "smi-booking-draft";
  const params = new URLSearchParams(location.search);

  // ---------- build service choices ----------
  const product = S.products.find((p) => p.id === params.get("item"));
  const choices = S.services.map((s) => ({ ...s }));
  if (product) {
    choices.unshift({
      id: "shop", name: product.name, kind: "shop", img: product.img, alt: product.alt,
      from: null, priceNote: "$" + product.price.toFixed(2) + " · ready-to-wear",
    });
  }
  const priceText = (s) => (s.from ? "From " + money(s.from) : s.priceNote);

  $("#service-options").innerHTML = choices.map((s) => `
    <div class="choice">
      <input type="radio" name="service" id="svc-${s.id}" value="${s.id}">
      <label for="svc-${s.id}">
        <img src="assets/img/${s.img}-800.webp" alt="" width="64" height="64" loading="lazy">
        <span><span class="t">${s.name}</span><span class="p">${priceText(s)}</span></span>
      </label>
    </div>`).join("");

  $("#day-chips").innerHTML = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) =>
    `<span class="chip"><input type="checkbox" name="days" id="d-${d}" value="${d}"><label for="d-${d}">${d}</label></span>`
  ).join("");

  // ready-to-wear: colour + size (sets take separate top/bottom sizes), built from the product
  if (product) {
    const chips = (name, label, opts, type = "radio") => `
      <fieldset class="q" data-for="shop"><legend>${label}</legend><div class="chips">${opts.map((o, i) =>
        `<span class="chip"><input type="${type}" name="${name}" id="${name}-${i}" value="${o}"><label for="${name}-${i}">${o}</label></span>`
      ).join("")}</div><p class="error" id="${name}-error" role="alert"></p></fieldset>`;
    const sizes = [...S.sizes, "Custom"];
    $("#shop-options").innerHTML = chips("color", "Colour", product.colors) +
      (product.sizing === "set" ? chips("top_size", "Top size", sizes) + chips("bottom_size", "Bottom size", sizes)
        : chips("size", "Size", sizes)) +
      `<p class="hint" data-for="shop">Every piece is made to order. Choose “Custom” and Shelena will take your measurements.</p>`;
  }

  const service = () => choices.find((s) => s.id === (form.service.value || ""));
  const kind = () => (service() ? service().kind : null);

  // ---------- budget chips scale with the service's starting price ----------
  function renderBudgets() {
    const s = service();
    const box = $("#budget-chips");
    if (!s || !s.from) { box.innerHTML = ""; return; }
    const r = (n) => Math.round(n / 100) * 100;
    const a = s.from, b = r(a * 1.6), c = r(a * 2.6);
    const opts = [`${money(a)}–${money(b)}`, `${money(b)}–${money(c)}`, `${money(c)}+`, "Not sure yet"];
    const prev = form.budget ? form.budget.value : "";
    box.innerHTML = opts.map((o, i) =>
      `<span class="chip"><input type="radio" name="budget" id="b-${i}" value="${o}"${o === prev ? " checked" : ""}><label for="b-${i}">${o}</label></span>`
    ).join("");
  }

  // ---------- steps ----------
  // ready-to-wear orders and illustrations don't need a consultation slot
  const sequence = () => (["shop", "illustration"].includes(kind()) ? ["1", "2", "4"] : ["1", "2", "3", "4"]);
  let current = "1";

  function applyKind() {
    const k = kind();
    $$("[data-for]").forEach((el) => {
      const on = !!k && el.dataset.for.split(" ").includes(k);
      el.hidden = !on;
      $$("input, select, textarea", el).forEach((i) => (i.disabled = !on));
    });
    const intro = {
      bespoke: "Brief your designer. Tell Shelena about the moment and how you want to feel; the design is hers to create.",
      alteration: "So Shelena can plan your fitting around your event.",
      class: "So your lesson starts at the right level.",
      shop: "Pick your colour and size. Shelena will confirm and arrange payment with you.",
      illustration: `A hand-drawn fashion illustration, usually ready in ${S.illustrationTime}.`,
    };
    $("#s2-intro").textContent = intro[k] || intro.bespoke;
    $("#date-label").textContent = k === "illustration" ? "Needed by (optional)" : "Event date";
    $("#s2-title").innerHTML = k === "shop" ? "Colour &amp; <em>size</em>" : k === "class" ? "About <em>you</em>"
      : k === "illustration" ? "About your <em>illustration</em>"
      : "Tell us about the <em>occasion</em>";
    renderBudgets();
  }

  function show(step, { focus = true } = {}) {
    current = step;
    $$(".step", form).forEach((el) => (el.hidden = el.dataset.step !== step));
    const seq = sequence();
    const idx = seq.indexOf(step);
    if (idx >= 0) {
      const label = $(`.step[data-step="${step}"] .step-count`);
      if (label) label.textContent = `Step ${idx + 1} of ${seq.length}`;
      const bar = $(".progress");
      bar.setAttribute("aria-valuemax", seq.length);
      bar.setAttribute("aria-valuenow", idx + 1);
      $(".progress span").style.width = ((idx + 1) / seq.length) * 100 + "%";
    } else {
      $(".progress span").style.width = "100%";
    }
    if (step === "4") renderReview();
    if (focus) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const h = $(`.step[data-step="${step}"] h1`);
      if (h) h.focus({ preventScroll: true });
    }
  }

  const go = (dir) => {
    const seq = sequence();
    const next = seq[seq.indexOf(current) + dir];
    if (next) show(next);
  };

  // ---------- validation ----------
  const setErr = (id, msg, input) => {
    $("#" + id).textContent = msg || "";
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  };
  const digits = (v) => v.replace(/\D/g, "");

  function validate(step) {
    if (step === "1") {
      const ok = setErr("service-error", service() ? "" : "Choose one to continue.");
      if (!ok) { $("#service-options input").focus(); return false; }
      if (kind() === "bespoke") {
        const agreed = setErr("pledge-error", form.pledge.checked ? "" : "Every commission is an original design. Tick the box to continue.");
        if (!agreed) { form.pledge.focus(); return false; }
      }
      return true;
    }
    if (step === "2") {
      const k = kind();
      if (k === "bespoke" && checked("vibe").length > 3) {
        setErr("vibe-error", "Choose up to three. Shelena will take it from there.");
        $("#vibe-chips input").focus();
        return false;
      }
      if (k === "bespoke" || k === "alteration" || k === "illustration") {
        const date = form.event_date, none = form.no_date.checked || k === "illustration";
        let msg = "";
        if (!none && !date.value) msg = "Add your event date, or tick “No date yet”.";
        else if (date.value && daysUntil(date.value) < 0) msg = "That date has passed. Choose a future date.";
        const ok = setErr("date-error", msg, date);
        if (!ok) date.focus();
        return ok;
      }
      if (k === "shop") {
        const need = ["color", ...(product.sizing === "set" ? ["top_size", "bottom_size"] : ["size"])];
        const missing = need.filter((n) => !form[n].value);
        need.forEach((n) => setErr(n + "-error", missing.includes(n) ? "Choose one." : ""));
        if (missing.length) $(`input[name="${missing[0]}"]`).focus();
        return !missing.length;
      }
      return true;
    }
    if (step === "4") {
      const first = form.first_name, phone = form.phone, email = form.email;
      const okE = setErr("email-error", email.value && !/^\S+@\S+\.\S+$/.test(email.value) ? "Check this email address." : "", email);
      const okP = setErr("phone-error", digits(phone.value).length < 10 ? "Add a mobile number so Shelena can reach you." : "", phone);
      const okF = setErr("first-name-error", first.value.trim() ? "" : "Add your first name.", first);
      const bad = [!okF && first, !okP && phone, !okE && email].find(Boolean);
      if (bad) bad.focus();
      if (form.contact_pref.value === "Email" && !email.value) {
        setErr("email-error", "Add your email, or choose text or call.", email);
        if (!bad) email.focus();
        return false;
      }
      return !bad;
    }
    return true;
  }

  // ---------- event-date feedback ----------
  function daysUntil(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((new Date(y, m - 1, d) - today) / 86400000);
  }

  function updateTimeline() {
    const box = $("#timeline-msg");
    const date = form.event_date;
    date.disabled = form.no_date.checked || kind() == null || date.closest("[hidden]") != null;
    if (form.no_date.checked) date.value = "";
    if (!date.value || form.no_date.checked) { box.hidden = true; return; }
    const days = daysUntil(date.value);
    const t = S.timeline;
    let cls = "", html = "";
    if (days < 0) { box.hidden = true; return; }
    if (kind() === "illustration") {
      html = days < 7
        ? `<strong>That's quick.</strong> Illustrations usually take ${S.illustrationTime}. Shelena will tell you right away if she can make it.`
        : "<strong>Plenty of time.</strong> Your illustration will be ready well before then.";
      cls = days < 7 ? "is-warn" : "is-good";
    } else if (kind() === "alteration") {
      html = days < 14
        ? "<strong>That's soon.</strong> We'll confirm right away whether a fitting can be fit in before your event."
        : "<strong>Good timing.</strong> We'll schedule your fittings around your event date.";
      cls = days < 14 ? "is-warn" : "is-good";
    } else if (days < 30) {
      cls = "is-warn";
      html = "<strong>That's very soon.</strong> Send your request today and Shelena will tell you honestly what's possible.";
    } else if (days < 60) {
      cls = "is-warn";
      html = `<strong>This needs rush service</strong> (${t.rushMonths} months, +${money(t.rushFee)}). Book now to hold your spot.`;
    } else if (days < 120) {
      cls = "is-good";
      html = `<strong>Right on schedule.</strong> Bespoke takes ${t.standardMonths} months, so now is the perfect time to start.`;
    } else {
      cls = "is-good";
      html = "<strong>Wonderful — plenty of time</strong> for a relaxed design process and extra fittings.";
    }
    box.className = "timeline-msg " + cls;
    box.innerHTML = html;
    box.hidden = false;
  }

  // ---------- summary + review ----------
  const fmtDate = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };
  const checked = (name) => $$(`input[name="${name}"]:checked:not(:disabled)`, form).map((i) => i.value);
  const val = (name) => {
    const el = form.elements[name];
    if (!el) return "";
    if (el instanceof RadioNodeList) { const c = checked(name); return c.join(", "); }
    return el.disabled ? "" : (el.value || "").trim();
  };

  function details() {
    const s = service();
    const k = kind();
    const rows = [];
    if (!s) return rows;
    rows.push(["Service", k === "shop" ? "Ready-to-wear: " + s.name : s.name]);
    if (k === "shop") {
      rows.push(["Colour", val("color")]);
      if (product.sizing === "set") { rows.push(["Top size", val("top_size")]); rows.push(["Bottom size", val("bottom_size")]); }
      else rows.push(["Size", val("size")]);
    }
    if (k === "illustration") {
      rows.push(["Illustrate", val("illus_subject")]);
      rows.push(["Type", val("illus_type")]);
      if (form.event_date.value) rows.push(["Needed by", fmtDate(form.event_date.value)]);
    }
    if (k === "bespoke" || k === "alteration") {
      rows.push(["Event date", form.no_date.checked ? "No date yet" : form.event_date.value ? fmtDate(form.event_date.value) : ""]);
    }
    if (k === "bespoke") {
      rows.push(["Feeling", checked("vibe").join(", ")]);
      rows.push(["Story", val("story")]);
      rows.push(["For", val("for_whom")]); rows.push(["Budget", val("budget")]);
      if (form.addon_illustration.checked) rows.push(["Add-on", "Keepsake illustration"]);
    }
    if (k === "alteration") rows.push(["Garment", val("garment")]);
    if (k === "class") { rows.push(["Experience", val("level")]); rows.push(["Wants to make", val("class_goal")]); }
    if (k !== "shop" && k !== "illustration") {
      rows.push(["Meet", val("format")]);
      rows.push(["Days", checked("days").join(", ")]);
      rows.push(["Times", checked("times").join(", ")]);
    }
    return rows.filter(([, v]) => v);
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function renderSummary() {
    const s = service();
    $("#summary").dataset.empty = s ? "false" : "true";
    if (!s) return;
    const img = $("#sum-img");
    const src = `assets/img/${s.img}-800.webp`;
    if (!img.src.endsWith(src)) img.src = src;
    $("#sum-title").textContent = s.name;
    $("#sum-price").textContent = kind() === "shop" ? s.priceNote
      : kind() === "illustration" ? `${s.priceNote} · ready in ${S.illustrationTime}`
      : `${priceText(s)} · ${S.consult.minutes}-min design consultation`;
    $("#sum-list").innerHTML = details().slice(1)
      .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  }

  function renderReview() {
    const rows = details();
    $("#review").innerHTML = rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  }

  // ---------- draft (per-browser convenience only) ----------
  function saveDraft() {
    const data = {};
    $$("input, select, textarea", form).forEach((el) => {
      if (!el.name || el.name === "_honey") return;
      if (el.type === "radio" || el.type === "checkbox") { if (el.checked) (data[el.name] ||= []).push(el.value); }
      else if (el.value) data[el.name] = el.value;
    });
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
  }
  function loadDraft() {
    let data;
    try { data = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch { data = null; }
    if (!data) return;
    $$("input, select, textarea", form).forEach((el) => {
      const v = data[el.name];
      if (v == null || el.name === "_honey") return;
      if (el.type === "radio" || el.type === "checkbox") el.checked = Array.isArray(v) && v.includes(el.value);
      else el.value = v;
    });
  }
  const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } };

  // ---------- submit ----------
  async function submit() {
    const btn = $("#submit-btn");
    const errBox = $("#send-error");
    errBox.hidden = true;

    const s = service();
    const name = [val("first_name"), val("last_name")].filter(Boolean).join(" ");
    const payload = {
      _subject: `New ${{ shop: "order request", illustration: "illustration request" }[kind()] || "commission request"}: ${s.name} — ${name}`,
      _template: "table",
      _captcha: "false",
      Name: name,
      Phone: val("phone"),
      email: val("email") || "(not given)",
      "Contact by": val("contact_pref"),
    };
    details().forEach(([k, v]) => (payload[k] = v));
    if (val("notes")) payload.Vision = val("notes");
    if (val("inspiration")) payload.Inspiration = val("inspiration");
    if (val("source")) payload["Found us via"] = val("source");
    if (val("email")) {
      payload._replyto = val("email");
      // FormSubmit emails this to the customer so they know it arrived
      payload._autoresponse = kind() === "illustration"
        ? `Thank you for requesting a fashion illustration from Shelena Made It! Shelena will be in touch shortly to talk through your piece. Feel free to reply with any photos. Questions? Text ${S.phoneDisplay}.`
        : kind() === "shop"
        ? `Thank you for your order request for the ${s.name}! Shelena will be in touch shortly to confirm your colour, size and payment. Questions? Text ${S.phoneDisplay}.`
        : `Thank you for beginning a commission with Shelena Made It! Shelena will reach out personally to set your design consultation. Come ready to talk about the feeling, the moment and the story; she'll design the rest. Questions? Text ${S.phoneDisplay}. — Shelena Made It`;
    }

    // bots fill the hidden field; pretend it worked and send nothing
    if (form._honey.value) { done(); return; }

    btn.disabled = true;
    btn.firstChild.textContent = "Sending… ";
    try {
      const r = await fetch(S.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok || String(body.success) === "false") throw new Error(body.message || r.status);
      done();
    } catch (e) {
      const text = Object.entries(payload).filter(([k]) => !k.startsWith("_"))
        .map(([k, v]) => `${k}: ${v}`).join("\n");
      errBox.innerHTML = `Sorry, your request didn't go through. Nothing is lost: ` +
        `<a href="sms:+1${S.phone}?&body=${encodeURIComponent("Hi Shelena! Consultation request:\n" + text)}">send it by text</a> or ` +
        `<a href="mailto:${S.email}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(text)}">by email</a> instead.`;
      errBox.hidden = false;
      console.warn("Booking submit failed:", e);
    } finally {
      btn.disabled = false;
      btn.firstChild.textContent = "Send my request ";
    }
  }

  function done() {
    clearDraft();
    $("#done-name").textContent = val("first_name") || "love";
    const how = { Text: "reaches out by text", Call: "calls you", Email: "emails you" }[val("contact_pref")] || "reaches out";
    $("#done-contact").textContent = kind() === "illustration"
      ? `Shelena ${how} to talk through your illustration and timing.`
      : kind() === "shop"
      ? `Shelena ${how} to confirm your size and arrange payment.`
      : `Shelena ${how} to confirm a time that works.`;
    if (S.acuityUrl && !["shop", "illustration"].includes(kind())) { const a = $("#done-acuity"); a.href = S.acuityUrl; a.hidden = false; }
    $("#summary").hidden = true;
    show("done");
  }

  // ---------- wiring ----------
  form.addEventListener("click", (e) => {
    if (e.target.closest("[data-next]")) { if (validate(current)) go(1); }
    if (e.target.closest("[data-back]")) go(-1);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (current !== "4") { if (validate(current)) go(1); return; }
    if (validate("4")) submit();
  });
  form.addEventListener("change", (e) => {
    if (e.target.name === "service") { setErr("service-error", ""); applyKind(); }
    if (e.target.name === "pledge") setErr("pledge-error", "");
    if (e.target.name === "vibe") setErr("vibe-error", checked("vibe").length > 3 ? "Choose up to three." : "");
    if (["color", "size", "top_size", "bottom_size"].includes(e.target.name)) setErr(e.target.name + "-error", "");
    if (e.target.name === "event_date" || e.target.name === "no_date") { setErr("date-error", "", form.event_date); updateTimeline(); }
    renderSummary();
    saveDraft();
  });
  form.addEventListener("input", (e) => {
    if (e.target.getAttribute("aria-invalid") === "true") e.target.setAttribute("aria-invalid", "false");
    saveDraft();
  });
  // Enter on a step's text field moves forward instead of submitting early
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && current !== "4") { e.preventDefault(); if (validate(current)) go(1); }
  });

  // ---------- start ----------
  form.event_date.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  loadDraft();
  const wanted = product ? "shop" : params.get("service");
  if (wanted && choices.some((s) => s.id === wanted)) $("#svc-" + wanted).checked = true;
  applyKind();
  updateTimeline();
  renderSummary();
  show(wanted && service() ? "2" : "1", { focus: false });
})();
