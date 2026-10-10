/* Stylists & Private Inquiries: one private inbox, automatic confirmation, spam trap. */
(function () {
  const S = window.SMI;
  const form = document.getElementById("private-form");
  if (!form) return;
  const msg = form.querySelector(".m-msg");
  const val = (n) => (form.elements[n] && form.elements[n].value || "").trim();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const missing = [["client_name", "your name"], ["email", "an email"], ["moment", "the moment"]].find(([n]) => !val(n));
    if (missing) { msg.textContent = `Please add ${missing[1]}.`; form.elements[missing[0]].focus(); return; }
    if (!/^\S+@\S+\.\S+$/.test(val("email"))) { msg.textContent = "Please check the email address."; form.elements.email.focus(); return; }
    if (form._honey.value) { done(); return; }

    const payload = {
      _subject: `Private inquiry: ${val("client_name")} (${val("role")})`,
      _template: "table",
      _captcha: "false",
      _replyto: val("email"),
      _autoresponse: "Thank you. Shelena will be in touch personally to begin. Your details stay private. With elegance, Shelena",
      Name: val("client_name"),
      Role: val("role"),
      email: val("email"),
      Phone: val("phone") || "(not given)",
      "The moment": val("moment"),
      "Date needed": val("date_needed") || "(not given)",
      City: val("city") || "(not given)",
      Fittings: val("fittings"),
    };
    if (val("discretion")) payload["Discretion needs"] = val("discretion");
    if (val("inspiration")) payload.Inspiration = val("inspiration");

    const btn = document.getElementById("p-submit");
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
      done();
    } catch {
      msg.innerHTML = `That didn't go through. Please email <a href="mailto:${S.email}">${S.email}</a> or text <a href="sms:+1${S.phone}">${S.phoneDisplay}</a>.`;
    } finally {
      btn.disabled = false;
    }
  });

  function done() {
    form.innerHTML = '<p class="lede">Thank you. Shelena will be in touch personally to begin. Your details stay private.</p>';
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
