# Yatırım Portföyüm

Modern, performanslı ve kullanıcı dostu bir yatırım takip uygulaması. Yatırımlarınızı takip edin, kar/zarar durumunuzu analiz edin ve portföyünüzün performansını görselleştirin.

## ✨ Özellikler

### Temel Özellikler
- 📊 **Yatırım Takibi**: Fon, döviz, hisse senedi ve diğer yatırım türlerini takip edin
- 💰 **Kar/Zarar Hesaplama**: Güncel değer girerek otomatik kar/zarar hesaplama
- 📈 **Görselleştirme**: Zaman bazında performans grafikleri ve portföy dağılımı
- 🎨 **Modern UI**: Dark mode desteği ile modern ve responsive tasarım
- 💾 **Yerel Depolama**: Verileriniz tarayıcınızda güvenle saklanır
- 📱 **PWA Desteği**: Mobil cihazlarda uygulama gibi kullanılabilir

### Gelişmiş Özellikler
- 🔍 **Arama ve Filtreleme**: Yatırımları fon adı, notlar, tip ve para birimine göre filtreleyin
- ✅ **Form Validasyonu**: Zod schema ile güçlü form validasyonu ve hata mesajları
- ⚡ **Loading States**: Tüm async işlemler için loading spinner'lar ve skeleton loader'lar
- 🚀 **Performance Optimizasyonları**: Code splitting, debounce, memoization ile optimize edilmiş performans
- ♿ **Accessibility**: ARIA attributes ve keyboard navigation desteği
- 🔄 **Real-time Sync**: Firebase ile çoklu cihaz senkronizasyonu (opsiyonel)

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Kurulum

1. Projeyi klonlayın
```bash
git clone https://github.com/odardes/myPortfolio.git
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

## 📖 Kullanım

### Yatırım Ekleme

1. "Yeni Yatırım Ekle" butonuna tıklayın
2. Yatırım bilgilerini doldurun:
   - **Tarih**: Yatırım tarihi (bugünden ileri olamaz)
   - **Yatırım Türü**: Fon, Döviz, Hisse Senedi, Diğer
   - **Fon Adı**: En az 2 karakter (zorunlu)
   - **Tutar**: 0.01'den büyük sayı (zorunlu)
   - **Birim Fiyat**: Opsiyonel
   - **Para Birimi**: TRY, USD, EUR
   - **Güncel Değer**: Kar/zarar hesaplaması için (opsiyonel)
   - **Notlar**: Ek bilgiler (opsiyonel, max 500 karakter)

### Güncel Değer Girişi

1. Yatırım listesinde yeşil **$** butonuna tıklayın
2. Fon kartı genişleyecek ve güncel değer giriş formu açılacak
3. Mevcut değeri girin ve "Kaydet" butonuna tıklayın
4. Kar/zarar otomatik olarak hesaplanacak ve gösterilecek

### Arama ve Filtreleme

- **Arama**: Üst kısımdaki arama kutusuna fon adı veya notlar içinde arama yapabilirsiniz
- **Filtreler**: 
  - Tip filtresi: Fon, Döviz, Hisse Senedi, Diğer
  - Para birimi filtresi: TRY, USD, EUR
- Filtreleri temizlemek için "Temizle" butonunu kullanın

### Grafikler ve Analiz

- **Zaman Bazında Performans**: Toplam yatırım ve güncel değer grafiği
- **Portföy Dağılımı**: Yatırım türlerine göre pasta grafiği
- **Fon Bazında Dağılım**: Her fon için detaylı bilgiler ve kar/zarar durumu
- **Performans Kartları**: Toplam yatırım, güncel değer ve kar/zarar özeti

## 🛠️ Teknolojiler

### Core
- **Next.js 14**: React framework (App Router)
- **TypeScript**: Tip güvenliği
- **React 18**: UI kütüphanesi

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Recharts**: Grafik görselleştirme

### Form & Validation
- **React Hook Form**: Performanslı form yönetimi
- **Zod**: Schema validation

### Storage & Sync
- **Firebase**: Cloud storage ve real-time sync (opsiyonel)
- **localStorage**: Yerel veri depolama

### Testing
- **Jest**: Test framework
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction testing

### Other
- **React Hot Toast**: Toast notifications
- **PWA**: Progressive Web App desteği
- **date-fns**: Tarih işlemleri

## 📁 Proje Yapısı

```
myPortfolio/
├── app/                      # Next.js app router
│   ├── __tests__/           # Page tests
│   ├── page.tsx             # Ana sayfa
│   └── layout.tsx           # Root layout
├── components/              # React bileşenleri
│   ├── __tests__/           # Component tests
│   ├── InvestmentForm.tsx   # Yatırım formu
│   ├── InvestmentList.tsx  # Yatırım listesi
│   ├── PerformanceChart.tsx # Performans grafiği
│   ├── PortfolioChart.tsx   # Portföy grafiği
│   ├── SummaryCard.tsx      # Özet kartları
│   ├── LoadingSpinner.tsx  # Loading spinner
│   └── SkeletonLoader.tsx   # Skeleton loader
├── lib/                     # Yardımcı fonksiyonlar
│   ├── __tests__/           # Library tests
│   ├── storage.ts           # Yerel depolama
│   ├── cloudStorage.ts      # Firebase sync
│   ├── firebase.ts          # Firebase config
│   ├── utils.ts             # Yardımcı fonksiyonlar
│   ├── validation.ts        # Zod schemas
│   ├── constants.ts         # Uygulama sabitleri
│   └── exportImport.ts      # Dışa/içe aktarma
├── hooks/                   # Custom React hooks
│   ├── __tests__/
│   └── useDebounce.ts       # Debounce hook
├── contexts/                # React contexts
│   └── ThemeContext.tsx     # Theme context
├── types/                   # TypeScript tipleri
│   └── investment.ts
└── public/                  # Static dosyalar
    └── manifest.json         # PWA manifest
