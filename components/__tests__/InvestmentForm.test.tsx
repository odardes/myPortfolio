import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InvestmentForm from '../InvestmentForm';
import { Investment } from '@/types/investment';

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
    expect(screen.getByText(/Tutar/i)).toBeInTheDocument();
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

  it('should call onSave with correct data on submit', async () => {
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const dateInput = screen.getByDisplayValue(new Date().toISOString().split('T')[0]);
    const fundNameInput = screen.getByPlaceholderText(/Altın Fon/i);
    const amountInput = screen.getAllByPlaceholderText('0').find(el => 
      el.getAttribute('type') === 'number' && el.getAttribute('required') !== null
    ) || screen.getAllByPlaceholderText('0')[0];
    
    fireEvent.change(fundNameInput, { target: { value: 'Altın Fon' } });
    fireEvent.change(amountInput, { target: { value: '1000' } });
    
    const submitButton = screen.getByText('Ekle');
    fireEvent.submit(submitButton.closest('form')!);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });

    const callArgs = mockOnSave.mock.calls[0][0];
    expect(callArgs.fundName).toBe('Altın Fon');
    expect(callArgs.amount).toBe(1000);
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<InvestmentForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText('İptal'));
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

  it('should handle form submission with all fields', async () => {
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const fundNameInput = screen.getByPlaceholderText(/Altın Fon/i);
    const amountInput = screen.getAllByPlaceholderText('0')[0];
    const form = fundNameInput.closest('form');
    
    fireEvent.change(fundNameInput, { target: { value: 'Altın Fon' } });
    fireEvent.change(amountInput, { target: { value: '1000' } });
    
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(screen.getByText('Ekle'));
    }

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should handle currentValue input', () => {
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const currentValueInputs = screen.getAllByPlaceholderText('0');
    const currentValueInput = currentValueInputs.find(input => 
      input.getAttribute('placeholder')?.includes('güncel') || 
      input.closest('div')?.textContent?.includes('Güncel Değer')
    ) || currentValueInputs[currentValueInputs.length - 1];
    
    if (currentValueInput) {
      fireEvent.change(currentValueInput, { target: { value: '1200' } });
      expect((currentValueInput as HTMLInputElement).value).toBe('1200');
    }
  });

  it('should handle price input', () => {
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const priceInputs = screen.getAllByPlaceholderText('0');
    const priceInput = priceInputs[1] || priceInputs[0];
    
    fireEvent.change(priceInput, { target: { value: '50' } });
    expect((priceInput as HTMLInputElement).value).toBe('50');
  });

  it('should handle currency selection', () => {
    render(<InvestmentForm onSave={mockOnSave} />);
    
    const currencySelect = screen.getByDisplayValue('TRY');
    fireEvent.change(currencySelect, { target: { value: 'USD' } });
    expect((currencySelect as HTMLSelectElement).value).toBe('USD');
  });

  it('should handle type selection', () => {
    render(<InvestmentForm onSave={mockOnSave} />);
    
    // Find select by its options
    const typeSelects = screen.getAllByRole('combobox');
    const typeSelect = typeSelects.find(select => {
      const options = Array.from(select.querySelectorAll('option'));
      return options.some(opt => opt.textContent === 'Fon');
    }) as HTMLSelectElement;
    
    expect(typeSelect).toBeDefined();
    expect(typeSelect.value).toBe('fon'); // Default value
    fireEvent.change(typeSelect, { target: { value: 'döviz' } });
    expect(typeSelect.value).toBe('döviz');
  });
});
