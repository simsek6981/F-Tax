/* EmailJS REST integration; no private credentials or recipient in browser code. */
(function (root) {
  'use strict';
  const TOPICS = ['Erstgespräch', 'Gründung und Rechtsformwahl', 'Buchhaltung', 'Lohnverrechnung', 'Bilanzierung', 'Steuerberatung', 'Sonstiges'];
  class ContactError extends Error {
    constructor(code, message, field = '') { super(message); this.code = code; this.field = field; }
  }
  function isConfigured(config) {
    return !!config && ['serviceId', 'templateId', 'publicKey'].every(key =>
      typeof config[key] === 'string' && /^[A-Za-z0-9_-]{3,160}$/.test(config[key]) && !/^(YOUR_|PASTE_|INSERT_)/i.test(config[key]));
  }
  function normalizeAndValidate(input) {
    if (String(input.website || '').trim()) throw new ContactError('spam', 'Die Anfrage konnte nicht verarbeitet werden.');
    const result = {};
    for (const [key, max] of [['from_name', 80], ['company', 120], ['from_email', 254], ['phone', 60], ['appointment', 160]]) {
      result[key] = String(input[key] || '').trim();
      if (result[key].length > max || /[\r\n\x00-\x1F\x7F]/.test(result[key])) throw new ContactError('validation', 'Bitte prüfen Sie dieses Feld.', key);
    }
    if (result.from_name.length < 2) throw new ContactError('validation', 'Bitte geben Sie Ihren Namen an.', 'from_name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.from_email)) throw new ContactError('validation', 'Bitte geben Sie eine gültige E-Mail-Adresse an.', 'from_email');
    result.topic = String(input.topic || 'Erstgespräch');
    if (!TOPICS.includes(result.topic)) throw new ContactError('validation', 'Bitte wählen Sie ein Anliegen aus.', 'topic');
    result.message = String(input.message || '').trim();
    if (result.message.length > 4000 || /\x00/.test(result.message)) throw new ContactError('validation', 'Die Nachricht darf höchstens 4.000 Zeichen enthalten.', 'message');
    return result;
  }
  async function sendMessage(input, config, fetcher = root.fetch) {
    if (!isConfigured(config)) throw new ContactError('configuration', 'Der Nachrichtenversand ist noch nicht eingerichtet.');
    const data = normalizeAndValidate(input);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetcher('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ service_id: config.serviceId, template_id: config.templateId, user_id: config.publicKey,
          template_params: { ...data, reply_to: data.from_email } })
      });
      if (!response.ok || response.status !== 200) {
        if (response.status === 429) throw new ContactError('rate_limit', 'Der Versand ist momentan ausgelastet. Bitte versuchen Sie es später erneut.');
        throw new ContactError('service', 'Die Anfrage konnte nicht übermittelt werden. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es später erneut.');
      }
      return { accepted: true };
    } catch (error) {
      if (error instanceof ContactError) throw error;
      if (error.name === 'AbortError') throw new ContactError('timeout', 'Die Übermittlung konnte nicht bestätigt werden. Bitte senden Sie nicht sofort erneut, um doppelte Nachrichten zu vermeiden.');
      throw new ContactError('network', 'Die Verbindung ist fehlgeschlagen. Ihre Eingaben bleiben erhalten. Bitte prüfen Sie Ihre Internetverbindung.');
    } finally { clearTimeout(timeout); }
  }
  function mount(document) {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    const submit = form.querySelector('[type="submit"]');
    const status = document.querySelector('[data-contact-status]');
    const notice = document.querySelector('[data-contact-notice]');
    const counter = document.querySelector('[data-message-count]');
    const message = form.elements.namedItem('message');
    let config = {};
    try { config = JSON.parse(document.getElementById('contact-config').textContent); } catch (_) {}
    const preview = root.FTAX_PREVIEW_ONLY === true;
    const ready = isConfigured(config) && !preview;
    submit.disabled = !ready;
    submit.textContent = ready ? 'Terminanfrage senden' : 'Versand noch nicht verfügbar';
    notice.hidden = ready;
    if (preview) notice.textContent = 'Vorschau: Sie können das Formular ansehen und ausfüllen. Es werden hier keine E-Mails versendet.';
    const params = new URLSearchParams(root.location ? root.location.search : '');
    const details = document.querySelector('.request-details');
    if (details && root.matchMedia?.('(max-width: 900px)').matches) details.open = false;
    if (TOPICS.includes(params.get('thema'))) { form.elements.namedItem('topic').value = params.get('thema'); const details=document.querySelector('.request-details'); if(details)details.open=true; }
    function setStatus(text, state) { status.textContent = text; status.dataset.state = state; }
    function updateCount() { counter.textContent = message.value.length + ' / 4.000'; }
    message.addEventListener('input', updateCount); updateCount();
    form.querySelectorAll('input, textarea, select').forEach(field => field.addEventListener('input', () => { field.setCustomValidity(''); field.removeAttribute('aria-invalid'); }));
    let sending = false, lastAccepted = 0;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!ready) { setStatus(preview ? 'In dieser Vorschau werden keine Nachrichten versendet.' : 'Der Nachrichtenversand ist noch nicht eingerichtet.', 'error'); return; }
      if (sending) return;
      if (Date.now() - lastAccepted < 30000) { setStatus('Ihre letzte Anfrage wurde bereits übermittelt. Bitte warten Sie kurz vor einer weiteren Nachricht.', 'error'); return; }
      form.querySelectorAll('input, textarea, select').forEach(field => { field.setCustomValidity(''); field.removeAttribute('aria-invalid'); });
      const input = {};
      for (const key of ['from_name', 'company', 'from_email', 'phone', 'topic', 'message', 'website', 'appointment']) input[key] = form.elements.namedItem(key).value;
      try { normalizeAndValidate(input); } catch (error) {
        setStatus(error.message, 'error');
        const field = error.field && form.elements.namedItem(error.field);
        if (field) { const details=field.closest?.('details'); if(details)details.open=true; field.setAttribute('aria-invalid', 'true'); field.setCustomValidity(error.message); field.focus(); field.reportValidity(); }
        return;
      }
      if (!form.reportValidity()) return;
      sending = true; submit.disabled = true; form.setAttribute('aria-busy', 'true'); submit.textContent = 'Wird übermittelt …'; setStatus('Ihre Anfrage wird übermittelt.', 'pending');
      try {
        await sendMessage(input, config);
        lastAccepted = Date.now(); form.reset(); updateCount();
        setStatus('Vielen Dank. Ihre Terminanfrage wurde übermittelt. Ein Termin wird erst nach persönlicher Rückmeldung bestätigt.', 'success');
      } catch (error) { setStatus(error.message, 'error'); }
      finally { sending = false; submit.disabled = false; submit.textContent = 'Terminanfrage senden'; form.setAttribute('aria-busy', 'false'); }
    });
  }
  const api = { TOPICS, ContactError, isConfigured, normalizeAndValidate, sendMessage, mount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FTaxContact = api;
  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', () => mount(root.document));
    else mount(root.document);
  }
})(globalThis);

