# Yatırım Portföyüm

Modern ve kullanıcı dostu bir yatırım takip uygulaması. Yatırımlarınızı takip edin, kar/zarar durumunuzu analiz edin ve portföyünüzün performansını görselleştirin.

## Özellikler

- 📊 **Yatırım Takibi**: Fon, döviz, hisse senedi ve diğer yatırım türlerini takip edin
- 💰 **Kar/Zarar Hesaplama**: Güncel değer girerek otomatik kar/zarar hesaplama
- 📈 **Görselleştirme**: Zaman bazında performans grafikleri ve portföy dağılımı
- 🎨 **Modern UI**: Dark mode desteği ile modern ve responsive tasarım
- 💾 **Yerel Depolama**: Verileriniz tarayıcınızda güvenle saklanır
- 📱 **PWA Desteği**: Mobil cihazlarda uygulama gibi kullanılabilir

## Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn

### Adımlar

1. Projeyi klonlayın veya indirin
```bash
cd myPortfolio
```

2. Bağımlılıkları yükleyin
```bash
npm install
```

3. Geliştirme sunucusunu başlatın
```bash
npm run dev
```

4. Tarayıcınızda açın
```
http://localhost:3000
```

## Kullanım

### Yatırım Ekleme

1. "Yeni Yatırım Ekle" butonuna tıklayın
2. Yatırım bilgilerini doldurun:
   - Tarih
   - Yatırım türü (Fon, Döviz, Hisse Senedi, Diğer)
   - Fon adı
   - Tutar (TRY)
   - Birim fiyat (opsiyonel)
   - Para birimi
   - **Güncel Değer** (kar/zarar hesaplaması için)

### Güncel Değer Girişi

1. Yatırım listesinde yeşil **$** butonuna tıklayın
2. Fon kartı genişleyecek ve güncel değer giriş formu açılacak
3. Mevcut değeri girin ve "Kaydet" butonuna tıklayın
4. Kar/zarar otomatik olarak hesaplanacak ve gösterilecek

### Grafikler ve Analiz

- **Zaman Bazında Performans**: Toplam yatırım ve güncel değer grafiği
- **Portföy Dağılımı**: Yatırım türlerine göre pasta grafiği
- **Fon Bazında Dağılım**: Her fon için detaylı bilgiler
- **Performans Kartları**: Toplam yatırım, güncel değer ve kar/zarar özeti

## Teknolojiler

- **Next.js 14**: React framework
- **TypeScript**: Tip güvenliği
- **Tailwind CSS**: Modern CSS framework
- **Recharts**: Grafik görselleştirme
- **Firebase**: Cloud storage desteği (opsiyonel)
- **PWA**: Progressive Web App desteği

## Proje Yapısı

```
myPortfolio/
├── app/                 # Next.js app router
│   ├── page.tsx        # Ana sayfa
│   └── layout.tsx      # Layout bileşeni
├── components/         # React bileşenleri
│   ├── InvestmentForm.tsx
│   ├── InvestmentList.tsx
│   ├── PerformanceChart.tsx
│   ├── PortfolioChart.tsx
│   └── SummaryCard.tsx
├── lib/                # Yardımcı fonksiyonlar
│   ├── storage.ts      # Yerel depolama
│   ├── utils.ts       # Yardımcı fonksiyonlar
│   └── exportImport.ts # Dışa/içe aktarma
└── types/              # TypeScript tipleri
    └── investment.ts
```

## Scripts

- `npm run dev`: Geliştirme sunucusunu başlatır
- `npm run build`: Production build oluşturur
- `npm run start`: Production sunucusunu başlatır
- `npm run lint`: ESLint kontrolü yapar
- `npm test`: Testleri çalıştırır

## Lisans

© 2026 Yatırım Portföyüm • Tüm hakları saklıdır
