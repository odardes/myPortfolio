import {
  formatCurrency,
  formatDate,
  formatPercentage,
  calculateSummary,
  calculatePortfolioStats,
  getTypeColor,
  getTypeBgColor,
  getTypeLabel,
  calculateProfitLoss,
  calculateFundPerformance,
  calculateAllFundPerformance,
  calculateTimeSeriesData,
} from '../utils';
import { Investment, InvestmentType, FundCurrentValue } from '@/types/investment';

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000)).toBe('₺1.000');
    expect(formatCurrency(1234567)).toBe('₺1.234.567');
    expect(formatCurrency(0)).toBe('₺0');
    expect(formatCurrency(123.45)).toBe('₺123');
  });
});

describe('formatDate', () => {
  it('should format date correctly', () => {
    expect(formatDate('2025-01-15')).toBe('15.01.2025');
    expect(formatDate('2024-12-31')).toBe('31.12.2024');
  });

  it('should handle invalid date', () => {
    expect(formatDate('invalid')).toBe('invalid');
  });
});

describe('formatPercentage', () => {
  it('should format positive percentage', () => {
    expect(formatPercentage(10.5)).toBe('+10.50%');
    expect(formatPercentage(0)).toBe('+0.00%');
  });

  it('should format negative percentage', () => {
    expect(formatPercentage(-5.25)).toBe('-5.25%');
  });
});

describe('calculateSummary', () => {
  it('should calculate summary correctly', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
      { id: '2', date: '2025-01-02', type: 'fon', fundName: 'Gümüş Fon', amount: 2000 },
      { id: '3', date: '2025-01-03', type: 'döviz', fundName: 'Dolar', amount: 500 },
    ];

    const summary = calculateSummary(investments);
    expect(summary).toHaveLength(2);
    expect(summary[0].type).toBe('fon');
    expect(summary[0].totalAmount).toBe(3000);
    expect(summary[0].count).toBe(2);
    expect(summary[1].type).toBe('döviz');
    expect(summary[1].totalAmount).toBe(500);
  });

  it('should return empty array for empty investments', () => {
    expect(calculateSummary([])).toEqual([]);
  });

  it('should sort by totalAmount descending', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'döviz', fundName: 'Dolar', amount: 1000 },
      { id: '2', date: '2025-01-02', type: 'fon', fundName: 'Altın Fon', amount: 2000 },
    ];

    const summary = calculateSummary(investments);
    expect(summary[0].type).toBe('fon');
    expect(summary[1].type).toBe('döviz');
  });
});

describe('calculatePortfolioStats', () => {
  it('should calculate portfolio stats correctly', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
      { id: '2', date: '2025-01-02', type: 'fon', fundName: 'Gümüş Fon', amount: 2000 },
      { id: '3', date: '2025-01-03', type: 'döviz', fundName: 'Dolar', amount: 500 },
    ];

    const stats = calculatePortfolioStats(investments);
    expect(stats.totalInvested).toBe(3500);
    expect(stats.byType.fon).toBe(3000);
    expect(stats.byType.döviz).toBe(500);
    expect(stats.byFund['Altın Fon']).toBe(1000);
    expect(stats.byFund['Gümüş Fon']).toBe(2000);
    expect(stats.byFund['Dolar']).toBe(500);
  });

  it('should handle empty investments', () => {
    const stats = calculatePortfolioStats([]);
    expect(stats.totalInvested).toBe(0);
    expect(Object.keys(stats.byType)).toHaveLength(0);
    expect(Object.keys(stats.byFund)).toHaveLength(0);
  });
});

describe('getTypeColor', () => {
  it('should return correct color for each type', () => {
    expect(getTypeColor('fon')).toBe('bg-green-500');
    expect(getTypeColor('döviz')).toBe('bg-blue-500');
    expect(getTypeColor('hisse')).toBe('bg-orange-500');
    expect(getTypeColor('diğer')).toBe('bg-purple-500');
  });

  it('should return default color for invalid type', () => {
    expect(getTypeColor('invalid' as InvestmentType)).toBe('bg-gray-400');
  });
});

