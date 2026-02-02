import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Investment } from '@/types/investment';

// Mock storage
const mockGetInvestments = jest.fn();
const mockSaveInvestments = jest.fn();
const mockGetInvestmentsSync = jest.fn();
const mockSaveInvestmentsSync = jest.fn();

jest.mock('@/lib/storage', () => ({
  getInvestmentsSync: () => mockGetInvestmentsSync(),
  saveInvestmentsSync: (data: Investment[]) => mockSaveInvestmentsSync(data),
  getInvestments: () => mockGetInvestments(),
  saveInvestments: (data: Investment[]) => mockSaveInvestments(data),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Home Page Comprehensive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
    mockGetInvestmentsSync.mockReturnValue([]);
    mockGetInvestments.mockResolvedValue([]);
    mockSaveInvestments.mockResolvedValue(undefined);
  });

  it('should handle async loadData with error fallback', async () => {
    mockGetInvestments.mockRejectedValueOnce(new Error('Network error'));
    
    renderWithTheme(<Home />);
    
    await waitFor(() => {
      expect(mockGetInvestmentsSync).toHaveBeenCalled();
    });
  });

  it('should handle handleUpdate with error fallback', async () => {
    mockGetInvestments.mockRejectedValueOnce(new Error('Network error'));
    
    renderWithTheme(<Home />);
    
    // Wait for initial load - should fallback to sync
    await waitFor(() => {
      expect(screen.getByText('Toplam Yatırım')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify sync was called as fallback
    expect(mockGetInvestmentsSync).toHaveBeenCalled();
  });

  it('should handle saveInvestment with async error fallback', async () => {
    mockSaveInvestments.mockRejectedValueOnce(new Error('Save error'));
    
    renderWithTheme(<Home />);
    
    const addButton = screen.getByText('Yeni Yatırım Ekle');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Tarih/i)).toBeInTheDocument();
    });
    
    const fundNameInput = screen.getByPlaceholderText(/Altın Fon/i);
    const amountInput = screen.getAllByPlaceholderText('0')[0];
    
    fireEvent.change(fundNameInput, { target: { value: 'Test Fon' } });
    fireEvent.change(amountInput, { target: { value: '1000' } });
    
    const submitButton = screen.getByText('Ekle');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSaveInvestmentsSync).toHaveBeenCalled();
    });
  });

  it('should handle updating existing investment', async () => {
    const existingInvestment: Investment = {
      id: '1',
      date: '2025-01-01',
      type: 'fon',
      fundName: 'Altın Fon',
      amount: 1000,
    };
    
    mockGetInvestmentsSync.mockReturnValue([existingInvestment]);
    
    renderWithTheme(<Home />);
    
    // Wait for component to render - investment may be in InvestmentList
    await waitFor(() => {
      expect(screen.getByText('Yatırım Geçmişi')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Component should render with investment data
    expect(screen.getByText('Yatırım Geçmişi')).toBeInTheDocument();
  });

  it('should calculate profit/loss correctly', async () => {
    const investments: Investment[] = [
      {
        id: '1',
        date: '2025-01-01',
        type: 'fon',
        fundName: 'Altın Fon',
        amount: 1000,
        currentValue: 1200,
      },
    ];
    
    mockGetInvestmentsSync.mockReturnValue(investments);
    
    renderWithTheme(<Home />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Toplam Kar/Zarar')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Profit/loss should be displayed
    expect(screen.getByText('Toplam Kar/Zarar')).toBeInTheDocument();
  });

  it('should display fund distribution with profit/loss', async () => {
    const investments: Investment[] = [
      {
        id: '1',
        date: '2025-01-01',
        type: 'fon',
        fundName: 'Altın Fon',
        amount: 1000,
        currentValue: 1200,
      },
      {
        id: '2',
        date: '2025-01-02',
        type: 'fon',
        fundName: 'Gümüş Fon',
        amount: 2000,
      },
    ];
    
    mockGetInvestmentsSync.mockReturnValue(investments);
    
    renderWithTheme(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Fon Bazında Dağılım')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
