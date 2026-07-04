# Bike Alanya — Tam Sistem (Mağaza + Yönetici Paneli + Ödeme)

Bu paket üç parçadan oluşur:

```
bike-alanya-app/
├── server/        Node.js + Express backend (API, veritabanı, iyzico entegrasyonu)
├── admin/         Yönetici paneli (ürün ve sipariş yönetimi)
└── storefront/    Müşteri tarafı mağaza sitesi
```

Mağaza ve yönetici paneli artık backend API'sinden veri okuyor/yazıyor. Ürün eklediğinizde
mağazada anında görünür, sipariş oluştuğunda yönetici panelinde listelenir, ödeme iyzico
üzerinden gerçek olarak alınır.

---

## 1) Backend'i çalıştırma

```bash
cd server
npm install
cp .env.example .env      # sonra .env dosyasını düzenleyin (aşağıya bakın)
npm start                 # http://localhost:4000
```

İlk çalıştırmada:
- `data/db.json` dosyası otomatik oluşturulur (ürünler, siparişler, yönetici kullanıcı — dosya tabanlı, kurulumu kolay bir veritabanıdır).
- `.env` dosyasındaki `ADMIN_USERNAME` / `ADMIN_PASSWORD` ile bir yönetici hesabı oluşturulur. Terminalde şifre bir kez yazdırılır — **hemen değiştirin**.
- 4 tane örnek ürün eklenir, böylece mağaza boş görünmez.

### .env dosyasındaki önemli alanlar

| Değişken | Açıklama |
|---|---|
| `PORT` | API'nin çalışacağı port (varsayılan 4000) |
| `SERVER_URL` | API'nin dışarıdan erişilen adresi (iyzico callback'i buraya döner) |
| `STOREFRONT_URL` / `ADMIN_URL` | CORS için izin verilen adresler |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | İlk yönetici hesabı (sadece ilk çalıştırmada okunur) |
| `JWT_SECRET` | Oturum imzalama anahtarı — production'da mutlaka uzun/rastgele bir değerle değiştirin |
| `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` | iyzico API bilgileriniz (aşağıya bakın) |
| `IYZICO_BASE_URL` | Test: `https://sandbox-api.iyzipay.com`, Canlı: `https://api.iyzipay.com` |

---

## 2) Mağaza ve yönetici panelini çalıştırma

Bunlar statik dosyalardır ama tarayıcı güvenliği (CORS/fetch) nedeniyle `file://` ile değil,
küçük bir HTTP sunucusuyla açılmalıdır. En kolay yöntem:

```bash
# Mağaza (yeni bir terminalde)
cd storefront
npx serve -l 5500
# -> http://localhost:5500


# APİ ÇALIŞTIRMA
c:\Users\w11\Desktop\projeler\bike-alanya-app\bike-alanya-app\server>npm run dev
npm run dev

# Yönetici paneli (başka bir terminalde)
cd admin
npx serve -l 5501
# -> http://localhost:5501
```

Yönetici paneline girişte `.env` dosyasındaki `ADMIN_USERNAME` / `ADMIN_PASSWORD` kullanılır.

> Her iki HTML dosyasının `<head>` kısmında `window.API_BASE = 'http://localhost:4000/api'`
> satırı vardır. Backend'i başka bir adrese (kendi sunucunuz/domain) taşıdığınızda bu satırı
> `storefront/index.html`, `storefront/order-result.html` ve `admin/index.html` içinde güncelleyin.

---

## 3) iyzico ödeme entegrasyonu — adım adım

iyzico'nun "Ödeme Formu" (Checkout Form) yöntemi kullanıldı: kart bilgileri hiçbir zaman
sizin sunucunuzdan geçmez, doğrudan iyzico'nun güvenli formunda girilir (PCI-DSS uyumluluğu
iyzico tarafında sağlanır).

### a) Test (sandbox) hesabı açın
1. https://sandbox-merchant.iyzipay.com/auth/register adresinden ücretsiz bir sandbox hesabı açın.
2. Giriş yapın → **Ayarlar > Firma Ayarları** → **API Anahtarları** bölümünden API Key ve Secret Key'i kopyalayın.
3. Bu değerleri `server/.env` içine yazın:
   ```
   IYZICO_API_KEY=sandbox-xxxxxxxxxxxxxxxx
   IYZICO_SECRET_KEY=sandbox-xxxxxxxxxxxxxxxx
   IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
   ```
4. Sunucuyu yeniden başlatın (`npm start`).

### b) Test ödemesi yapın
Sandbox ortamında gerçek kart bilgisi gerekmez — iyzico'nun test kartlarını kullanabilirsiniz
(iyzico geliştirici portalında "Test Kartları" bölümünde listelidir, örn. 5528790000000008).
Sandbox'ta SMS/OTP kodu her zaman `123456`'dır.

