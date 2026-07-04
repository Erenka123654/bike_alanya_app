const API_BASE = window.API_BASE || 'http://localhost:4000/api';
const TOKEN_KEY = 'bikealanya_admin_token';

let token = localStorage.getItem(TOKEN_KEY) || null;
let products = [];
let orders = [];

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

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
function formatTL(n) { return Math.round(n).toLocaleString('tr-TR') + ' TL'; }

/* ============ API WRAPPER ============ */
async function api(path, options = {}) {
  const headers = options.headers || {};
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    logout();
    throw new Error('Oturumunuz sona erdi, lütfen tekrar giriş yapın.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu');
  return data;
}

/* ============ AUTH ============ */
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginSubmit = document.getElementById('loginSubmit');

function showDashboard() {
  loginScreen.style.display = 'none';
  dashboard.style.display = 'grid';
  loadProducts();
  loadOrders();
}
function showLogin() {
  loginScreen.style.display = 'flex';
  dashboard.style.display = 'none';
}
function logout() {
  token = null;
  localStorage.removeItem(TOKEN_KEY);
  showLogin();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginSubmit.disabled = true;
  loginSubmit.textContent = 'Giriş yapılıyor...';

  const fd = new FormData(loginForm);
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Giriş başarısız');

    token = data.token;
    localStorage.setItem(TOKEN_KEY, token);
    showDashboard();
  } catch (err) {
    loginError.textContent = err.message;
  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = 'Giriş Yap';
  }
});

document.getElementById('logoutBtn').addEventListener('click', logout);

/* ============ TABS ============ */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
    document.getElementById(`tab-${btn.dataset.tab}`).style.display = '';
  });
});

/* ============ PRODUCTS ============ */
const productsTableBody = document.getElementById('productsTableBody');
const productCountText = document.getElementById('productCountText');

const CATEGORY_LABELS = {
  yol: 'Yol', dag: 'Dağ', 'e-bike': 'Elektrikli', sehir: 'Şehir', katlanir: 'Katlanır',
  cocuk: 'Çocuk', aksesuar: 'Aksesuar', giyim: 'Giyim', 'yedek-parca': 'Yedek Parça',
  lastik: 'Lastik', bakim: 'Bakım', diger: 'Diğer'
};
const BADGE_LABELS = { sale: ['İndirim', 'chip-sale'], new: ['Yeni', 'chip-new'], ship: ['Ücretsiz Kargo', 'chip-ship'] };

function productImage(p) {
  if (!p.image) return 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=100&q=60';
  if (p.image.startsWith('/uploads')) return `${API_BASE.replace(/\/api$/, '')}${p.image}`;
  return p.image;
}

