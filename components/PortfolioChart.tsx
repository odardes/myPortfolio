'use client';

import { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { InvestmentSummary } from '@/types/investment';
import { getTypeColor, getTypeLabel } from '@/lib/utils';

interface PortfolioChartProps {
  data: InvestmentSummary[];
}

const COLORS = ['#10B981', '#3B82F6', '#F97316', '#A855F7', '#6B7280'];

function PortfolioChart({ data }: PortfolioChartProps) {
  const chartData = useMemo(() => 
    data.map((item, index) => ({
      name: getTypeLabel(item.type),
      value: item.totalAmount,
      color: COLORS[index % COLORS.length],
    })), [data]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Portföy Dağılımı</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => 
              new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                minimumFractionDigits: 0,
              }).format(value)
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(PortfolioChart);