### c) Canlıya geçiş
1. iyzico'da gerçek bir üye işyeri hesabı için başvurun (şirket evrakları istenir).
2. Onaylandıktan sonra **Ayarlar > Firma Ayarları**'ndan canlı API Key/Secret'ı alın.
3. `.env` dosyasında:
   ```
   IYZICO_API_KEY=<canlı-api-key>
   IYZICO_SECRET_KEY=<canlı-secret-key>
   IYZICO_BASE_URL=https://api.iyzipay.com
   ```
4. `SERVER_URL` ve `STOREFRONT_URL`'i artık gerçek alan adlarınıza güncelleyin (`https://api.bikealanya.com`, `https://bikealanya.com` gibi) — iyzico callback'i bu adrese POST edecek.

**Not:** PayTR de benzer bir "iFrame API" sunar; iyzico yerine PayTR kullanmak isterseniz
sadece `server/src/routes/orders.js` içindeki iyzico çağrılarını PayTR'nin kütüphanesiyle
değiştirmeniz yeterli — geri kalan mimari (sipariş oluşturma, stok düşürme, admin paneli) aynı kalır.

---

## 4) Nasıl çalışıyor? (Mimari özet)

- **Ürün yönetimi:** Yönetici panelinden eklenen/düzenlenen/silinen her ürün `data/db.json`'a
  yazılır ve mağaza `/api/products` üzerinden bunu anında okur. Görsel yüklerseniz `server/uploads/`
  klasörüne kaydedilir ve `/uploads/...` yolundan servis edilir.
- **Fiyat güvenliği:** Sepetteki ürün fiyatları asla tarayıcıdan güvenilerek alınmaz — ödeme
  başlatılırken sunucu, her ürünün güncel fiyatını veritabanından tekrar okuyup toplamı kendisi hesaplar.
- **Stok:** Stok, ödeme **onaylandıktan sonra** (iyzico callback'inde `paymentStatus === 'SUCCESS'`
  geldiğinde) düşürülür — ödeme formunu açan ama tamamlamayan ziyaretçiler stok tüketmez.
- **Yetkilendirme:** Yönetici paneli JWT tabanlı oturum kullanır (12 saat geçerli). Ürün/sipariş
  değiştiren tüm API uçları `Authorization: Bearer <token>` başlığı olmadan 401 döner.
- **Sipariş akışı:** Sepet → "Siparişi Tamamla" → teslimat formu → `/api/orders/checkout` (sunucu
  siparişi `pending` olarak kaydeder ve iyzico'dan ödeme formu ister) → iyzico'nun gömülü formu
  açılır → ödeme sonucu `server/src/routes/orders.js` içindeki `/api/orders/callback` uç noktasına
  POST edilir → sipariş `paid`/`failed` olarak güncellenir → alıcı `order-result.html` sayfasına yönlendirilir.

---

## 5) Canlıya alma (deployment) kontrol listesi

- [ ] Backend'i bir Node.js barındırma servisine (Railway, Render, VPS + PM2, vb.) deploy edin.
- [ ] `JWT_SECRET`'ı uzun/rastgele bir değerle değiştirin.
- [ ] `ADMIN_PASSWORD`'ü güçlü bir şifreyle değiştirip sunucuyu yeniden başlatın (veya `data/db.json`
      içindeki admin kaydını silip yeniden oluşturun).
- [ ] `SERVER_URL`, `STOREFRONT_URL`, `ADMIN_URL` değerlerini gerçek alan adlarınızla güncelleyin.
- [ ] iyzico canlı API bilgilerinizi girin (bkz. yukarıdaki "Canlıya geçiş").
- [ ] `storefront/index.html`, `storefront/order-result.html`, `admin/index.html` içindeki
      `window.API_BASE` satırlarını backend'in canlı adresiyle güncelleyin.
- [ ] HTTPS kullanın — iyzico callback'i ve ödeme formu HTTPS olmayan adreslerde güvenilir çalışmaz.
- [ ] `data/` klasörünü düzenli olarak yedekleyin (tüm ürün/sipariş verisi burada tutulur).
- [ ] WhatsApp numarasını ve iletişim bilgilerini `storefront/index.html` içinde güncelleyin.

---

## Sorun giderme

- **"Ürünler yüklenemedi" hatası mağazada:** Backend çalışmıyor veya `API_BASE` yanlış adresi
  gösteriyor olabilir. `curl http://localhost:4000/api/health` ile backend'in ayakta olduğunu doğrulayın.
- **"Ödeme formu başlatılamadı" hatası:** `.env` içindeki `IYZICO_API_KEY`/`IYZICO_SECRET_KEY`
  hâlâ örnek (placeholder) değerlerde olabilir, ya da sandbox/canlı URL uyuşmuyor olabilir.
- **CORS hatası tarayıcı konsolunda:** `server/.env` içindeki `STOREFRONT_URL`/`ADMIN_URL`,
  sitelerinizi açtığınız gerçek adresle (port dahil) birebir eşleşmiyordur.
