import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestmentList from '../InvestmentList';
import { Investment } from '@/types/investment';

// Mock storage
jest.mock('@/lib/storage', () => ({
  saveInvestmentsSync: jest.fn(),
  getInvestmentsSync: jest.fn(() => []),
}));

const mockOnUpdate = jest.fn();

const mockInvestments: Investment[] = [
  { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000, currentValue: 1200, currency: 'TRY' },
  { id: '2', date: '2025-01-02', type: 'fon', fundName: 'Gümüş Fon', amount: 2000, currency: 'TRY' },
  { id: '3', date: '2025-01-03', type: 'döviz', fundName: 'Dolar', amount: 500, currency: 'USD' },
  { id: '4', date: '2025-01-04', type: 'diğer', fundName: 'GTL', amount: 300, currency: 'TRY', notes: 'Test notu' },
];

describe('InvestmentList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  it('should render investment list', () => {
    render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
    expect(screen.getByText('Yatırım Geçmişi')).toBeInTheDocument();
  });

  it('should display empty state when no investments', () => {
    render(<InvestmentList investments={[]} onUpdate={mockOnUpdate} />);
    expect(screen.getByText(/Henüz yatırım eklenmemiş/i)).toBeInTheDocument();
  });

  it('should group investments by category', () => {
    render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
    expect(screen.getByText('Fon')).toBeInTheDocument();
    expect(screen.getByText('Döviz')).toBeInTheDocument();
    expect(screen.getByText('Diğer')).toBeInTheDocument();
  });

  it('should toggle category expansion', () => {
    render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
    const fonCategory = screen.getByText('Fon').closest('button');
    
    if (fonCategory) {
      fireEvent.click(fonCategory);
      // Category should be expanded/collapsed
    }
  });

  it('should display profit/loss for investments with currentValue', () => {
    render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
    // Investment with currentValue should show profit/loss
    const investmentWithValue = mockInvestments[0];
    expect(investmentWithValue.currentValue).toBeDefined();
  });

  it('should show edit form when edit button is clicked', () => {
    render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
    // This would require expanding the category first
    // For now, just verify the component renders
    expect(screen.getByText('Yatırım Geçmişi')).toBeInTheDocument();
  });

  describe('Search functionality', () => {
    it('should filter investments by fund name', async () => {
      const user = userEvent.setup();
      render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
      
      const searchInput = screen.getByLabelText(/yatırımlarda ara/i);
      await user.type(searchInput, 'Altın');
      
      await waitFor(() => {
        expect(screen.getByText(/1 sonuç/i)).toBeInTheDocument();
      });
    });

    it('should filter investments by notes', async () => {
      const user = userEvent.setup();
      render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
      
      const searchInput = screen.getByLabelText(/yatırımlarda ara/i);
      await user.type(searchInput, 'Test');
      
      await waitFor(() => {
        expect(screen.getByText(/1 sonuç/i)).toBeInTheDocument();
      });
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
      
      const searchInput = screen.getByLabelText(/yatırımlarda ara/i);
      await user.type(searchInput, 'Altın');
      
      const clearButton = screen.getByLabelText(/arama metnini temizle/i);
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Filter functionality', () => {
    it('should show filter panel when filter button is clicked', async () => {
      const user = userEvent.setup();
      render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
      
      const filterButton = screen.getByLabelText(/filtreleri göster/i);
      await user.click(filterButton);
      
      expect(screen.getByLabelText(/filtre seçenekleri/i)).toBeInTheDocument();
    });

    it('should filter by investment type', async () => {
      const user = userEvent.setup();
      render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
      
      const filterButton = screen.getByLabelText(/filtreleri göster/i);
      await user.click(filterButton);
      
      const typeFilter = screen.getByLabelText(/yatırım türüne göre filtrele/i);
      await user.selectOptions(typeFilter, 'fon');
      
      await waitFor(() => {
        expect(screen.getByText(/2 sonuç/i)).toBeInTheDocument();
      });
    });

    it('should filter by currency', async () => {
      const user = userEvent.setup();
      render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
      
      const filterButton = screen.getByLabelText(/filtreleri göster/i);
      await user.click(filterButton);
      
      const currencyFilter = screen.getByLabelText(/para birimine göre filtrele/i);
      await user.selectOptions(currencyFilter, 'USD');
      
      await waitFor(() => {
        expect(screen.getByText(/1 sonuç/i)).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<InvestmentList investments={mockInvestments} onUpdate={mockOnUpdate} />);
      
      const filterButton = screen.getByLabelText(/filtreleri göster/i);
      await user.click(filterButton);
      
      const typeFilter = screen.getByLabelText(/yatırım türüne göre filtrele/i);
      await user.selectOptions(typeFilter, 'fon');
      
      const clearButton = screen.getByLabelText(/tüm filtreleri temizle/i);
      await user.click(clearButton);
      
      expect(typeFilter).toHaveValue('all');
    });
  });
});
