export type InvestmentType = 'fon' | 'döviz' | 'hisse' | 'diğer';

export interface Investment {
  id: string;
  date: string; // YYYY-MM-DD format
  type: InvestmentType;
  fundName: string;
  amount: number;
  price?: number; // Birim fiyat (opsiyonel)
  currency?: string; // USD, TRY, ALT vb.
  notes?: string;
  currentValue?: number; // Mevcut değer (kar/zarar için)
  profitLoss?: number; // Kar/Zarar (otomatik hesaplanır)
  profitLossPercentage?: number; // Yüzdelik getiri (otomatik hesaplanır)
}

export interface InvestmentSummary {
  type: InvestmentType;
  totalAmount: number;
  count: number;
  investments: Investment[];
}

export interface PortfolioStats {
  totalInvested: number;
  byType: Record<InvestmentType, number>;
  byFund: Record<string, number>;
}

// Fon bazında mevcut değer
export interface FundCurrentValue {
  fundName: string;
  type: InvestmentType;
  currentValue: number;
  lastUpdated: string; // ISO date string
}

// Fon bazında performans
export interface FundPerformance {
  fundName: string;
  type: InvestmentType;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  investmentCount: number;
}
