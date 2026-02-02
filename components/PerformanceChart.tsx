'use client';

import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimeSeriesDataPoint } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface PerformanceChartProps {
  data: TimeSeriesDataPoint[];
}

function PerformanceChart({ data }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Zaman Bazında Performans</h3>
        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
          <p>Henüz yatırım verisi yok</p>
        </div>
      </div>
    );
  }

  // Güncel değeri sadece son noktada göster (görseldeki gibi)
  const chartData = data.map((d, index) => ({
    ...d,
    currentValue: index === data.length - 1 && d.currentValue ? d.currentValue : undefined
  }));

  // Tarih formatını kısalt (ay.gün formatında)
  const formatChartDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}.${month}`;
    } catch {
      return dateString;
    }
  };

  // Y ekseni için format
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Zaman Bazında Performans</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatChartDate}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'cumulativeInvested') {
                return [formatCurrency(value), 'Toplam Yatırım'];
              } else if (name === 'currentValue') {
                return [formatCurrency(value), 'Mevcut Değer'];
              }
              return [formatCurrency(value), name];
            }}
            labelFormatter={(label) => `Tarih: ${label}`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px',
            }}
            filterNull={true}
          />
          <Legend 
            formatter={(value) => {
              if (value === 'cumulativeInvested') return 'Toplam Yatırım';
              if (value === 'currentValue') return 'Mevcut Değer';
              return value;
            }}
          />
          <Line
            type="monotone"
            dataKey="cumulativeInvested"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="cumulativeInvested"
          />
          {chartData.some(d => d.currentValue !== undefined && d.currentValue > 0) && (
            <Line
              type="monotone"
              dataKey="currentValue"
              stroke="transparent"
              strokeWidth={0}
              dot={(props: any) => {
                // Sadece son noktada yeşil dot göster (görseldeki gibi)
                if (props.payload?.currentValue !== undefined && props.payload.currentValue > 0) {
                  return <circle cx={props.cx} cy={props.cy} r={5} fill="#10b981" />;
                }
                return <circle cx={props.cx} cy={props.cy} r={0} fill="transparent" />;
              }}
              activeDot={{ r: 7, fill: '#10b981' }}
              name="currentValue"
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
          Toplam Yatırım: Zaman içinde yatırdığınız toplam tutar
        </p>
        {data.some(d => d.currentValue !== undefined) && (
          <p className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
            Mevcut Değer: Portföyünüzün güncel değeri (fon değerleri girildiyse)
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(PerformanceChart);
