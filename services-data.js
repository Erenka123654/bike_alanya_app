/* ===========================================================================
   Bike Alanya — Tamir, Kiralama ve İletişim Ayarları

   ⚠️  DİKKAT: Buradaki FİYATLAR, PAKET İÇERİKLERİ ve ŞARTLAR ÖRNEKTİR.
       Siteyi yayına almadan önce kendi gerçek bilgilerinle değiştir.

   Sadece bu dosyayı düzenlemen yeterli — HTML'e dokunmana gerek yok.
   Fiyatlar TL cinsindendir (sadece rakam yaz, "TL" yazma).
   =========================================================================== */
window.BIKE_CONFIG = {

  /* --- İletişim --------------------------------------------------------- */
  // WhatsApp numarası: ülke koduyla, + ve boşluk olmadan (905xxxxxxxxx)
  whatsappNumber: '905357391260',
  // Telefon (arama butonu için)
  phoneTel: '+905357391260',
  phoneDisplay: '0535 739 12 60',

  /* --- Tamir & Servis hizmetleri ---------------------------------------- */
  // icon: Font Awesome 6 (ücretsiz) ikon adı
  // priceFrom: "başlayan" fiyat
  services: [
    { id: 'lastik', icon: 'fa-circle-dot', title: 'Lastik & İç Lastik',
      desc: 'Patlak yama, iç ve dış lastik değişimi, hava ayarı.', priceFrom: 150 },
    { id: 'fren', icon: 'fa-circle-stop', title: 'Fren Ayarı & Balata',
      desc: 'Disk ve V-fren ayarı, balata değişimi, hidrolik fren hava alma.', priceFrom: 250 },
    { id: 'vites', icon: 'fa-gears', title: 'Vites Ayarı',
      desc: 'Ön ve arka attırıcı ayarı, kablo ve zarf değişimi.', priceFrom: 300 },
    { id: 'jant', icon: 'fa-life-ring', title: 'Jant Tamiri & Ayarı',
      desc: 'Kaçık jant düzeltme, kapak ve bilya bakımı.', priceFrom: 350 },
    { id: 'zincir', icon: 'fa-link', title: 'Zincir & Dişli',
      desc: 'Zincir, kaset ve dişli değişimi, temizlik ve yağlama.', priceFrom: 400 },
    { id: 'montaj', icon: 'fa-screwdriver-wrench', title: 'Montaj & Kurulum',
      desc: 'Sele, gidon, pedal, çamurluk ve bagaj taşıyıcı montajı.', priceFrom: 150 },
    { id: 'ebike', icon: 'fa-bolt', title: 'Elektrikli Bisiklet Servisi',
      desc: 'Motor, batarya ve kontrol ünitesi kontrolü, arıza tespiti.', priceFrom: 600 },
    { id: 'teshis', icon: 'fa-clipboard-check', title: 'Genel Kontrol & Arıza Tespiti',
      desc: 'Sorunu bulamadınız mı? Bisikletinizi kontrol edip durumunu anlatıyoruz.', priceFrom: 100 }
  ],

  /* --- Bakım paketleri -------------------------------------------------- */
  // featured: true  -> "öne çıkan" kart (koyu renk + etiket)
  packages: [
    { id: 'temel', title: 'Temel Bakım', price: 600, sub: 'Düzenli kullanım için hızlı kontrol',
      features: [
        'Genel kontrol ve temizlik',
        'Zincir yağlama',
        'Lastik havası ve kontrolü',
        'Vida ve cıvata sıkma kontrolü'
      ] },
    { id: 'standart', title: 'Standart Bakım', price: 1200, sub: 'Sezon başı için ideal', featured: true, tag: 'EN ÇOK TERCİH EDİLEN',
      features: [
        'Temel bakımdaki her şey',
        'Fren ayarı',
        'Vites ayarı',
        'Jant ayarı kontrolü',
        'Zincir ve dişli temizliği'
      ] },
    { id: 'komple', title: 'Komple Bakım', price: 2200, sub: 'Bisikletin sıfıra yakın performansı',
      features: [
        'Standart bakımdaki her şey',
        'Komple söküm ve derin temizlik',
        'Göbek ve orta göbek rulman bakımı',
        'Kablo ve zarf yenileme',
        'Test sürüşü'
      ] }
  ],

  /* --- Kiralık bisikletler ---------------------------------------------- */
  // prices: saatlik / günlük / haftalık
  rentals: [
    { id: 'sehir', icon: 'fa-city', title: 'Şehir Bisikleti',
      desc: 'Sahil yolu ve şehir içi gezileri için rahat, dik oturuşlu bisiklet.',
      prices: { hour: 100, day: 500, week: 2500 } },
    { id: 'dag', icon: 'fa-mountain', title: 'Dağ Bisikleti',
      desc: 'Toprak yollar ve parkurlar için dayanıklı model.',
      prices: { hour: 150, day: 750, week: 3750 } },
    { id: 'yol', icon: 'fa-bicycle', title: 'Yol Bisikleti',
      desc: 'Asfaltta hız ve verim arayanlar için hafif yol bisikleti.',
      prices: { hour: 200, day: 1000, week: 5000 } },
    { id: 'ebike', icon: 'fa-bolt', title: 'Elektrikli Bisiklet',
      desc: 'Yokuşları kolaylaştıran pedal destekli elektrikli model.',
      prices: { hour: 300, day: 1500, week: 7500 } },
    { id: 'cocuk', icon: 'fa-child', title: 'Çocuk Bisikleti',
      desc: 'Farklı boy seçenekleri; uygun ölçü için mağazamıza danışın.',
      prices: { hour: 75, day: 350, week: 1750 } }
  ],

  /* --- Kiralama şartları (liste halinde görünür) ------------------------ */
  rentalTerms: [
    'Kimlik belgesi (T.C. kimlik kartı veya pasaport) gereklidir.',
    'Depozito ve teslim koşulları için mağazamızla iletişime geçin.',
    'Bisiklet, zamanında ve hasarsız şekilde iade edilmelidir.',
    'Rezervasyon talebiniz mağaza onayından sonra kesinleşir.'
  ]
};
