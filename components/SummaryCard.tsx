'use client';

import { memo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { InvestmentType } from '@/types/investment';
import { getTypeColor, getTypeLabel } from '@/lib/utils';

interface SummaryCardProps {
  type: InvestmentType;
  totalAmount: number;
  count: number;
  percentage: number;
}

function SummaryCard({ type, totalAmount, count, percentage }: SummaryCardProps) {
  const typeLabel = getTypeLabel(type);
  
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow" aria-labelledby={`summary-${type}-title`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className={`w-4 h-4 rounded-full ${getTypeColor(type)}`}
            role="img"
            aria-label={`${typeLabel} kategorisi rengi`}
          />
          <h3 id={`summary-${type}-title`} className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {typeLabel}
          </h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400" aria-label={`${count} yatırım`}>
          {count} yatırım
        </span>
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100" aria-label={`Toplam tutar: ${formatCurrency(totalAmount)}`}>
          {formatCurrency(totalAmount)}
        </p>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${typeLabel} yüzdesi: %${percentage.toFixed(1)}`}>
        <div
          className={`h-2 rounded-full ${getTypeColor(type)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2" aria-label={`Yüzde: %${percentage.toFixed(1)}`}>
        %{percentage.toFixed(1)}
      </p>
    </article>
  );
}

export default memo(SummaryCard);
