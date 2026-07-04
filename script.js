const API_BASE = window.API_BASE || 'http://localhost:4000/api';

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

  /* ============ MEGA MENU ============ */
  const megaItems = document.querySelectorAll('.has-mega');
  megaItems.forEach(item => {
    item.addEventListener('mouseenter', () => item.classList.add('open'));
    item.addEventListener('mouseleave', () => item.classList.remove('open'));
    const link = item.querySelector('a');
    link.addEventListener('click', (e) => {
      if (window.matchMedia('(max-width: 980px)').matches) {
        e.preventDefault();
        item.classList.toggle('open');
      }
    });
  });

  /* ============ MOBILE MENU ============ */
  const hamburger = document.getElementById('hamburgerBtn');
  const megaNav = document.getElementById('megaNav');
  hamburger.addEventListener('click', () => {
    megaNav.style.display = megaNav.style.display === 'block' ? 'none' : 'block';
    hamburger.classList.toggle('active');
  });

  /* ============ HELPERS ============ */
  function formatTL(n) {
    return Math.round(n).toLocaleString('tr-TR') + ' TL';
  }

  function badgeMarkup(badge) {
    if (badge === 'sale') return '<span class="badge badge-sale">İndirim</span>';
    if (badge === 'new') return '<span class="badge badge-new">Yeni</span>';
    if (badge === 'ship') return '<span class="badge badge-ship">Ücretsiz Kargo</span>';
    return '';
  }

  function starsMarkup(rating = 0) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<i class="fa-${i <= Math.round(rating) ? 'solid' : 'regular'} fa-star"></i>`;
    }
    return html;
  }

  function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
  }

  function productCardHTML(p) {
    const priceRow = p.oldPrice
      ? `<span class="old-price">${formatTL(p.oldPrice)}</span><span class="price">${formatTL(p.price)}</span>`
      : `<span class="price">${formatTL(p.price)}</span>`;
    const img = p.image && p.image.startsWith('/uploads')
      ? `${API_BASE.replace(/\/api$/, '')}${p.image}`
      : (p.image || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=70');

    return `
    <article class="product-card" data-cat="${p.category}" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-price="${p.price}">
      <div class="pc-media">
        ${badgeMarkup(p.badge)}
        <button class="fav-btn" aria-label="Favorilere ekle"><i class="fa-regular fa-heart"></i></button>
        <img src="${img}" alt="${escapeHtml(p.name)}" loading="lazy">
        <button class="quick-add">Sepete Ekle</button>
      </div>
      <div class="pc-info">
        <span class="pc-brand">${escapeHtml((p.brand || '').toUpperCase())}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="rating">${starsMarkup(p.rating)}<span>(${p.reviewCount || 0})</span></div>
        <div class="price-row">${priceRow}</div>
      </div>
    </article>`;
  }

  function attachCardHandlers(container) {
    container.querySelectorAll('.quick-add').forEach(btn => {
      btn.addEventListener('click', (e) => addToCart(e.target.closest('.product-card')));
    });
    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.classList.toggle('active');
        const icon = btn.querySelector('i');
        icon.classList.toggle('fa-regular');
        icon.classList.toggle('fa-solid');
      });
    });
  }

  /* ============ FETCH & RENDER PRODUCTS ============ */
  const productGrid = document.getElementById('productGrid');
  const dealsGrid = document.getElementById('dealsGrid');
  let allProducts = [];

  async function loadProducts() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error('İstek başarısız');
      allProducts = await res.json();

      if (allProducts.length === 0) {
        productGrid.innerHTML = '<div class="grid-empty">Henüz ürün eklenmedi.</div>';
        dealsGrid.innerHTML = '<div class="grid-empty">Şu anda kampanyalı ürün yok.</div>';
        return;
      }

      renderProductGrid('tumu');

      const deals = allProducts.filter(p => p.badge === 'sale' || p.oldPrice);
      dealsGrid.innerHTML = (deals.length ? deals : allProducts).slice(0, 4).map(productCardHTML).join('');
      attachCardHandlers(dealsGrid);
    } catch (err) {
      console.error(err);
      productGrid.innerHTML = `<div class="grid-error"><i class="fa-solid fa-triangle-exclamation"></i> Ürünler yüklenemedi. API sunucusunun (${API_BASE}) çalıştığından emin olun.</div>`;
      dealsGrid.innerHTML = '';
    }
  }

  function renderProductGrid(category) {
    const list = category === 'tumu' ? allProducts : allProducts.filter(p => p.category === category);
    productGrid.innerHTML = list.length
      ? list.map(productCardHTML).join('')
      : '<div class="grid-empty">Bu kategoride ürün bulunamadı.</div>';
    attachCardHandlers(productGrid);
  }

  loadProducts();

  /* ============ CATEGORY FILTERING ============ */
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProductGrid(tab.dataset.cat);
    });
  });

  document.querySelectorAll('[data-cat]').forEach(el => {
    if (el.classList.contains('filter-tab') || el.classList.contains('product-card')) return;
    el.addEventListener('click', (e) => {
      const cat = el.dataset.cat;
      const matchingTab = document.querySelector(`.filter-tab[data-cat="${cat}"]`);
      if (matchingTab) {
        e.preventDefault();
        filterTabs.forEach(t => t.classList.remove('active'));
        matchingTab.classList.add('active');
        renderProductGrid(cat);
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        megaItems.forEach(i => i.classList.remove('open'));
      }
    });
  });

  /* ============ CART ============ */
  const cart = []; // {productId, name, price, img, qty}
  const cartBtn = document.getElementById('cartBtn');
  const cartPanel = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCart');
  const cartItemsWrap = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');

  function openCart() { cartPanel.classList.add('open'); cartOverlay.classList.add('open'); }
  function closeCart() { cartPanel.classList.remove('open'); cartOverlay.classList.remove('open'); }
  cartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function renderCart() {
    cartItemsWrap.innerHTML = '';
    if (cart.length === 0) {
      cartItemsWrap.appendChild(cartEmpty);
      cartEmpty.style.display = 'block';
    } else {
      cartEmpty.style.display = 'none';
      cart.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <img src="${item.img}" alt="${escapeHtml(item.name)}">
          <div class="ci-info">
            <h4>${escapeHtml(item.name)}</h4>
            <div class="ci-price">${formatTL(item.price * item.qty)}</div>
            <div class="ci-qty">
              <button class="qty-minus" aria-label="Azalt">−</button>
              <span>${item.qty}</span>
              <button class="qty-plus" aria-label="Artır">+</button>
            </div>
          </div>
          <button class="ci-remove" aria-label="Kaldır"><i class="fa-solid fa-trash"></i></button>
        `;
        row.querySelector('.qty-minus').addEventListener('click', () => {
          item.qty--;
          if (item.qty <= 0) cart.splice(idx, 1);
          renderCart();
        });
        row.querySelector('.qty-plus').addEventListener('click', () => {
          item.qty++;
          renderCart();
        });
        row.querySelector('.ci-remove').addEventListener('click', () => {
          cart.splice(idx, 1);
          renderCart();
        });
        cartItemsWrap.appendChild(row);
      });
    }
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.qty * i.price, 0);
    cartCountEl.textContent = totalQty;
    cartTotalEl.textContent = formatTL(totalPrice);
  }

  function addToCart(card) {
    const productId = Number(card.dataset.id);
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const img = card.querySelector('img').src;
    const existing = cart.find(i => i.productId === productId);
    if (existing) existing.qty++;
    else cart.push({ productId, name, price, img, qty: 1 });
    renderCart();
    showToast(`${name} sepete eklendi`);
  }

  renderCart();

  /* ============ TOAST ============ */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg, isError = false) {
    clearTimeout(toastTimer);
    toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${msg}`;
    toast.style.background = isError ? '#c62432' : '';
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /* ============ NEWSLETTER ============ */
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Bültene başarıyla abone oldunuz!');
    newsletterForm.reset();
  });

  document.getElementById('accountBtn').addEventListener('click', () => {
    showToast('Giriş / Üyelik sayfası yakında aktif olacak');
  });

  /* ============ BACK TO TOP ============ */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) backToTop.classList.add('show');
    else backToTop.classList.remove('show');
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-mega')) {
      megaItems.forEach(i => i.classList.remove('open'));
    }
  });

  /* ============ CHECKOUT (iyzico) ============ */
  const openCheckoutBtn = document.getElementById('openCheckoutBtn');
  const checkoutOverlay = document.getElementById('checkoutOverlay');
  const checkoutModal = document.getElementById('checkoutModal');
  const closeCheckoutBtn = document.getElementById('closeCheckout');
  const checkoutFormStep = document.getElementById('checkoutFormStep');
  const checkoutPaymentStep = document.getElementById('checkoutPaymentStep');
  const buyerForm = document.getElementById('buyerForm');
  const checkoutError = document.getElementById('checkoutError');
  const submitBuyerForm = document.getElementById('submitBuyerForm');

  function openCheckout() {
    if (cart.length === 0) {
      showToast('Sepetiniz boş', true);
      return;
    }
    closeCart();
    checkoutFormStep.style.display = '';
    checkoutPaymentStep.style.display = 'none';
    checkoutError.textContent = '';
    checkoutOverlay.classList.add('open');
    checkoutModal.classList.add('open');
  }
  function closeCheckout() {
    checkoutOverlay.classList.remove('open');
    checkoutModal.classList.remove('open');
  }
  openCheckoutBtn.addEventListener('click', openCheckout);
  closeCheckoutBtn.addEventListener('click', closeCheckout);
  checkoutOverlay.addEventListener('click', closeCheckout);

  buyerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    checkoutError.textContent = '';

    const fd = new FormData(buyerForm);
    const buyer = Object.fromEntries(fd.entries());

    submitBuyerForm.disabled = true;
    submitBuyerForm.querySelector('.btn-label').style.display = 'none';
    submitBuyerForm.querySelector('.btn-spinner').style.display = 'inline-block';

    try {
      const res = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.productId, qty: i.qty })),
          buyer
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ödeme başlatılamadı.');
      }

      sessionStorage.setItem('lastOrderId', data.orderId);

      checkoutFormStep.style.display = 'none';
      checkoutPaymentStep.style.display = '';
      const container = document.getElementById('iyzipay-checkout-form');
      container.innerHTML = '';

      // The API returns a <script> tag as text; it must be re-created to execute.
      const temp = document.createElement('div');
      temp.innerHTML = data.checkoutFormContent;
      temp.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
      });
      Array.from(temp.children).forEach(child => {
        if (child.tagName !== 'SCRIPT') container.appendChild(child);
      });

    } catch (err) {
      checkoutError.textContent = err.message;
    } finally {
      submitBuyerForm.disabled = false;
      submitBuyerForm.querySelector('.btn-label').style.display = '';
      submitBuyerForm.querySelector('.btn-spinner').style.display = 'none';
    }
  });
});
