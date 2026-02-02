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

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Home Page', () => {
  beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
  });

  it('should render main page elements', () => {
    renderWithTheme(<Home />);
    
    expect(screen.getByText('Yatırım Portföyüm')).toBeInTheDocument();
    expect(screen.getByText('Yeni Yatırım Ekle')).toBeInTheDocument();
  });

  it('should show add form when button is clicked', async () => {
    renderWithTheme(<Home />);
    
    const addButton = screen.getByText('Yeni Yatırım Ekle');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Fon Adı/i)).toBeInTheDocument();
    });
  });

  it('should display summary cards', () => {
    renderWithTheme(<Home />);
    // Summary cards should be rendered (even if empty)
    expect(screen.getByText('Toplam Yatırım')).toBeInTheDocument();
  });

  it('should display performance chart', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should display portfolio chart', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText('Portföy Dağılımı')).toBeInTheDocument();
  });

  it('should display fund distribution', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText('Fon Bazında Dağılım')).toBeInTheDocument();
  });

  it('should display performance section', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText('Performans')).toBeInTheDocument();
  });

  it('should display investment history', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText('Yatırım Geçmişi')).toBeInTheDocument();
  });
});
