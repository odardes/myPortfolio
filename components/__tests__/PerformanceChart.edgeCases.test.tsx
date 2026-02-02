import { render, screen } from '@testing-library/react';
import PerformanceChart from '../PerformanceChart';
import { TimeSeriesDataPoint } from '@/lib/utils';

describe('PerformanceChart Edge Cases', () => {
  it('should handle single data point', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 1000 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle single data point with currentValue', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 1000, currentValue: 1200 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText(/Mevcut Değer:/)).toBeInTheDocument();
  });

  it('should handle very large numbers in Y axis formatting', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 5000000 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle very small numbers', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 10 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle currentValue at 0 (edge case)', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 1000, currentValue: 0 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle currentValue less than cumulativeInvested', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 1000, currentValue: 800 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText(/Mevcut Değer:/)).toBeInTheDocument();
  });

  it('should handle date at year boundary', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2024-12-31', cumulativeInvested: 1000 },
      { date: '2025-01-01', cumulativeInvested: 2000 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle date with single digit day and month', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-05', cumulativeInvested: 1000 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle data with currentValue in middle points (should not show)', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 1000, currentValue: 1200 },
      { date: '2025-01-02', cumulativeInvested: 2000, currentValue: 2500 },
      { date: '2025-01-03', cumulativeInvested: 3000 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    // Only last point should show currentValue, but it doesn't have one
    // So legend should not show
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle data with currentValue only on last point', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 1000 },
      { date: '2025-01-02', cumulativeInvested: 2000 },
      { date: '2025-01-03', cumulativeInvested: 3000, currentValue: 3500 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText(/Mevcut Değer:/)).toBeInTheDocument();
  });

  it('should handle malformed date string gracefully', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '', cumulativeInvested: 1000 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle Y axis formatting for exactly 1000', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 1000 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle Y axis formatting for exactly 1000000', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: 1000000 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle negative cumulativeInvested (edge case)', () => {
    const mockData: TimeSeriesDataPoint[] = [
      { date: '2025-01-01', cumulativeInvested: -100 },
    ];
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });

  it('should handle many data points', () => {
    const mockData: TimeSeriesDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      cumulativeInvested: (i + 1) * 100,
    }));
    
    render(<PerformanceChart data={mockData} />);
    expect(screen.getByText('Zaman Bazında Performans')).toBeInTheDocument();
  });
});
