/* Measurement sheet for remote clients: gown / suit / child field sets,
   saved as a draft in this browser, emailed to Shelena through FormSubmit, printable. */
(function () {
  const S = window.SMI;
  const form = document.getElementById("measure-form");
  if (!form) return;
  const box = document.getElementById("m-fields");
  const msg = form.querySelector(".m-msg");
  const KEY = "smi-measurements-draft";

  // numbers match the diagram on this page
  const FIELDS = {
    gown: ["1 Bust", "2 Underbust", "3 Natural waist", "4 High hip", "5 Full hip", "6 Shoulder width",
      "7 Shoulder to waist", "8 Hollow to floor", "9 Arm length", "10 Neck", "Height", "Heel height you'll wear"],
    suit: ["Chest", "3 Natural waist", "5 Seat", "6 Shoulder width", "9 Sleeve length", "10 Neck",
      "Inseam", "Outseam", "Thigh", "Height", "Shoe size"],
    child: ["1 Chest", "3 Waist", "5 Hips", "6 Shoulder width", "7 Shoulder to waist", "8 Neck to floor",
      "9 Arm length", "Height", "Age"],
  };
  const slug = (label) => label.toLowerCase().replace(/^\d+\s*/, "").replace(/[^a-z]+/g, "_");
  const noUnit = new Set(["age", "shoe_size", "heel_height_you_ll_wear"]);

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } }
  function save() {
    const data = {};
    new FormData(form).forEach((v, k) => { if (k !== "_honey") data[k] = v; });
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
  }

  function render() {
    const fit = form.fit.value;
    const units = form.units.value === "inches" ? "in" : "cm";
    const draft = load();
    box.innerHTML = FIELDS[fit].map((label) => {
      const id = "m-" + slug(label);
      const unit = noUnit.has(slug(label)) ? "" : `<span class="unit">${units}</span>`;
      const val = draft[slug(label)] || "";
      return `<div class="mfield"><label for="${id}">${label}</label>
        <div class="minput"><input id="${id}" name="${slug(label)}" inputmode="decimal" autocomplete="off" value="${val.replace(/"/g, "&quot;")}">${unit}</div></div>`;
    }).join("");
  }

  // restore draft choices before first render
  const d = load();
  ["fit", "units", "by"].forEach((n) => { if (d[n] && form.querySelector(`input[name="${n}"][value="${d[n]}"]`)) form.querySelector(`input[name="${n}"][value="${d[n]}"]`).checked = true; });
  ["client_name", "contact", "notes"].forEach((n) => { if (d[n]) form.elements[n].value = d[n]; });
  render();

  form.addEventListener("change", (e) => { if (e.target.name === "fit" || e.target.name === "units") { save(); render(); } else save(); });
  form.addEventListener("input", save);
  document.getElementById("m-print").addEventListener("click", () => window.print());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.elements.client_name.value.trim() || !form.contact.value.trim()) {
      msg.textContent = "Please add your name and a phone number or email.";
      (form.elements.client_name.value.trim() ? form.contact : form.elements.client_name).focus();
      return;
    }
    const filled = [...box.querySelectorAll("input")].filter((i) => i.value.trim());
    if (filled.length < 3) { msg.textContent = "Add at least a few measurements before sending."; box.querySelector("input").focus(); return; }
    if (form._honey.value) { msg.textContent = "Sent. Thank you!"; return; }

    const units = form.units.value;
    const payload = {
      _subject: `Measurements: ${form.elements.client_name.value.trim()} (${form.fit.value})`,
      _template: "table",
      _captcha: "false",
      Name: form.elements.client_name.value.trim(),
      Contact: form.contact.value.trim(),
      For: form.fit.value,
      Units: units,
      "Measured by": form.by.value,
    };
    filled.forEach((i) => { payload[box.querySelector(`label[for="${i.id}"]`).textContent] = i.value.trim(); });
    if (form.notes.value.trim()) payload.Notes = form.notes.value.trim();
    if (/@/.test(form.contact.value)) payload._replyto = form.contact.value.trim();

    const btn = document.getElementById("m-submit");
    btn.disabled = true;
    msg.textContent = "Sending…";
    try {
      const r = await fetch(S.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok || String(body.success) === "false") throw new Error(body.message || r.status);
      msg.textContent = "Sent to Shelena. Thank you! She'll be in touch if anything needs a second look.";
      try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    } catch {
      const text = Object.entries(payload).filter(([k]) => !k.startsWith("_")).map(([k, v]) => `${k}: ${v}`).join("\n");
      msg.innerHTML = `That didn't go through. Nothing is lost: <a href="sms:+1${S.phone}?&body=${encodeURIComponent(text)}">send by text</a> or <a href="mailto:${S.email}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(text)}">by email</a>.`;
    } finally {
      btn.disabled = false;
    }
  });
})();
