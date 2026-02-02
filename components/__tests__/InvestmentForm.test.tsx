import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestmentForm from '../InvestmentForm';
import { Investment } from '@/types/investment';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null,
}));

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

describe('InvestmentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form with all fields', () => {
    render(<InvestmentForm onSave={mockOnSave} />);
    
    expect(screen.getByText(/Tarih/i)).toBeInTheDocument();
    expect(screen.getByText(/Yatırım Türü/i)).toBeInTheDocument();
    expect(screen.getByText(/Fon Adı/i)).toBeInTheDocument();
    expect(screen.getByText(/Tutar \(TRY\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Para Birimi/i)).toBeInTheDocument();
    expect(screen.getByText(/Güncel Değer/i)).toBeInTheDocument();
  });

  it('should prefill form when editing existing investment', () => {
    const investment: Investment = {
      id: '1',
      date: '2025-01-01',
      type: 'fon',
      fundName: 'Altın Fon',
      amount: 1000,
      price: 50,
      currency: 'TRY',
      currentValue: 1200,
      notes: 'Test note',
    };

    render(<InvestmentForm investment={investment} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    expect(screen.getByDisplayValue('2025-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Altın Fon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    const priceInput = screen.getByDisplayValue('50');
    expect(priceInput).toBeInTheDocument();
    const currentValueInput = screen.getByDisplayValue('1200');
    expect(currentValueInput).toBeInTheDocument();
  });

  it.skip('should call onSave with correct data on submit', async () => {
    const user = userEvent.setup();
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const fundNameInput = screen.getByPlaceholderText(/Altın Fon/i);
    const amountInput = screen.getByLabelText(/Tutar \(TRY\)/i);
    
    // Fill form fields
    await user.clear(fundNameInput);
    await user.type(fundNameInput, 'Altın Fon');
    
    // Clear and set amount (must be > 0.01 for validation)
    await user.clear(amountInput);
    await user.type(amountInput, '1000');
    
    const submitButton = screen.getByText('Ekle');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    }, { timeout: 3000 });

    const callArgs = mockOnSave.mock.calls[0][0];
    expect(callArgs.fundName).toBe('Altın Fon');
    expect(callArgs.amount).toBe(1000);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<InvestmentForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    await user.click(screen.getByText('İptal'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show "Güncelle" button when editing', () => {
    const investment: Investment = {
      id: '1',
      date: '2025-01-01',
      type: 'fon',
      fundName: 'Altın Fon',
      amount: 1000,
    };

    render(<InvestmentForm investment={investment} onSave={mockOnSave} />);
    expect(screen.getByText('Güncelle')).toBeInTheDocument();
  });

  it.skip('should handle form submission with all fields', async () => {
    const user = userEvent.setup();
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const fundNameInput = screen.getByPlaceholderText(/Altın Fon/i);
    const amountInput = screen.getByLabelText(/Tutar \(TRY\)/i);
    
    // Fill required fields
    await user.clear(fundNameInput);
    await user.type(fundNameInput, 'Altın Fon');
    
    await user.clear(amountInput);
    await user.type(amountInput, '1000');
    
    const submitButton = screen.getByText('Ekle');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should handle currentValue input', async () => {
    const user = userEvent.setup();
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const currentValueInput = screen.getByLabelText(/Güncel Değer/i);
    
    await user.clear(currentValueInput);
    await user.type(currentValueInput, '1200');
    expect((currentValueInput as HTMLInputElement).value).toBe('1200');
  });

  it('should handle price input', async () => {
    const user = userEvent.setup();
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const priceInput = screen.getByLabelText(/Birim Fiyat/i);
    
    await user.clear(priceInput);
    await user.type(priceInput, '50');
    expect((priceInput as HTMLInputElement).value).toBe('50');
  });

  it('should handle currency selection', async () => {
    const user = userEvent.setup();
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const currencySelect = screen.getByLabelText(/Para Birimi/i);
    await user.selectOptions(currencySelect, 'USD');
    expect((currencySelect as HTMLSelectElement).value).toBe('USD');
  });

  it('should handle type selection', async () => {
    const user = userEvent.setup();
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const typeSelect = screen.getByLabelText(/Yatırım Türü/i);
    expect((typeSelect as HTMLSelectElement).value).toBe('fon'); // Default value
    await user.selectOptions(typeSelect, 'döviz');
    expect((typeSelect as HTMLSelectElement).value).toBe('döviz');
  });

  it('should show validation errors for invalid input', async () => {
    const user = userEvent.setup();
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const fundNameInput = screen.getByPlaceholderText(/Altın Fon/i);
    const amountInput = screen.getByLabelText(/Tutar \(TRY\)/i);
    
    // Clear required fields to trigger validation
    await user.clear(fundNameInput);
    await user.clear(amountInput);
    
    const submitButton = screen.getByText('Ekle');
    await user.click(submitButton);

    // Should show validation errors - wait for form validation to complete
    await waitFor(() => {
      const errorMessage = screen.queryByText(/Fon adı gereklidir/i) || screen.queryByText(/Fon adı en az 2 karakter olmalıdır/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // onSave should not be called when validation fails
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should show error for future date', async () => {
    const user = userEvent.setup();
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const dateInput = screen.getByLabelText(/Tarih/i);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    await user.clear(dateInput);
    await user.type(dateInput, futureDateString);
    
    // Fill required fields so form can be submitted
    const fundNameInput = screen.getByPlaceholderText(/Altın Fon/i);
    const amountInput = screen.getByLabelText(/Tutar \(TRY\)/i);
    await user.type(fundNameInput, 'Test Fon');
    await user.type(amountInput, '1000');
    
    const submitButton = screen.getByText('Ekle');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Tarih bugünden ileri olamaz/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // onSave should not be called when validation fails
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
