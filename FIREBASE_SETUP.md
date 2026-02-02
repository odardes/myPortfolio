# Firebase Firestore Security Rules Kurulumu

Firebase permission hatası alıyorsanız, Firebase Console'dan security rules'ları ayarlamanız gerekiyor.

## Adımlar:

1. **Firebase Console'a gidin**: https://console.firebase.google.com/
2. **Projenizi seçin**: `my-portfolio-8d44a`
3. **Firestore Database** sekmesine gidin
4. **Rules** sekmesine tıklayın
5. **Aşağıdaki kuralları yapıştırın**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /investments/{userId} {
      allow read, write: if userId == 'portfolio-user-shared';
    }
    match /fundValues/{userId} {
      allow read, write: if userId == 'portfolio-user-shared';
    }
  }
}
```

6. **Publish** butonuna tıklayın

## Alternatif: Firebase CLI ile

Eğer Firebase CLI'ye login olduysanız:

```bash
firebase login
firebase deploy --only firestore:rules --project my-portfolio-8d44a
```

## Not

Bu kurallar herkese açık okuma/yazma izni verir çünkü uygulama `shared-user` kullanıyor. 
Daha güvenli bir yapı için authentication ekleyebilirsiniz.
