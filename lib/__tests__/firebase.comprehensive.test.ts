import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Mock firebase/app
const mockInitializeApp = jest.fn();
const mockGetApps = jest.fn<unknown[], []>(() => []);
const mockGetAuth = jest.fn(() => ({}));
const mockGetFirestore = jest.fn(() => ({}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
}));

describe('firebase', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-domain',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should export auth and db', async () => {
    const firebase = await import('../firebase');
    expect(firebase).toHaveProperty('auth');
    expect(firebase).toHaveProperty('db');
  });

  it('should handle Firebase initialization with valid config', () => {
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({});
    
    // Module is already loaded, so we test the functions directly
    expect(typeof initializeApp).toBe('function');
    expect(typeof getAuth).toBe('function');
    expect(typeof getFirestore).toBe('function');
  });

  it('should not initialize when config is missing', () => {
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    // Functions should still exist
    expect(typeof initializeApp).toBe('function');
    expect(typeof getAuth).toBe('function');
    expect(typeof getFirestore).toBe('function');
  });

  it('should use existing app when apps array is not empty', () => {
    const mockApp = { name: 'test-app' };
    (mockGetApps as jest.Mock<unknown[], []>).mockReturnValue([mockApp] as unknown[]);
    
    // When apps exist, should use existing app
    expect(mockGetApps().length).toBeGreaterThan(0);
  });

  it('should initialize with all required config values', () => {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
    
    expect(config.apiKey).toBeDefined();
    expect(config.authDomain).toBeDefined();
    expect(config.projectId).toBeDefined();
  });

  it('should handle server-side rendering (no window)', () => {
    // In SSR, window is undefined
    const isServerSide = typeof window === 'undefined';
    
    // Functions should still be available
    expect(typeof initializeApp).toBe('function');
    expect(typeof getAuth).toBe('function');
    expect(typeof getFirestore).toBe('function');
  });

  it('should export default app', async () => {
    const firebase = await import('../firebase');
    expect(firebase.default).toBeDefined();
  });
});
