/* Bike Alanya — genel site davranışları (slayt, menü, bildirim).
   Tamir/kiralama/randevu mantığı services.js içindedir.
   Mağaza (ürün/sepet/ödeme) kodu için: git tag "magaza-ile" */
document.addEventListener('DOMContentLoaded', () => {

  /* ============ HERO SLIDER ============ */
  const slides = document.querySelectorAll('.slide');
  const dotsWrap = document.getElementById('sliderDots');
  let current = 0;
  let sliderTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slayt ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('.dot');

  function goToSlide(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    resetTimer();
  }
  function nextSlide() { goToSlide(current + 1); }
  function prevSlide() { goToSlide(current - 1); }
  function resetTimer() { clearInterval(sliderTimer); sliderTimer = setInterval(nextSlide, 5500); }

  document.getElementById('nextSlide').addEventListener('click', nextSlide);
  document.getElementById('prevSlide').addEventListener('click', prevSlide);
  resetTimer();

  /* ============ MOBİL MENÜ ============ */
  const hamburger = document.getElementById('hamburgerBtn');
  const megaNav = document.getElementById('megaNav');
  hamburger.addEventListener('click', () => {
    megaNav.classList.toggle('mobile-open');
    hamburger.classList.toggle('active');
  });
  // Bir menü bağlantısına tıklanınca menüyü kapat
  megaNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      megaNav.classList.remove('mobile-open');
      hamburger.classList.remove('active');
    });
  });

  /* ============ BİLDİRİM (TOAST) ============ */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg, isError = false) {
    clearTimeout(toastTimer);
    toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${msg}`;
    toast.style.background = isError ? '#c62432' : '';
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }
  window.showToast = showToast; // services.js de kullanır

  /* ============ YUKARI ÇIK ============ */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
