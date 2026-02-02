import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock storage
jest.mock('@/lib/storage', () => ({
  getInvestmentsSync: jest.fn(() => []),
  saveInvestmentsSync: jest.fn(),
  getInvestments: jest.fn(() => Promise.resolve([])),
  saveInvestments: jest.fn(() => Promise.resolve()),
}));

// Mock cloudStorage
jest.mock('@/lib/cloudStorage', () => ({
  subscribeToInvestments: jest.fn(() => null),
  isFirebaseAvailable: jest.fn(() => false),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Home Page Interactions', () => {
  beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
  });

  it('should toggle add form visibility', async () => {
    renderWithTheme(<Home />);
    
    const addButton = screen.getByText('Yeni Yatırım Ekle');
    expect(screen.queryByPlaceholderText(/Altın Fon/i)).not.toBeInTheDocument();
    
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Tarih/i)).toBeInTheDocument();
    });
    
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Altın Fon/i)).not.toBeInTheDocument();
    });
  });

  it('should display correct summary statistics', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText('Toplam Yatırım')).toBeInTheDocument();
    expect(screen.getByText('Toplam Kar/Zarar')).toBeInTheDocument();
  });

  it('should show "Mevcut değer girilmemiş" when no current values', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText(/Mevcut değer girilmemiş/i)).toBeInTheDocument();
  });

  it('should display all chart sections', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
    expect(screen.getByText('Portföy Dağılımı')).toBeInTheDocument();
    expect(screen.getByText('Fon Bazında Dağılım')).toBeInTheDocument();
    expect(screen.getByText('Performans')).toBeInTheDocument();
  });
});
