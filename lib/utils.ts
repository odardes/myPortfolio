import { Investment, InvestmentSummary, PortfolioStats, InvestmentType, FundCurrentValue, FundPerformance } from '@/types/investment';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'dd.MM.yyyy', { locale: tr });
  } catch {
    return dateString;
  }
}

export function calculateSummary(investments: Investment[]): InvestmentSummary[] {
  const summaryMap = new Map<Investment['type'], InvestmentSummary>();

  investments.forEach((investment) => {
    const existing = summaryMap.get(investment.type) || {
      type: investment.type,
      totalAmount: 0,
      count: 0,
      investments: [],
    };

    existing.totalAmount += investment.amount;
    existing.count += 1;
    existing.investments.push(investment);

    summaryMap.set(investment.type, existing);
  });

  return Array.from(summaryMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

export function calculatePortfolioStats(investments: Investment[]): PortfolioStats {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  
  const byType: Record<string, number> = {};
  const byFund: Record<string, number> = {};

  investments.forEach((investment) => {
    byType[investment.type] = (byType[investment.type] || 0) + investment.amount;
    byFund[investment.fundName] = (byFund[investment.fundName] || 0) + investment.amount;
  });

  return {
    totalInvested,
    byType: byType as PortfolioStats['byType'],
    byFund,
  };
}

export function getTypeColor(type: InvestmentType): string {
  const colors: Record<InvestmentType, string> = {
    fon: 'bg-green-500',
    döviz: 'bg-blue-500',
    hisse: 'bg-orange-500',
    diğer: 'bg-purple-500',
  };
  return colors[type] || 'bg-gray-400';
}

export function getTypeBgColor(type: InvestmentType): string {
  const bgColors: Record<InvestmentType, string> = {
    fon: 'bg-green-50 dark:bg-green-900/20',
    döviz: 'bg-blue-50 dark:bg-blue-900/20',
    hisse: 'bg-orange-50 dark:bg-orange-900/20',
    diğer: 'bg-purple-50 dark:bg-purple-900/20',
  };
  return bgColors[type] || 'bg-gray-50 dark:bg-gray-800';
}

export function getTypeLabel(type: InvestmentType): string {
  const labels: Record<InvestmentType, string> = {
    fon: 'Fon',
    döviz: 'Döviz',
    hisse: 'Hisse Senedi',
    diğer: 'Diğer',
  };
  return labels[type] || type;
}

// Format percentage
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// Kar/Zarar hesaplama
export function calculateProfitLoss(investment: Investment): {
  profitLoss: number;
  profitLossPercentage: number;
} {
  if (!investment.currentValue || investment.currentValue === 0) {
    return { profitLoss: 0, profitLossPercentage: 0 };
  }
  
  const profitLoss = investment.currentValue - investment.amount;
  const profitLossPercentage = investment.amount > 0 
    ? (profitLoss / investment.amount) * 100 
    : 0;
  
  return { profitLoss, profitLossPercentage };
}

// Fon bazında performans hesaplama
export function calculateFundPerformance(
  fundName: string,
  type: InvestmentType,
  investments: Investment[],
  fundCurrentValues: FundCurrentValue[]
): FundPerformance {
  const fundInvestments = investments.filter(
    inv => inv.fundName === fundName && inv.type === type
  );
  
  const totalInvested = fundInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  
  // Fon için mevcut değer bul
  const fundValue = fundCurrentValues.find(
    fv => fv.fundName === fundName && fv.type === type
  );
  
  const currentValue = fundValue?.currentValue || 0;
  const profitLoss = currentValue - totalInvested;
  const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
  
  return {
    fundName,
    type,
    totalInvested,
    currentValue,
    profitLoss,
    profitLossPercentage,
    investmentCount: fundInvestments.length,
  };
}

// Tüm fonlar için performans hesapla
export function calculateAllFundPerformance(
  investments: Investment[],
  fundCurrentValues: FundCurrentValue[]
): FundPerformance[] {
  const fundMap = new Map<string, { type: InvestmentType; fundName: string }>();
  
  investments.forEach(inv => {
    const key = `${inv.type}-${inv.fundName}`;
    if (!fundMap.has(key)) {
      fundMap.set(key, { type: inv.type, fundName: inv.fundName });
    }
  });
  
  return Array.from(fundMap.values()).map(({ type, fundName }) =>
    calculateFundPerformance(fundName, type, investments, fundCurrentValues)
  );
}

// Zaman serisi verisi hesaplama
export interface TimeSeriesDataPoint {
  date: string;
  cumulativeInvested: number;
  currentValue?: number;
  profitLoss?: number;
}

export function calculateTimeSeriesData(
  investments: Investment[],
  fundCurrentValues: FundCurrentValue[]
): TimeSeriesDataPoint[] {
  // Tarihe göre sırala
  const sortedInvestments = [...investments].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const result: TimeSeriesDataPoint[] = [];
  let cumulativeInvested = 0;
  
  // Her yatırım için kümülatif tutarı hesapla
  sortedInvestments.forEach(inv => {
    cumulativeInvested += inv.amount;
    result.push({
      date: inv.date,
      cumulativeInvested,
    });
  });
  
  // Toplam güncel değeri hesapla (yatırımlardan direkt veya fundCurrentValues'tan)
  let totalCurrentValue = 0;
  
  if (fundCurrentValues.length > 0) {
    // FundCurrentValues varsa onu kullan
    totalCurrentValue = calculateAllFundPerformance(investments, fundCurrentValues)
      .reduce((sum, fp) => sum + fp.currentValue, 0);
  } else {
    // Yatırımlardan direkt currentValue'ları topla
    totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  }
  
  // Son noktaya mevcut değer ekle
  if (totalCurrentValue > 0 && result.length > 0) {
    const lastPoint = result[result.length - 1];
    lastPoint.currentValue = totalCurrentValue;
    lastPoint.profitLoss = totalCurrentValue - lastPoint.cumulativeInvested;
  }
  
  return result;
}

/**
 * Format investment amount based on type
 * For altın (gold): shows grams if price exists
 * For döviz (currency): shows currency amount if price exists
 * For others: shows TRY amount
 */
export function formatInvestmentAmount(investment: Investment): {
  primary: string; // Main display (gram/USD)
  secondary?: string; // Secondary display (TL value)
} {
  // For döviz with price: show currency amount + TL value
  if (investment.type === 'döviz' && investment.price && investment.price > 0) {
    const currencyCode = investment.currency || 'TRY';
    const amountInCurrency = investment.amount / investment.price;
    
    // Check if it's gold (altın)
    const isGold = investment.fundName.toLowerCase().includes('altın') || 
                   investment.fundName.toLowerCase().includes('gold');
    
    if (isGold) {
      return {
        primary: `${formatNumber(amountInCurrency)} gram`,
        secondary: formatCurrency(investment.amount),
      };
    }
    
    // Regular currency
    return {
      primary: `${formatNumber(amountInCurrency)} ${currencyCode}`,
      secondary: formatCurrency(investment.amount),
    };
  }
  
  // Default: show TRY amount
  return {
    primary: formatCurrency(investment.amount),
  };
}

/**
 * Format fund total amount (for fund headers)
 * Calculates total quantity in currency/gram units and shows both quantity and TRY value
 */
export function formatFundTotal(
  investments: Investment[],
  fundName: string,
  type: InvestmentType
): {
  primary: string; // Main display (gram/USD + TRY)
  secondary?: string; // Secondary display (profit/loss)
} {
  if (type === 'döviz') {
    // Check if it's gold
    const isGold = fundName.toLowerCase().includes('altın') || 
                   fundName.toLowerCase().includes('gold');
    
    // Calculate total quantity and total TRY value
    let totalQuantity = 0;
    let totalTRY = 0;
    let hasValidPrice = false;
    
    investments.forEach(inv => {
      if (inv.price && inv.price > 0) {
        totalQuantity += inv.amount / inv.price;
        hasValidPrice = true;
      }
      totalTRY += inv.amount;
    });
    
    if (hasValidPrice && totalQuantity > 0) {
      if (isGold) {
        return {
          primary: `${formatNumber(totalQuantity)} gram • ${formatCurrency(totalTRY)}`,
        };
      } else {
        // Get currency code from first investment
        const currencyCode = investments[0]?.currency || 'USD';
        return {
          primary: `${formatNumber(totalQuantity)} ${currencyCode} • ${formatCurrency(totalTRY)}`,
        };
      }
    }
  }
  
  // Default: show only TRY
  const totalTRY = investments.reduce((sum, inv) => sum + inv.amount, 0);
  return {
    primary: formatCurrency(totalTRY),
  };
}

/**
 * Format number with proper decimal places
 */
function formatNumber(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  }
  return value.toLocaleString('tr-TR', { maximumFractionDigits: 4 });
}
