import {
  getInvestments,
  saveInvestments,
} from '../storage';

// Mock cloudStorage
jest.mock('../cloudStorage', () => ({
  getInvestmentsFromCloud: jest.fn(() => Promise.resolve([])),
  saveInvestmentsToCloud: jest.fn(() => Promise.resolve()),
  isFirebaseAvailable: jest.fn(() => false),
}));

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('getInvestments (async)', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('should return empty array when localStorage is empty', async () => {
    const result = await getInvestments();
    expect(result).toBeInstanceOf(Array);
  });

  it('should return investments from localStorage', async () => {
    const investments = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(investments));

    const result = await getInvestments();
    expect(result).toHaveLength(1);
  });

  it('should handle localStorage errors', async () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const result = await getInvestments();
    expect(result).toBeInstanceOf(Array);
  });
});

describe('saveInvestments (async)', () => {
  beforeEach(() => {
    localStorageMock.setItem.mockClear();
  });

  it('should save investments to localStorage', async () => {
    const investments = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    await saveInvestments(investments);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should handle localStorage errors gracefully', async () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const investments = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    await expect(saveInvestments(investments)).resolves.not.toThrow();
  });
});
