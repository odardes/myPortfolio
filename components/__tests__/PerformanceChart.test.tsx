import { render, screen } from '@testing-library/react';
import PerformanceChart from '../PerformanceChart';
import { TimeSeriesDataPoint } from '@/lib/utils';

describe('PerformanceChart', () => {
  const mockData: TimeSeriesDataPoint[] = [
    { date: '2025-01-01', cumulativeInvested: 1000 },
    { date: '2025-01-02', cumulativeInvested: 2000 },
    { date: '2025-01-03', cumulativeInvested: 3000, currentValue: 3500 },
  ];

  it('should render chart with data', () => {
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should render empty state when data is empty', () => {
    render(<PerformanceChart data={[]} />);
    expect(screen.getByText('Henüz yatırım verisi yok')).toBeInTheDocument();
  });

  it('should display current value legend when currentValue exists', () => {
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText(/Mevcut Değer:/)).toBeInTheDocument();
  });

  it('should not display current value legend when currentValue does not exist', () => {
    const dataWithoutCurrentValue: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 1000 },
    ];
    render(<PerformanceChart data={dataWithoutCurrentValue} />);
    expect(screen.queryByText(/Mevcut Değer:/)).not.toBeInTheDocument();
  });
});
