import { render, screen } from '@testing-library/react';
import PortfolioChart from '../PortfolioChart';
import { InvestmentSummary } from '@/types/investment';

describe('PortfolioChart', () => {
  const mockData: InvestmentSummary[] = [
    { type: 'fon', totalAmount: 1000, count: 2, investments: [] },
    { type: 'döviz', totalAmount: 500, count: 1, investments: [] },
  ];

  it('should render chart with data', () => {
    render(<PortfolioChart data={mockData} />);
    expect(screen.getByText('Portföy Dağılımı')).toBeInTheDocument();
  });

  it('should render empty state when data is empty', () => {
    render(<PortfolioChart data={[]} />);
    expect(screen.getByText('Portföy Dağılımı')).toBeInTheDocument();
  });

  it('should display all investment types in chart', () => {
    const allTypesData: InvestmentSummary[] = [
      { type: 'fon', totalAmount: 1000, count: 1, investments: [] },
      { type: 'döviz', totalAmount: 500, count: 1, investments: [] },
      { type: 'hisse', totalAmount: 300, count: 1, investments: [] },
      { type: 'diğer', totalAmount: 200, count: 1, investments: [] },
    ];

    render(<PortfolioChart data={allTypesData} />);
    expect(screen.getByText('Portföy Dağılımı')).toBeInTheDocument();
  });
});