async function loadProducts() {
  try {
    products = await api('/products');
    productCountText.textContent = `${products.length} ürün`;
    renderProductsTable();
  } catch (err) {
    productsTableBody.innerHTML = `<tr><td colspan="7" class="table-empty">${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderProductsTable() {
  if (products.length === 0) {
    productsTableBody.innerHTML = '<tr><td colspan="7" class="table-empty">Henüz ürün yok. "Yeni Ürün" ile ekleyin.</td></tr>';
    return;
  }
  productsTableBody.innerHTML = products.map(p => {
    const badge = p.badge && BADGE_LABELS[p.badge]
      ? `<span class="chip ${BADGE_LABELS[p.badge][1]}">${BADGE_LABELS[p.badge][0]}</span>`
      : '<span class="chip chip-none">—</span>';
    const stockClass = p.stock <= 3 ? 'low-stock' : '';
    return `
      <tr data-id="${p.id}">
        <td><div class="prod-thumb"><img src="${productImage(p)}" alt=""></div></td>
        <td><div class="prod-thumb"><div><div class="name">${escapeHtml(p.name)}</div><div class="brand">${escapeHtml(p.brand || '')}</div></div></div></td>
        <td><span class="chip chip-cat">${CATEGORY_LABELS[p.category] || p.category}</span></td>
        <td>${formatTL(p.price)}${p.oldPrice ? `<br><small style="color:var(--text-mute);text-decoration:line-through;">${formatTL(p.oldPrice)}</small>` : ''}</td>
        <td class="${stockClass}">${p.stock ?? 0}</td>
        <td>${badge}</td>
        <td>
          <div class="row-actions">
            <button class="icon-action edit-btn" data-id="${p.id}" aria-label="Düzenle"><i class="fa-solid fa-pen"></i></button>
            <button class="icon-action danger delete-btn" data-id="${p.id}" aria-label="Sil"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');

  productsTableBody.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', () => openProductModal(Number(b.dataset.id))));
  productsTableBody.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', () => deleteProduct(Number(b.dataset.id))));
}

async function deleteProduct(id) {
  const product = products.find(p => p.id === id);
  if (!confirm(`"${product?.name}" ürününü silmek istediğinize emin misiniz?`)) return;
  try {
    await api(`/products/${id}`, { method: 'DELETE' });
    showToast('Ürün silindi');
    loadProducts();
  } catch (err) {
    showToast(err.message, true);
  }
}

/* ---- Product modal (add/edit) ---- */
const productModalOverlay = document.getElementById('productModalOverlay');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const productModalTitle = document.getElementById('productModalTitle');
const productFormError = document.getElementById('productFormError');
const productFormSubmit = document.getElementById('productFormSubmit');
const imagePreview = document.getElementById('imagePreview');

function openProductModal(id = null) {
  productForm.reset();
  productFormError.textContent = '';
  imagePreview.style.display = 'none';

  if (id) {
    const p = products.find(x => x.id === id);
    productModalTitle.textContent = 'Ürünü Düzenle';
    productForm.id.value = p.id;
    productForm.name.value = p.name;
    productForm.brand.value = p.brand || '';
    productForm.category.value = p.category;
    productForm.badge.value = p.badge || '';
    productForm.price.value = p.price;
    productForm.oldPrice.value = p.oldPrice || '';
    productForm.stock.value = p.stock ?? 0;
    productForm.rating.value = p.rating || 0;
    productForm.description.value = p.description || '';
    productForm.imageUrl.value = p.image && !p.image.startsWith('/uploads') ? p.image : '';
    if (p.image) { imagePreview.src = productImage(p); imagePreview.style.display = 'block'; }
  } else {
    productModalTitle.textContent = 'Yeni Ürün';
    productForm.id.value = '';
  }

  productModalOverlay.classList.add('open');
  productModal.classList.add('open');
}
function closeProductModal() {
  productModalOverlay.classList.remove('open');
  productModal.classList.remove('open');
}
document.getElementById('newProductBtn').addEventListener('click', () => openProductModal());
document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
productModalOverlay.addEventListener('click', closeProductModal);

productForm.querySelector('[name="image"]').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  imagePreview.src = URL.createObjectURL(file);
  imagePreview.style.display = 'block';
});

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  productFormError.textContent = '';
  productFormSubmit.disabled = true;
  productFormSubmit.textContent = 'Kaydediliyor...';

  const id = productForm.id.value;
  const fd = new FormData(productForm);
  if (!fd.get('image') || fd.get('image').size === 0) fd.delete('image');

  try {
    if (id) {
      await api(`/products/${id}`, { method: 'PUT', body: fd });
      showToast('Ürün güncellendi');
    } else {
      await api('/products', { method: 'POST', body: fd });
      showToast('Ürün eklendi');
    }
    closeProductModal();
    loadProducts();
  } catch (err) {
    productFormError.textContent = err.message;
  } finally {
    productFormSubmit.disabled = false;
    productFormSubmit.textContent = 'Kaydet';
  }
});

