import { render, screen } from '@testing-library/react';
import SummaryCard from '../SummaryCard';
import { InvestmentType } from '@/types/investment';

describe('SummaryCard', () => {
  it('should render with correct props', () => {
    render(<SummaryCard type="fon" totalAmount={1000} count={5} percentage={50} />);
    
    expect(screen.getByText('Fon')).toBeInTheDocument();
    expect(screen.getByText('5 yatırım')).toBeInTheDocument();
    expect(screen.getByText('₺1.000')).toBeInTheDocument();
    expect(screen.getByText('%50.0')).toBeInTheDocument();
  });

  it('should render all investment types correctly', () => {
    const types: InvestmentType[] = ['fon', 'döviz', 'hisse', 'diğer'];
    
    types.forEach(type => {
      const { unmount } = render(<SummaryCard type={type} totalAmount={1000} count={1} percentage={25} />);
      expect(screen.getByText(getTypeLabel(type))).toBeInTheDocument();
      unmount();
    });
  });

  it('should display correct percentage', () => {
    render(<SummaryCard type="fon" totalAmount={1000} count={1} percentage={33.333} />);
    expect(screen.getByText('%33.3')).toBeInTheDocument();
  });

  it('should display zero percentage correctly', () => {
    render(<SummaryCard type="fon" totalAmount={0} count={0} percentage={0} />);
    expect(screen.getByText('%0.0')).toBeInTheDocument();
  });
});

function getTypeLabel(type: InvestmentType): string {
  const labels: Record<InvestmentType, string> = {
    fon: 'Fon',
    döviz: 'Döviz',
    hisse: 'Hisse Senedi',
    diğer: 'Diğer',
  };
  return labels[type];
}
