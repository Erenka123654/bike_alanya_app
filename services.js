/* ===========================================================================
   Bike Alanya — Tamir & Kiralama bölümleri
   Veriler services-data.js içindeki window.BIKE_CONFIG'ten okunur.
   =========================================================================== */
(function () {
  'use strict';

  const C = window.BIKE_CONFIG;
  if (!C) { console.warn('BIKE_CONFIG bulunamadı (services-data.js yüklendi mi?)'); return; }

  const PERIODS = [
    { key: 'hour', label: 'Saatlik', unit: 'saat' },
    { key: 'day', label: 'Günlük', unit: 'gün' },
    { key: 'week', label: 'Haftalık', unit: 'hafta' }
  ];
  const BIKE_TYPES = ['Dağ bisikleti', 'Yol bisikleti', 'Şehir / Trekking', 'Elektrikli bisiklet', 'Çocuk bisikleti', 'Katlanır bisiklet', 'Diğer'];

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Math.round(n).toLocaleString('tr-TR') + ' TL';
  const toast = (msg, isError) => { if (typeof window.showToast === 'function') window.showToast(msg, isError); };

  document.addEventListener('DOMContentLoaded', () => {

    /* ============ RENDER: HİZMETLER ============ */
    const serviceGrid = $('serviceGrid');
    if (serviceGrid) {
      serviceGrid.innerHTML = C.services.map((s) => `
        <article class="service-card">
          <div class="sc-icon"><i class="fa-solid ${esc(s.icon)}"></i></div>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.desc)}</p>
          <div class="sc-foot">
            <span class="sc-price"><small>başlayan</small>${fmt(s.priceFrom)}</span>
            <button type="button" class="sc-link" data-booking="servis" data-preset="${esc(s.id)}">Randevu <i class="fa-solid fa-arrow-right"></i></button>
          </div>
        </article>`).join('');
    }

    /* ============ RENDER: PAKETLER ============ */
    const packageGrid = $('packageGrid');
    if (packageGrid) {
      packageGrid.innerHTML = C.packages.map((p) => `
        <article class="package-card${p.featured ? ' featured' : ''}">
          ${p.tag ? `<span class="package-tag">${esc(p.tag)}</span>` : ''}
          <h4>${esc(p.title)}</h4>
          <span class="pk-sub">${esc(p.sub || '')}</span>
          <div class="package-price">${fmt(p.price)}</div>
          <ul>${p.features.map((f) => `<li><i class="fa-solid fa-check"></i><span>${esc(f)}</span></li>`).join('')}</ul>
          <button type="button" class="btn-primary" data-booking="servis" data-preset="${esc(p.id)}">Bu Paket İçin Randevu Al</button>
        </article>`).join('');
    }

    /* ============ RENDER: KİRALIK BİSİKLETLER ============ */
    const rentalGrid = $('rentalGrid');
    if (rentalGrid) {
      rentalGrid.innerHTML = C.rentals.map((r) => `
        <article class="rental-card">
          <div class="rc-top">
            <div class="rc-icon"><i class="fa-solid ${esc(r.icon)}"></i></div>
            <h3>${esc(r.title)}</h3>
          </div>
          <p>${esc(r.desc)}</p>
          <div class="rc-prices">
            ${PERIODS.map((per) => `<div class="rc-price"><span>${per.label}</span><b>${fmt(r.prices[per.key])}</b></div>`).join('')}
          </div>
          <button type="button" class="btn-primary" data-booking="kiralama" data-preset="${esc(r.id)}">Rezervasyon Yap</button>
        </article>`).join('');
    }

    const rentalTerms = $('rentalTerms');
    if (rentalTerms) {
      rentalTerms.innerHTML = C.rentalTerms.map((t) => `<li><i class="fa-solid fa-circle-check"></i><span>${esc(t)}</span></li>`).join('');
    }

    /* ============ FORM SEÇENEKLERİ ============ */
    const bikeOptions = BIKE_TYPES.map((b) => `<option value="${esc(b)}">${esc(b)}</option>`).join('');
    if ($('svcBike')) $('svcBike').innerHTML = bikeOptions;

    if ($('serviceType')) {
      $('serviceType').innerHTML = `
        <option value="kontrol">Emin değilim, kontrol edilsin</option>
        <optgroup label="Tek tek hizmetler">
          ${C.services.map((s) => `<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('')}
        </optgroup>
        <optgroup label="Bakım paketleri">
          ${C.packages.map((p) => `<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('')}
        </optgroup>`;
    }

    if ($('rentalBike')) {
      $('rentalBike').innerHTML = C.rentals.map((r) => `<option value="${esc(r.id)}">${esc(r.title)}</option>`).join('');
    }
    if ($('rentalPeriod')) {
      $('rentalPeriod').innerHTML = PERIODS.map((p) => `<option value="${p.key}">${p.label}</option>`).join('');
      $('rentalPeriod').value = 'day';
    }

    /* ============ İLETİŞİM BUTONLARI ============ */
    const callLink = $('callLink');
    if (callLink) {
      callLink.href = 'tel:' + C.phoneTel;
      callLink.innerHTML = `<i class="fa-solid fa-phone"></i> ${esc(C.phoneDisplay)}`;
    }
    const waLink = $('waLink');
    if (waLink) {
      waLink.href = `https://api.whatsapp.com/send?phone=${C.whatsappNumber}&text=${encodeURIComponent('Merhaba, bilgi almak istiyorum.')}`;
    }

    /* ============ TARİH ALANLARI (geçmiş tarih seçilemesin) ============ */
    function todayISO() {
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 10);
    }
    ['svcDate', 'rentalDate'].forEach((id) => { if ($(id)) $(id).min = todayISO(); });

    /* ============ SEKMELER ============ */
    function openBooking(tab, preset, scroll) {
      document.querySelectorAll('.booking-tab').forEach((t) => {
        const on = t.dataset.tab === tab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      document.querySelectorAll('.booking-panel').forEach((p) => p.classList.toggle('active', p.dataset.panel === tab));

      if (preset) {
        const sel = tab === 'kiralama' ? $('rentalBike') : $('serviceType');
        if (sel) sel.value = preset;
      }
      if (tab === 'kiralama') updateEstimate();

      if (scroll !== false && $('randevu')) $('randevu').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    document.querySelectorAll('.booking-tab').forEach((t) => {
      t.addEventListener('click', () => openBooking(t.dataset.tab, null, false));
    });

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-booking]');
      if (!trigger) return;
      e.preventDefault();
      openBooking(trigger.dataset.booking, trigger.dataset.preset);
    });

    /* ============ KİRALAMA: TAHMİNİ TUTAR ============ */
    function clampInt(value, min, max) {
      const n = parseInt(value, 10);
      if (isNaN(n)) return min;
      return Math.min(max, Math.max(min, n));
    }

    function updateEstimate() {
      if (!$('rentalBike')) return;
      const bike = C.rentals.find((r) => r.id === $('rentalBike').value);
      const period = PERIODS.find((p) => p.key === $('rentalPeriod').value) || PERIODS[1];
      const count = clampInt($('rentalCount').value, 1, 60);
      const qty = clampInt($('rentalQty').value, 1, 20);
      const unitPrice = bike ? bike.prices[period.key] : 0;

      $('rentalEstimate').textContent = fmt(unitPrice * count * qty);
      $('rentalCountLabel').textContent = `Süre (${period.unit})`;
    }
    ['rentalBike', 'rentalPeriod', 'rentalCount', 'rentalQty'].forEach((id) => {
      if ($(id)) {
        $(id).addEventListener('input', updateEstimate);
        $(id).addEventListener('change', updateEstimate);
      }
    });
    updateEstimate();

    /* ============ DOĞRULAMA & WHATSAPP ============ */
    function validPhone(s) {
      const digits = String(s).replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 13;
    }
    function trDate(iso) {
      if (!iso) return 'Belirtilmedi';
      const [y, m, d] = iso.split('-');
      return `${d}.${m}.${y}`;
    }
    function serviceLabel(id) {
      if (id === 'kontrol') return 'Emin değilim, kontrol edilsin';
      const s = C.services.find((x) => x.id === id);
      if (s) return s.title;
      const p = C.packages.find((x) => x.id === id);
      return p ? p.title + ' (paket)' : id;
    }
    function sendWhatsApp(lines) {
      const url = `https://api.whatsapp.com/send?phone=${C.whatsappNumber}&text=${encodeURIComponent(lines.join('\n'))}`;
      const w = window.open(url, '_blank');
      if (w) w.opener = null;
      else window.location.href = url; // pop-up engellenirse aynı sekmede aç
    }
    function field(form, name) { return String(new FormData(form).get(name) || '').trim(); }

    /* --- Servis randevusu --- */
    const serviceForm = $('serviceForm');
    if (serviceForm) {
      serviceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const err = $('serviceError');
        err.textContent = '';

        const name = field(serviceForm, 'name');
        const phone = field(serviceForm, 'phone');
        const bike = field(serviceForm, 'bike');
        const model = field(serviceForm, 'model');
        const service = field(serviceForm, 'service');
        const date = field(serviceForm, 'date');
        const note = field(serviceForm, 'note');

        if (name.length < 2) { err.textContent = 'Lütfen adınızı ve soyadınızı yazın.'; return; }
        if (!validPhone(phone)) { err.textContent = 'Lütfen geçerli bir telefon numarası yazın.'; return; }
        if (date && date < todayISO()) { err.textContent = 'Geçmiş bir tarih seçemezsiniz.'; return; }

        sendWhatsApp([
          'Merhaba, servis randevusu almak istiyorum.',
          '',
          `Ad Soyad: ${name}`,
          `Telefon: ${phone}`,
          `Bisiklet: ${bike}${model ? ' — ' + model : ''}`,
          `Hizmet: ${serviceLabel(service)}`,
          `Tercih edilen tarih: ${trDate(date)}`,
          note ? `Not: ${note}` : null
        ].filter((l) => l !== null));

        toast('WhatsApp açılıyor — mesajı göndererek talebinizi tamamlayın');
      });
    }

    /* --- Kiralama rezervasyonu --- */
    const rentalForm = $('rentalForm');
    if (rentalForm) {
      rentalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const err = $('rentalError');
        err.textContent = '';

        const name = field(rentalForm, 'name');
        const phone = field(rentalForm, 'phone');
        const date = field(rentalForm, 'date');
        const note = field(rentalForm, 'note');
        const bike = C.rentals.find((r) => r.id === field(rentalForm, 'bike'));
        const period = PERIODS.find((p) => p.key === field(rentalForm, 'period')) || PERIODS[1];
        const count = clampInt(field(rentalForm, 'count'), 1, 60);
        const qty = clampInt(field(rentalForm, 'qty'), 1, 20);

        if (name.length < 2) { err.textContent = 'Lütfen adınızı ve soyadınızı yazın.'; return; }
        if (!validPhone(phone)) { err.textContent = 'Lütfen geçerli bir telefon numarası yazın.'; return; }
        if (!bike) { err.textContent = 'Lütfen bir bisiklet seçin.'; return; }
        if (!date) { err.textContent = 'Lütfen başlangıç tarihini seçin.'; return; }
        if (date < todayISO()) { err.textContent = 'Geçmiş bir tarih seçemezsiniz.'; return; }

        const total = bike.prices[period.key] * count * qty;

        sendWhatsApp([
          'Merhaba, bisiklet kiralamak istiyorum.',
          '',
          `Ad Soyad: ${name}`,
          `Telefon: ${phone}`,
          `Bisiklet: ${bike.title} × ${qty} adet`,
          `Başlangıç tarihi: ${trDate(date)}`,
          `Süre: ${count} ${period.unit} (${period.label.toLowerCase()} tarife)`,
          `Tahmini tutar: ${fmt(total)}`,
          note ? `Not: ${note}` : null
        ].filter((l) => l !== null));

        toast('WhatsApp açılıyor — mesajı göndererek rezervasyon talebinizi tamamlayın');
      });
    }

    /* ============ SAYFA AÇILIRKEN #HASH ============ */
    if (location.hash === '#randevu') openBooking('servis', null, false);
    else if (location.hash === '#rezervasyon') openBooking('kiralama', null, false);
  });
})();
