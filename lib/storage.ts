import { Investment, FundCurrentValue } from '@/types/investment';
import { getInvestmentsFromCloud, saveInvestmentsToCloud } from './cloudStorage';

const STORAGE_KEY = 'portfolio-investments';
const FUND_VALUES_KEY = 'portfolio-fund-current-values';

// Firebase kullanılabilir mi?
function isCloudAvailable(): boolean {
  return typeof window !== 'undefined' && 
         !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
}

export async function getInvestments(): Promise<Investment[]> {
  if (typeof window === 'undefined') return [];
  
  // Önce cloud'dan dene
  if (isCloudAvailable()) {
    try {
      const cloudData = await getInvestmentsFromCloud();
      if (cloudData && cloudData.length > 0) {
        // Cloud'dan veri geldi, localStorage'a da kaydet (yedek)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
        return migrateInvestments(cloudData);
      } else {
        // Cloud'da veri yok, localStorage'dan al ve cloud'a yükle
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const localInvestments = JSON.parse(stored);
            const migrated = migrateInvestments(localInvestments);
            if (migrated.length > 0) {
              // LocalStorage'dan veri var, cloud'a yükle
              try {
                await saveInvestmentsToCloud(migrated);
              } catch (error) {
                // Silent fail
              }
            }
            return migrated;
          }
        } catch (error) {
          // Silent fail
        }
      }
    } catch (error) {
      // Silent fail, fallback to localStorage
    }
  }
  
  // Cloud yoksa veya hata varsa localStorage'dan oku
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getInitialData();
    const investments = JSON.parse(stored);
    return migrateInvestments(investments);
  } catch (error) {
    return getInitialData();
  }
}

// Senkron versiyon (eski kod uyumluluğu için)
export function getInvestmentsSync(): Investment[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // İlk yüklemede initial data'yı localStorage'a kaydet
      const initialData = getInitialData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    const investments = JSON.parse(stored);
    return migrateInvestments(investments);
  } catch (error) {
    // Hata durumunda initial data'yı döndür ve kaydet
    const initialData = getInitialData();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    } catch (e) {
      // Silent fail
    }
    return initialData;
  }
}

export async function saveInvestments(investments: Investment[]): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // Önce localStorage'a kaydet (hızlı erişim için)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
  
  // Sonra cloud'a kaydet (senkronizasyon için)
  if (isCloudAvailable()) {
    try {
      await saveInvestmentsToCloud(investments);
    } catch (error) {
      console.warn('Failed to save to Firebase:', error);
      // localStorage'da var, devam et
    }
  }
}

// Senkron versiyon (eski kod uyumluluğu için)
export function saveInvestmentsSync(investments: Investment[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
    // Arka planda cloud'a da kaydet (async)
    if (isCloudAvailable()) {
      saveInvestmentsToCloud(investments).catch((error) => {
        console.warn('Failed to save to Firebase (async):', error);
      });
    }
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

// Fon mevcut değerleri
export function getFundCurrentValues(): FundCurrentValue[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FUND_VALUES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
}

export function saveFundCurrentValues(values: FundCurrentValue[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(FUND_VALUES_KEY, JSON.stringify(values));
  } catch (error) {
    // Silent fail
  }
}

// Eski veri formatından yeni formata migrate et
function migrateInvestments(investments: Investment[]): Investment[] {
  return investments.map(inv => {
    // Eski type değerlerini yeni formata çevir
    let type: Investment['type'] = inv.type;
    let fundName = inv.fundName;
    const typeStr = inv.type as string;
    
    // Eski kategori yapısından yeni yapıya geçiş
    if (typeStr === 'gümüş') {
      type = 'fon';
      if (fundName.includes('Gümüş') || fundName === 'GTZ') {
        fundName = 'Gümüş Fon';
      }
    } else if (typeStr === 'altın') {
      // Altın Fon → fon, Altın (ALT) → döviz
      if (fundName.includes('Altın Fon') || fundName.includes('GTA')) {
        type = 'fon';
        fundName = 'Altın Fon';
      } else if (fundName === 'ALT' || fundName === 'Altın') {
        type = 'döviz';
        fundName = 'Altın';
      }
    } else if (typeStr === 'döviz') {
      // USD → Dolar
      if (fundName === 'USD' || fundName.includes('USD')) {
        fundName = 'Dolar';
      }
    }
    
    return {
      ...inv,
      type,
      fundName,
    };
  });
}

function getInitialData(): Investment[] {
  return [
    // GTZ Gümüş Fon → Fon kategorisi
    { id: '1', date: '2025-10-06', type: 'fon', fundName: 'Gümüş Fon', amount: 10000 },
    { id: '2', date: '2025-08-04', type: 'fon', fundName: 'Gümüş Fon', amount: 11837 },
    { id: '3', date: '2025-06-19', type: 'fon', fundName: 'Gümüş Fon', amount: 15000 },
    { id: '4', date: '2025-03-05', type: 'fon', fundName: 'Gümüş Fon', amount: 15000 },
    
    // GTA Altın Fon → Fon kategorisi
    { id: '5', date: '2026-02-03', type: 'fon', fundName: 'Altın Fon', amount: 120000 },
    { id: '6', date: '2025-12-03', type: 'fon', fundName: 'Altın Fon', amount: 40000 },
    { id: '7', date: '2025-11-04', type: 'fon', fundName: 'Altın Fon', amount: 40000 },
    { id: '8', date: '2025-09-01', type: 'fon', fundName: 'Altın Fon', amount: 25000 },
    { id: '9', date: '2025-05-09', type: 'fon', fundName: 'Altın Fon', amount: 40000 },
    { id: '10', date: '2024-12-03', type: 'fon', fundName: 'Altın Fon', amount: 9000 },
    { id: '11', date: '2024-11-27', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    
    // GTL
    { id: '12', date: '2025-01-01', type: 'diğer', fundName: 'GTL', amount: 17955 },
    
    // USD
    { id: '13', date: '2025-06-30', type: 'döviz', fundName: 'USD', amount: 18000, price: 40.66, currency: 'USD' },
    { id: '14', date: '2024-12-03', type: 'döviz', fundName: 'USD', amount: 8000, price: 35.33, currency: 'USD' },
    
    // ALT (Altın)
    { id: '15', date: '2025-04-07', type: 'fon', fundName: 'ALT', amount: 20000, price: 3768, currency: 'TRY' },
    { id: '16', date: '2024-12-06', type: 'fon', fundName: 'ALT', amount: 15000, price: 2983, currency: 'TRY' },
  ];
}
