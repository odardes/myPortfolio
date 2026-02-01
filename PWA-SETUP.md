# PWA Kurulum Rehberi

Uygulamanız iOS'ta native app gibi çalışacak şekilde yapılandırıldı!

## ✅ Yapılanlar

1. ✅ `@ducanh2912/next-pwa` paketi eklendi
2. ✅ `next.config.js` PWA desteği ile güncellendi
3. ✅ `manifest.json` oluşturuldu
4. ✅ iOS için özel meta tagler eklendi (`layout.tsx`)
5. ✅ Service Worker otomatik oluşturulacak (build sırasında)

## 📱 iOS'ta Kullanım

### 1. İkonları Oluşturun

Uygulamanız için 3 ikon dosyası oluşturmanız gerekiyor:

- `public/icon-192x192.png` (192x192 piksel)
- `public/icon-512x512.png` (512x512 piksel)
- `public/apple-touch-icon.png` (180x180 piksel)

**İkon Oluşturma:**

1. **Online Araçlar:**
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

2. **Manuel:**
   - 512x512 piksel bir ikon tasarımı hazırlayın
   - Bu ikonu farklı boyutlara ölçeklendirin
   - PNG formatında kaydedin

### 2. Uygulamayı Build Edin

```bash
npm run build
npm start
```

**ÖNEMLİ:** PWA özellikleri sadece **production build**'de çalışır. Development modunda (`npm run dev`) çalışmaz.

### 3. Uygulamayı Yayınlayın

Vercel (önerilen):
```bash
npm install -g vercel
vercel --prod
```

Veya Netlify, kendi sunucunuz veya başka bir hosting servisi kullanabilirsiniz.

### 4. iOS'ta Ana Ekrana Ekleyin

1. iOS Safari'de uygulamanızı açın (örnek: `https://your-app.vercel.app`)
2. Paylaşım butonuna tıklayın (ekranın altında, kare içinde ok simgesi)
3. **"Ana Ekrana Ekle"** seçeneğini seçin
4. **"Ekle"** butonuna tıklayın

Artık uygulamanız ana ekranda bir app gibi görünecek! 🎉

## ✨ Özellikler

- **Standalone Mod**: Tam ekran, Safari çubukları gizli
- **Offline Çalışma**: İnternet olmasa bile çalışır (cache sayesinde)
- **App İkonu**: Ana ekranda özel ikon
- **Native Görünüm**: Native app gibi davranır

## 🔧 Sorun Giderme

### İkonlar görünmüyor
- İkon dosyalarının `public/` klasöründe olduğundan emin olun
- Dosya isimlerinin tam olarak doğru olduğunu kontrol edin
- Production build yaptığınızdan emin olun

### "Ana Ekrana Ekle" görünmüyor
- HTTPS kullanıldığından emin olun (HTTP çalışmaz)
- Production build kullandığınızdan emin olun
- Manifest.json dosyasının erişilebilir olduğunu kontrol edin

### Offline çalışmıyor
- Service Worker'ın yüklendiğini kontrol edin (Chrome DevTools > Application > Service Workers)
- Production build kullandığınızdan emin olun

## 📝 Notlar

- Development modunda (`npm run dev`) PWA özellikleri devre dışıdır
- Service Worker sadece production build'de oluşturulur
- İlk yüklemede internet bağlantısı gereklidir
- Sonraki kullanımlarda offline çalışabilir
