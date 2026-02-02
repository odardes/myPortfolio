import {
  getInvestmentsSync,
  saveInvestmentsSync,
  getFundCurrentValues,
  saveFundCurrentValues,
} from '../storage';
import { Investment, FundCurrentValue } from '@/types/investment';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('getInvestmentsSync', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should return empty array when localStorage is empty', () => {
    const result = getInvestmentsSync();
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0); // Returns initial data
  });

  it('should return investments from localStorage', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];
    localStorageMock.setItem('portfolio-investments', JSON.stringify(investments));

    const result = getInvestmentsSync();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorageMock.setItem('portfolio-investments', 'invalid json');
    const result = getInvestmentsSync();
    expect(result).toBeInstanceOf(Array);
  });

  it('should migrate old investment formats', () => {
    const oldInvestments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'gümüş' as any, fundName: 'GTZ', amount: 1000 },
    ];
    localStorageMock.setItem('portfolio-investments', JSON.stringify(oldInvestments));

    const result = getInvestmentsSync();
    expect(result[0].type).toBe('fon');
  });
});

describe('saveInvestmentsSync', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should save investments to localStorage', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    saveInvestmentsSync(investments);
    const stored = localStorageMock.getItem('portfolio-investments');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('1');
  });

  it('should handle localStorage errors gracefully', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    // Mock localStorage.setItem to throw error
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = jest.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    expect(() => saveInvestmentsSync(investments)).not.toThrow();
    localStorageMock.setItem = originalSetItem;
  });
});

describe('getFundCurrentValues', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should return empty array when localStorage is empty', () => {
    const result = getFundCurrentValues();
    expect(result).toEqual([]);
  });

  it('should return fund current values from localStorage', () => {
    const values: FundCurrentValue[] = [
      { fundName: 'Altın Fon', type: 'fon', currentValue: 1200, lastUpdated: '2025-01-01' },
    ];
    localStorageMock.setItem('portfolio-fund-current-values', JSON.stringify(values));

    const result = getFundCurrentValues();
    expect(result).toHaveLength(1);
    expect(result[0].fundName).toBe('Altın Fon');
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorageMock.setItem('portfolio-fund-current-values', 'invalid json');
    const result = getFundCurrentValues();
    expect(result).toEqual([]);
  });
});

describe('saveFundCurrentValues', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should save fund current values to localStorage', () => {
    const values: FundCurrentValue[] = [
      { fundName: 'Altın Fon', type: 'fon', currentValue: 1200, lastUpdated: '2025-01-01' },
    ];

    saveFundCurrentValues(values);
    const stored = localStorageMock.getItem('portfolio-fund-current-values');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].fundName).toBe('Altın Fon');
  });

  it('should handle localStorage errors gracefully', () => {
    const values: FundCurrentValue[] = [
      { fundName: 'Altın Fon', type: 'fon', currentValue: 1200, lastUpdated: '2025-01-01' },
    ];

    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = jest.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    expect(() => saveFundCurrentValues(values)).not.toThrow();
    localStorageMock.setItem = originalSetItem;
  });
});
