import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportImport from '../ExportImport';
import { Investment } from '@/types/investment';

// Mock exportImport functions
jest.mock('@/lib/exportImport', () => ({
  downloadJSON: jest.fn(),
  downloadCSV: jest.fn(),
  importInvestments: jest.fn(),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockInvestments: Investment[] = [
  {
    id: '1',
    date: '2025-01-01',
    type: 'fon',
    fundName: 'Test Fon',
    amount: 1000,
    currency: 'TRY',
  },
];

describe('ExportImport', () => {
  const mockOnImport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render export and import buttons', () => {
    render(<ExportImport investments={mockInvestments} onImport={mockOnImport} />);
    
    expect(screen.getByLabelText('Yatırımları dışa aktar')).toBeInTheDocument();
    expect(screen.getByLabelText('Yatırımları içe aktar')).toBeInTheDocument();
  });

  it('should show export menu when export button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportImport investments={mockInvestments} onImport={mockOnImport} />);
    
    const exportButton = screen.getByLabelText('Yatırımları dışa aktar');
    await user.click(exportButton);
    
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('should export JSON when JSON option is clicked', async () => {
    const user = userEvent.setup();
    const { downloadJSON } = require('@/lib/exportImport');
    
    render(<ExportImport investments={mockInvestments} onImport={mockOnImport} />);
    
    const exportButton = screen.getByLabelText('Yatırımları dışa aktar');
    await user.click(exportButton);
    
    const jsonButton = screen.getByLabelText('JSON formatında dışa aktar');
    await user.click(jsonButton);
    
    expect(downloadJSON).toHaveBeenCalledWith(mockInvestments);
  });

  it('should export CSV when CSV option is clicked', async () => {
    const user = userEvent.setup();
    const { downloadCSV } = require('@/lib/exportImport');
    
    render(<ExportImport investments={mockInvestments} onImport={mockOnImport} />);
    
    const exportButton = screen.getByLabelText('Yatırımları dışa aktar');
    await user.click(exportButton);
    
    const csvButton = screen.getByLabelText('CSV formatında dışa aktar');
    await user.click(csvButton);
    
    expect(downloadCSV).toHaveBeenCalledWith(mockInvestments);
  });

  it('should open import modal when import button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportImport investments={mockInvestments} onImport={mockOnImport} />);
    
    const importButton = screen.getByLabelText('Yatırımları içe aktar');
    await user.click(importButton);
    
    expect(screen.getByText('Yatırımları İçe Aktar')).toBeInTheDocument();
    expect(screen.getByText(/Dosyayı buraya sürükleyin/i)).toBeInTheDocument();
  });

  it('should close import modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportImport investments={mockInvestments} onImport={mockOnImport} />);
    
    const importButton = screen.getByLabelText('Yatırımları içe aktar');
    await user.click(importButton);
    
    const cancelButton = screen.getByLabelText('İçe aktarmayı iptal et');
    await user.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Yatırımları İçe Aktar')).not.toBeInTheDocument();
    });
  });

  it('should handle file input change', async () => {
    const user = userEvent.setup();
    const { importInvestments } = require('@/lib/exportImport');
    const importedData: Investment[] = [
      { id: '2', date: '2025-02-01', type: 'fon', fundName: 'Imported Fon', amount: 2000, currency: 'TRY' },
    ];
    
    importInvestments.mockReturnValue(importedData);
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: jest.fn(function(this: FileReader) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: '{"investments":[]}' } } as any);
          }
        }, 0);
      }),
      onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
    };
    
    global.FileReader = jest.fn(() => mockFileReader) as any;
    
    render(<ExportImport investments={mockInvestments} onImport={mockOnImport} />);
    
    const importButton = screen.getByLabelText('Yatırımları içe aktar');
    await user.click(importButton);
    
    const fileInput = screen.getByLabelText('Dosya seçici');
    const file = new File(['{"investments":[]}'], 'test.json', { type: 'application/json' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(importInvestments).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should show import preview when file is loaded', async () => {
    const user = userEvent.setup();
    const { importInvestments } = require('@/lib/exportImport');
    const importedData: Investment[] = [
      { id: '2', date: '2025-02-01', type: 'fon', fundName: 'Imported Fon', amount: 2000, currency: 'TRY' },
    ];
    
    importInvestments.mockReturnValue(importedData);
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: jest.fn(function(this: FileReader) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: '{"investments":[]}' } } as any);
          }
        }, 0);
      }),
      onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
    };
    
    global.FileReader = jest.fn(() => mockFileReader) as any;
    
    render(<ExportImport investments={mockInvestments} onImport={mockOnImport} />);
    
    const importButton = screen.getByLabelText('Yatırımları içe aktar');
    await user.click(importButton);
    
    const fileInput = screen.getByLabelText('Dosya seçici');
    const file = new File(['{"investments":[]}'], 'test.json', { type: 'application/json' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText(/1 yatırım bulundu/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should call onImport when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const { importInvestments } = require('@/lib/exportImport');
    const importedData: Investment[] = [
      { id: '2', date: '2025-02-01', type: 'fon', fundName: 'Imported Fon', amount: 2000, currency: 'TRY' },
    ];
    
    importInvestments.mockReturnValue(importedData);
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: jest.fn(function(this: FileReader) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: '{"investments":[]}' } } as any);
          }
        }, 0);
      }),
      onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
    };
    
    global.FileReader = jest.fn(() => mockFileReader) as any;
    
    render(<ExportImport investments={mockInvestments} onImport={mockOnImport} />);
    
    const importButton = screen.getByLabelText('Yatırımları içe aktar');
    await user.click(importButton);
    
    const fileInput = screen.getByLabelText('Dosya seçici');
    const file = new File(['{"investments":[]}'], 'test.json', { type: 'application/json' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      const confirmButton = screen.queryByLabelText('İçe aktarmayı onayla');
      expect(confirmButton).toBeInTheDocument();
    }, { timeout: 2000 });
    
    const confirmButton = screen.getByLabelText('İçe aktarmayı onayla');
    await user.click(confirmButton);
    
    expect(mockOnImport).toHaveBeenCalledWith(importedData);
  });

  it('should show error message when import fails', async () => {
    const user = userEvent.setup();
    const { importInvestments } = require('@/lib/exportImport');
    
    importInvestments.mockImplementation(() => {
      throw new Error('Geçersiz dosya formatı');
    });
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: jest.fn(function(this: FileReader) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: 'invalid' } } as any);
          }
        }, 0);
      }),
      onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
    };
    
    global.FileReader = jest.fn(() => mockFileReader) as any;
    
    render(<ExportImport investments={mockInvestments} onImport={mockOnImport} />);
    
    const importButton = screen.getByLabelText('Yatırımları içe aktar');
    await user.click(importButton);
    
    const fileInput = screen.getByLabelText('Dosya seçici');
    const file = new File(['invalid'], 'test.json', { type: 'application/json' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByText(/Hata/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
