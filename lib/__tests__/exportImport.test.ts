import {
  exportInvestments,
  downloadJSON,
  exportCSV,
  downloadCSV,
  importInvestments,
} from '../exportImport';
import { Investment } from '@/types/investment';

// Mock DOM methods
global.URL.createObjectURL = jest.fn(() => 'blob:url');
global.URL.revokeObjectURL = jest.fn();
global.Blob = jest.fn((parts) => ({ parts })) as any;

describe('exportInvestments', () => {
  it('should export investments as JSON string', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    const result = exportInvestments(investments);
    const parsed = JSON.parse(result);
    expect(parsed.version).toBe('1.0');
    expect(parsed.investments).toHaveLength(1);
    expect(parsed.investments[0].id).toBe('1');
    expect(parsed.exportDate).toBeDefined();
  });

  it('should handle empty investments array', () => {
    const result = exportInvestments([]);
    const parsed = JSON.parse(result);
    expect(parsed.investments).toEqual([]);
  });
});

describe('downloadJSON', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('should create and click download link', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    const createElementSpy = jest.spyOn(document, 'createElement');
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    const removeChildSpy = jest.spyOn(document.body, 'removeChild');

    downloadJSON(investments);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});

describe('exportCSV', () => {
  it('should export investments as CSV string', () => {
    const investments: Investment[] = [
      {
        id: '1',
        date: '2025-01-01',
        type: 'fon',
        fundName: 'Altın Fon',
        amount: 1000,
        price: 50,
        currency: 'TRY',
        notes: 'Test',
      },
    ];

    const result = exportCSV(investments);
    expect(result).toContain('Tarih');
    expect(result).toContain('Kategori');
    expect(result).toContain('Fon Adı');
    expect(result).toContain('2025-01-01');
    expect(result).toContain('fon');
    expect(result).toContain('Altın Fon');
    expect(result).toContain('1000');
  });

  it('should handle investments without optional fields', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    const result = exportCSV(investments);
    expect(result).toContain('2025-01-01');
    expect(result).toContain('Altın Fon');
  });

  it('should handle empty investments array', () => {
    const result = exportCSV([]);
    expect(result).toContain('Tarih');
    expect(result.split('\n').length).toBe(1); // Only header
  });
});

describe('downloadCSV', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('should create and click download link for CSV', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    const createElementSpy = jest.spyOn(document, 'createElement');
    downloadCSV(investments);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});

describe('importInvestments', () => {
  it('should import investments from new format', () => {
    const jsonString = JSON.stringify({
      version: '1.0',
      exportDate: '2025-01-01',
      investments: [
        { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
      ],
    });

    const result = importInvestments(jsonString);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should import investments from old format (array)', () => {
    const jsonString = JSON.stringify([
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ]);

    const result = importInvestments(jsonString);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should throw error for invalid format', () => {
    const jsonString = JSON.stringify({ invalid: 'format' });

    expect(() => importInvestments(jsonString)).toThrow('Dosya okunamadı. Lütfen geçerli bir JSON dosyası seçin.');
  });

  it('should throw error for invalid JSON', () => {
    expect(() => importInvestments('invalid json')).toThrow('Dosya okunamadı');
  });
});
