import { getInvestmentsSync } from '../storage';
import { Investment } from '@/types/investment';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Investment Migration', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('should migrate gümüş type to fon', () => {
    const oldInvestments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'gümüş' as any, fundName: 'GTZ', amount: 1000 },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(oldInvestments));

    const result = getInvestmentsSync();
    expect(result[0].type).toBe('fon');
    expect(result[0].fundName).toContain('Gümüş');
  });

  it('should migrate altın type correctly', () => {
    const oldInvestments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'altın' as any, fundName: 'Altın Fon', amount: 1000 },
      { id: '2', date: '2025-01-02', type: 'altın' as any, fundName: 'ALT', amount: 500 },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(oldInvestments));

    const result = getInvestmentsSync();
    expect(result[0].type).toBe('fon');
    expect(result[1].type).toBe('döviz');
  });

  it('should migrate USD to Dolar', () => {
    const oldInvestments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'döviz', fundName: 'USD', amount: 1000 },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(oldInvestments));

    const result = getInvestmentsSync();
    expect(result[0].fundName).toBe('Dolar');
  });

  it('should handle invalid JSON gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    const result = getInvestmentsSync();
    expect(result).toBeInstanceOf(Array);
  });

  it('should return initial data when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const result = getInvestmentsSync();
    expect(result.length).toBeGreaterThan(0);
  });
});