describe('getTypeBgColor', () => {
  it('should return correct background color for each type', () => {
    expect(getTypeBgColor('fon')).toBe('bg-green-50 dark:bg-green-900/20');
    expect(getTypeBgColor('döviz')).toBe('bg-blue-50 dark:bg-blue-900/20');
    expect(getTypeBgColor('hisse')).toBe('bg-orange-50 dark:bg-orange-900/20');
    expect(getTypeBgColor('diğer')).toBe('bg-purple-50 dark:bg-purple-900/20');
  });

  it('should return default color for invalid type', () => {
    expect(getTypeBgColor('invalid' as InvestmentType)).toBe('bg-gray-50 dark:bg-gray-800');
  });
});

describe('getTypeLabel', () => {
  it('should return correct label for each type', () => {
    expect(getTypeLabel('fon')).toBe('Fon');
    expect(getTypeLabel('döviz')).toBe('Döviz');
    expect(getTypeLabel('hisse')).toBe('Hisse Senedi');
    expect(getTypeLabel('diğer')).toBe('Diğer');
  });

  it('should return type as string for invalid type', () => {
    expect(getTypeLabel('invalid' as InvestmentType)).toBe('invalid');
  });
});

describe('calculateProfitLoss', () => {
  it('should calculate profit correctly', () => {
    const investment: Investment = {
      id: '1',
      date: '2025-01-01',
      type: 'fon',
      fundName: 'Altın Fon',
      amount: 1000,
      currentValue: 1200,
    };

    const result = calculateProfitLoss(investment);
    expect(result.profitLoss).toBe(200);
    expect(result.profitLossPercentage).toBe(20);
  });

  it('should calculate loss correctly', () => {
    const investment: Investment = {
      id: '1',
      date: '2025-01-01',
      type: 'fon',
      fundName: 'Altın Fon',
      amount: 1000,
      currentValue: 800,
    };

    const result = calculateProfitLoss(investment);
    expect(result.profitLoss).toBe(-200);
    expect(result.profitLossPercentage).toBe(-20);
  });

  it('should return zero when currentValue is missing', () => {
    const investment: Investment = {
      id: '1',
      date: '2025-01-01',
      type: 'fon',
      fundName: 'Altın Fon',
      amount: 1000,
    };

    const result = calculateProfitLoss(investment);
    expect(result.profitLoss).toBe(0);
    expect(result.profitLossPercentage).toBe(0);
  });

  it('should return zero when currentValue is zero', () => {
    const investment: Investment = {
      id: '1',
      date: '2025-01-01',
      type: 'fon',
      fundName: 'Altın Fon',
      amount: 1000,
      currentValue: 0,
    };

    const result = calculateProfitLoss(investment);
    expect(result.profitLoss).toBe(0);
    expect(result.profitLossPercentage).toBe(0);
  });

  it('should handle zero amount', () => {
    const investment: Investment = {
      id: '1',
      date: '2025-01-01',
      type: 'fon',
      fundName: 'Altın Fon',
      amount: 0,
      currentValue: 100,
    };

    const result = calculateProfitLoss(investment);
    expect(result.profitLoss).toBe(100);
    expect(result.profitLossPercentage).toBe(0);
  });
});

