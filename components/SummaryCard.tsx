'use client';

import { formatCurrency } from '@/lib/utils';
import { InvestmentType } from '@/types/investment';
import { getTypeColor, getTypeLabel } from '@/lib/utils';

interface SummaryCardProps {
  type: InvestmentType;
  totalAmount: number;
  count: number;
  percentage: number;
}

export default function SummaryCard({ type, totalAmount, count, percentage }: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${getTypeColor(type)}`} />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{getTypeLabel(type)}</h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{count} yatırım</span>
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalAmount)}</p>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getTypeColor(type)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">%{percentage.toFixed(1)}</p>
    </div>
  );
}
