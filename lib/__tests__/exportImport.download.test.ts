import {
  downloadJSON,
  downloadCSV,
} from '../exportImport';
import { Investment } from '@/types/investment';

// Mock DOM methods
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

beforeEach(() => {
  document.body.innerHTML = '';
  jest.clearAllMocks();
  
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
  
  jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'a') {
      return {
        href: '',
        download: '',
        click: mockClick,
        style: {},
      } as any;
    }
    return document.createElement(tagName);
  });
  
  jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
  jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
});

describe('downloadJSON', () => {
  it('should create download link and click it', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    downloadJSON(investments);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});

describe('downloadCSV', () => {
  it('should create download link and click it for CSV', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    downloadCSV(investments);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
