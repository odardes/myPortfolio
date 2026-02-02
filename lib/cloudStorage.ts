import { Investment, FundCurrentValue } from '@/types/investment';
import { db, auth } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const COLLECTION_NAME = 'investments';
const FUND_VALUES_COLLECTION = 'fund-current-values';
const STATIC_USER_ID = 'shared-user'; // Tüm kullanıcılar için ortak ID

// Firebase kullanılabilir mi kontrolü
export function isFirebaseAvailable(): boolean {
  return typeof window !== 'undefined' && 
         !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
         !!db &&
         !!auth;
}

// Kullanıcı ID'sini al (shared user kullan)
async function getUserId(): Promise<string> {
  if (!isFirebaseAvailable() || !auth) {
    throw new Error('Firebase not configured');
  }

  // Shared user ID kullan - tüm cihazlar aynı veriyi görsün
  return STATIC_USER_ID;
}

// Firebase'den yatırımları getir
export async function getInvestmentsFromCloud(): Promise<Investment[]> {
  if (!isFirebaseAvailable() || !db) {
    return [];
  }

  try {
    const userId = await getUserId();
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().investments || [];
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Firebase'e yatırımları kaydet
export async function saveInvestmentsToCloud(investments: Investment[]): Promise<void> {
  if (!isFirebaseAvailable() || !db) {
    return;
  }

  try {
    const userId = await getUserId();
    const docRef = doc(db, COLLECTION_NAME, userId);
    await setDoc(docRef, {
      investments,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    throw error;
  }
}

// Firebase'den fon mevcut değerlerini getir
export async function getFundCurrentValuesFromCloud(): Promise<FundCurrentValue[]> {
  if (!isFirebaseAvailable() || !db) {
    return [];
  }

  try {
    const userId = await getUserId();
    const docRef = doc(db, FUND_VALUES_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().values || [];
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Firebase'e fon mevcut değerlerini kaydet
export async function saveFundCurrentValuesToCloud(values: FundCurrentValue[]): Promise<void> {
  if (!isFirebaseAvailable() || !db) {
    return;
  }

  try {
    const userId = await getUserId();
    const docRef = doc(db, FUND_VALUES_COLLECTION, userId);
    await setDoc(docRef, {
      values,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    throw error;
  }
}

// Gerçek zamanlı güncellemeleri dinle
export function subscribeToInvestments(
  callback: (investments: Investment[]) => void
): Unsubscribe | null {
  if (!isFirebaseAvailable() || !db) {
    return null;
  }

  let unsubscribe: Unsubscribe | null = null;

  getUserId()
    .then((userId) => {
      if (!db) return;
      const docRef = doc(db, COLLECTION_NAME, userId);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data().investments || []);
        } else {
          callback([]);
        }
      });
    })
    .catch(() => {
      // Silent fail
    });

  return unsubscribe;
}