```

## 📜 Scripts

```bash
# Geliştirme
npm run dev          # Geliştirme sunucusunu başlatır (localhost:3000)

# Production
npm run build        # Production build oluşturur
npm run start        # Production sunucusunu başlatır

# Test
npm test             # Tüm testleri çalıştırır
npm run test:watch   # Watch mode'da testleri çalıştırır
npm run test:coverage # Test coverage raporu oluşturur

# Code Quality
npm run lint         # ESLint kontrolü yapar
npx tsc --noEmit     # TypeScript type kontrolü
```

## 🧪 Test Coverage

```
Statements   : 67.05% ( 519/774 )
Branches     : 54.54% ( 288/528 )
Functions    : 68.58% ( 131/191 )
Lines        : 67.73% ( 485/716 )
```

- **30 test suite** - Tüm testler geçiyor ✅
- **239 test** - Comprehensive test coverage
- Edge cases ve integration testleri dahil

## 🚀 Performance

- **Bundle Size**: 127 kB (First Load JS: 216 kB)
- **Code Splitting**: Dynamic imports ile optimize edilmiş
- **Debounce**: Search input için 300ms debounce
- **Memoization**: React.memo ve useCallback ile optimize edilmiş render'lar

## 🔧 Konfigürasyon

### Firebase (Opsiyonel)

Firebase kullanmak için `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

Detaylı kurulum için `FIREBASE_SETUP.md` dosyasına bakın.

### PWA

PWA özellikleri otomatik olarak aktif. Production build'de service worker otomatik oluşturulur.

## 📝 Geliştirme Notları

### Code Style
- TypeScript strict mode aktif
- ESLint kuralları Next.js standartlarına uygun
- Prettier formatı (önerilir)

### Best Practices
- ✅ Type safety: Tüm kodlar TypeScript ile tip güvenli
- ✅ Error handling: Silent fail pattern kullanılıyor
- ✅ Accessibility: ARIA attributes ve semantic HTML
- ✅ Performance: Code splitting, memoization, debounce
- ✅ Testing: Comprehensive test coverage

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

© 2026 Yatırım Portföyüm • Tüm hakları saklıdır

## 🙏 Teşekkürler

Bu proje modern web teknolojileri ve best practices kullanılarak geliştirilmiştir.