/* ============ ORDERS ============ */
const ordersTableBody = document.getElementById('ordersTableBody');
const orderCountText = document.getElementById('orderCountText');
const STATUS_LABELS = { pending: 'Beklemede', paid: 'Ödendi', failed: 'Başarısız', shipped: 'Kargoda', cancelled: 'İptal' };

async function loadOrders() {
  try {
    orders = await api('/orders');
    orderCountText.textContent = `${orders.length} sipariş`;
    renderOrdersTable();
  } catch (err) {
    ordersTableBody.innerHTML = `<tr><td colspan="7" class="table-empty">${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderOrdersTable() {
  if (orders.length === 0) {
    ordersTableBody.innerHTML = '<tr><td colspan="7" class="table-empty">Henüz sipariş yok.</td></tr>';
    return;
  }
  ordersTableBody.innerHTML = orders.map(o => `
    <tr data-id="${o.id}">
      <td>#${o.id}</td>
      <td>${escapeHtml(o.buyer?.name || '')} ${escapeHtml(o.buyer?.surname || '')}</td>
      <td>${o.items.reduce((s, i) => s + i.qty, 0)}</td>
      <td>${formatTL(o.total)}</td>
      <td><span class="status-chip status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span></td>
      <td>${new Date(o.createdAt).toLocaleString('tr-TR')}</td>
      <td><div class="row-actions"><button class="icon-action view-order-btn" data-id="${o.id}" aria-label="Detay"><i class="fa-solid fa-eye"></i></button></div></td>
    </tr>
  `).join('');

  ordersTableBody.querySelectorAll('.view-order-btn').forEach(b => b.addEventListener('click', () => openOrderModal(Number(b.dataset.id))));
}

document.getElementById('refreshOrdersBtn').addEventListener('click', loadOrders);

/* ---- Order detail modal ---- */
const orderModalOverlay = document.getElementById('orderModalOverlay');
const orderModal = document.getElementById('orderModal');
const orderDetailContent = document.getElementById('orderDetailContent');

function openOrderModal(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;

  orderDetailContent.innerHTML = `
    <div class="order-detail-buyer">
      <div><strong>${escapeHtml(o.buyer.name)} ${escapeHtml(o.buyer.surname)}</strong></div>
      <div>${escapeHtml(o.buyer.email)} · ${escapeHtml(o.buyer.phone)}</div>
      <div>${escapeHtml(o.buyer.address)}, ${escapeHtml(o.buyer.city)} ${escapeHtml(o.buyer.zipCode || '')}</div>
    </div>
    <div class="order-detail-items">
      ${o.items.map(i => `<div><span>${escapeHtml(i.name)} × ${i.qty}</span><span>${formatTL(i.price * i.qty)}</span></div>`).join('')}
      <div><span>Toplam</span><span>${formatTL(o.total)}</span></div>
    </div>
    <div class="form-field">
      <label>Sipariş Durumu</label>
      <select class="status-select" id="orderStatusSelect">
        ${Object.keys(STATUS_LABELS).map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`).join('')}
      </select>
    </div>
    <button class="btn-primary" id="saveOrderStatusBtn" style="width:100%;justify-content:center;">Durumu Güncelle</button>
  `;

  document.getElementById('saveOrderStatusBtn').addEventListener('click', async () => {
    const newStatus = document.getElementById('orderStatusSelect').value;
    try {
      await api(`/orders/${o.id}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      showToast('Sipariş durumu güncellendi');
      closeOrderModal();
      loadOrders();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  orderModalOverlay.classList.add('open');
  orderModal.classList.add('open');
}
function closeOrderModal() {
  orderModalOverlay.classList.remove('open');
  orderModal.classList.remove('open');
}
document.getElementById('closeOrderModal').addEventListener('click', closeOrderModal);
orderModalOverlay.addEventListener('click', closeOrderModal);

/* ============ INIT ============ */
if (token) {
  api('/auth/me').then(showDashboard).catch(showLogin);
} else {
  showLogin();
}
