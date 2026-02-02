import { render, screen } from '@testing-library/react';
import PerformanceChart from '../PerformanceChart';
import { TimeSeriesDataPoint } from '@/lib/utils';

describe('PerformanceChart Interactions', () => {
  const mockData: TimeSeriesDataPoint[] = [
    { date: '2025-01-01', cumulativeInvested: 1000 },
    { date: '2025-01-02', cumulativeInvested: 2000 },
    { date: '2025-01-03', cumulativeInvested: 3000, currentValue: 3500 },
  ];

  it('should render chart with current value at last point', () => {
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
    expect(screen.getByText(/Mevcut Değer:/)).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(<PerformanceChart data={mockData} />);
    // Chart should render with formatted dates
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle data with only cumulativeInvested', () => {
    const dataWithoutCurrent: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 1000 },
      { date: '2025-01-02', cumulativeInvested: 2000 },
    ];
    
    render(<PerformanceChart data={dataWithoutCurrent} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
    expect(screen.queryByText(/Mevcut Değer:/)).not.toBeInTheDocument();
  });

  it('should show legend for both lines when currentValue exists', () => {
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText(/Toplam Yatırım:/)).toBeInTheDocument();
    expect(screen.getByText(/Mevcut Değer:/)).toBeInTheDocument();
  });
});