describe('calculateFundPerformance', () => {
  const investments: Investment[] = [
    { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    { id: '2', date: '2025-01-02', type: 'fon', fundName: 'Altın Fon', amount: 2000 },
  ];

  const fundCurrentValues: FundCurrentValue[] = [
    { fundName: 'Altın Fon', type: 'fon', currentValue: 3500, lastUpdated: '2025-01-03' },
  ];

  it('should calculate fund performance correctly', () => {
    const result = calculateFundPerformance('Altın Fon', 'fon', investments, fundCurrentValues);
    expect(result.fundName).toBe('Altın Fon');
    expect(result.type).toBe('fon');
    expect(result.totalInvested).toBe(3000);
    expect(result.currentValue).toBe(3500);
    expect(result.profitLoss).toBe(500);
    expect(result.profitLossPercentage).toBeCloseTo(16.67, 2);
    expect(result.investmentCount).toBe(2);
  });

  it('should handle missing fund current value', () => {
    const result = calculateFundPerformance('Altın Fon', 'fon', investments, []);
    expect(result.currentValue).toBe(0);
    expect(result.profitLoss).toBe(-3000);
    expect(result.profitLossPercentage).toBe(-100);
  });

  it('should handle zero total invested', () => {
    const result = calculateFundPerformance('Altın Fon', 'fon', [], fundCurrentValues);
    expect(result.totalInvested).toBe(0);
    expect(result.profitLossPercentage).toBe(0);
  });
});

describe('calculateAllFundPerformance', () => {
  it('should calculate performance for all funds', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
      { id: '2', date: '2025-01-02', type: 'döviz', fundName: 'Dolar', amount: 500 },
    ];

    const fundCurrentValues: FundCurrentValue[] = [
      { fundName: 'Altın Fon', type: 'fon', currentValue: 1200, lastUpdated: '2025-01-03' },
      { fundName: 'Dolar', type: 'döviz', currentValue: 600, lastUpdated: '2025-01-03' },
    ];

    const result = calculateAllFundPerformance(investments, fundCurrentValues);
    expect(result).toHaveLength(2);
    expect(result[0].fundName).toBe('Altın Fon');
    expect(result[1].fundName).toBe('Dolar');
  });

  it('should handle empty investments', () => {
    const result = calculateAllFundPerformance([], []);
    expect(result).toEqual([]);
  });
});

describe('calculateTimeSeriesData', () => {
  it('should calculate time series data correctly', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
      { id: '2', date: '2025-01-02', type: 'fon', fundName: 'Altın Fon', amount: 2000 },
      { id: '3', date: '2025-01-03', type: 'fon', fundName: 'Altın Fon', amount: 500 },
    ];

    const result = calculateTimeSeriesData(investments, []);
    expect(result).toHaveLength(3);
    expect(result[0].cumulativeInvested).toBe(1000);
    expect(result[1].cumulativeInvested).toBe(3000);
    expect(result[2].cumulativeInvested).toBe(3500);
  });

  it('should add current value to last point when available', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000, currentValue: 1200 },
      { id: '2', date: '2025-01-02', type: 'fon', fundName: 'Altın Fon', amount: 2000, currentValue: 2400 },
    ];

    const result = calculateTimeSeriesData(investments, []);
    expect(result[result.length - 1].currentValue).toBe(3600);
    expect(result[result.length - 1].profitLoss).toBe(600);
  });

  it('should use fundCurrentValues when available', () => {
    const investments: Investment[] = [
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
    ];

    const fundCurrentValues: FundCurrentValue[] = [
      { fundName: 'Altın Fon', type: 'fon', currentValue: 1200, lastUpdated: '2025-01-02' },
    ];

    const result = calculateTimeSeriesData(investments, fundCurrentValues);
    expect(result[result.length - 1].currentValue).toBe(1200);
    expect(result[result.length - 1].profitLoss).toBe(200);
  });

  it('should handle empty investments', () => {
    const result = calculateTimeSeriesData([], []);
    expect(result).toEqual([]);
  });

  it('should sort investments by date', () => {
    const investments: Investment[] = [
      { id: '3', date: '2025-01-03', type: 'fon', fundName: 'Altın Fon', amount: 500 },
      { id: '1', date: '2025-01-01', type: 'fon', fundName: 'Altın Fon', amount: 1000 },
      { id: '2', date: '2025-01-02', type: 'fon', fundName: 'Altın Fon', amount: 2000 },
    ];

    const result = calculateTimeSeriesData(investments, []);
    expect(result[0].date).toBe('2025-01-01');
    expect(result[1].date).toBe('2025-01-02');
    expect(result[2].date).toBe('2025-01-03');
  });
});
