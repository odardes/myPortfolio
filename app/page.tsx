'use client';

import { useState, useEffect, useMemo } from 'react';
import { Investment } from '@/types/investment';
import { getInvestmentsSync, saveInvestmentsSync, getInvestments, saveInvestments } from '@/lib/storage';
import { subscribeToInvestments } from '@/lib/cloudStorage';
import { calculateSummary, calculatePortfolioStats, formatCurrency, formatPercentage, calculateTimeSeriesData } from '@/lib/utils';
import SummaryCard from '@/components/SummaryCard';
import PortfolioChart from '@/components/PortfolioChart';
import PerformanceChart from '@/components/PerformanceChart';
import InvestmentList from '@/components/InvestmentList';
import InvestmentForm from '@/components/InvestmentForm';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { getInvestments } = await import('@/lib/storage');
        const loaded = await getInvestments();
        setInvestments(loaded);
      } catch {
        const loaded = getInvestmentsSync();
        setInvestments(loaded);
      }
    };
    loadData();

    // Real-time sync için Firebase listener ekle
    const unsubscribe = subscribeToInvestments((cloudInvestments) => {
      if (cloudInvestments && cloudInvestments.length > 0) {
        // Firebase'den gelen veriyi kullan ve localStorage'a kaydet
        setInvestments(cloudInvestments);
        try {
          localStorage.setItem('portfolio-investments', JSON.stringify(cloudInvestments));
        } catch (error) {
          console.warn('Failed to save to localStorage:', error);
        }
      }
    });

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleUpdate = async () => {
    try {
      const updated = await getInvestments();
      setInvestments(updated);
    } catch {
      const updated = getInvestmentsSync();
      setInvestments(updated);
    }
  };

  const handleSaveInvestment = async (investment: Investment) => {
    const isExisting = investments.some(inv => inv.id === investment.id);
    const updated = isExisting
      ? investments.map(inv => inv.id === investment.id ? investment : inv)
      : [...investments, investment];
    
    try {
      await saveInvestments(updated);
    } catch {
      saveInvestmentsSync(updated);
    }
    setInvestments(updated);
    setShowAddForm(false);
  };

  // Memoized calculations
  const summary = useMemo(() => calculateSummary(investments), [investments]);
  const stats = useMemo(() => calculatePortfolioStats(investments), [investments]);
  const timeSeriesData = useMemo(() => calculateTimeSeriesData(investments, []), [investments]);

  const { totalCurrentValue, totalProfitLoss, totalProfitLossPercentage, hasProfitLoss } = useMemo(() => {
    const currentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const profitLoss = currentValue - stats.totalInvested;
    const profitLossPercentage = stats.totalInvested > 0 ? (profitLoss / stats.totalInvested) * 100 : 0;
    
    return {
      totalCurrentValue: currentValue,
      totalProfitLoss: profitLoss,
      totalProfitLossPercentage: profitLossPercentage,
      hasProfitLoss: currentValue > 0
    };
  }, [investments, stats.totalInvested]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yatırım Portföyüm</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Yatırımlarınızı takip edin ve analiz edin</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                <Plus size={20} />
                Yeni Yatırım Ekle
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Total Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Toplam Yatırım</p>
                <p className="text-4xl font-bold">{formatCurrency(stats.totalInvested)}</p>
                <p className="text-blue-100 text-sm mt-2">
                  {investments.length} yatırım • {summary.length} farklı kategori
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-4">
                <TrendingUp size={32} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Toplam Kar/Zarar</p>
                {hasProfitLoss ? (
                  <>
                    <p className={`text-4xl font-bold ${
                      totalProfitLoss >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(totalProfitLoss)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                      Güncel Değer: {formatCurrency(totalCurrentValue)} • {formatPercentage(totalProfitLossPercentage)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">Mevcut değer girilmemiş</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      Yatırımlarınıza mevcut değer ekleyerek kar/zarar takibi yapabilirsiniz
                    </p>
                  </>
                )}
              </div>
              <div className={`rounded-full p-4 ${
                hasProfitLoss 
                  ? totalProfitLoss >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {hasProfitLoss ? (
                  totalProfitLoss >= 0 ? (
                    <TrendingUp size={32} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown size={32} className="text-red-600 dark:text-red-400" />
                  )
                ) : (
                  <TrendingUp size={32} className="text-gray-400 dark:text-gray-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Investment Form */}
        {showAddForm && (
          <div className="mb-8">
            <InvestmentForm
              onSave={handleSaveInvestment}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summary.map((item) => (
            <SummaryCard
              key={item.type}
              type={item.type}
              totalAmount={item.totalAmount}
              count={item.count}
              percentage={
                stats.totalInvested > 0
                  ? (item.totalAmount / stats.totalInvested) * 100
                  : 0
              }
            />
          ))}
        </div>

        {/* Performance Chart */}
        <div className="mb-8">
          <PerformanceChart data={timeSeriesData} />
        </div>

        {/* Charts and List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PortfolioChart data={summary} />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Fon Bazında Dağılım</h3>
            <div className="space-y-3">
              {useMemo(() => 
                Object.entries(stats.byFund)
                  .sort(([, a], [, b]) => b - a)
                  .map(([fund, amount]) => {
                    const fundInvestments = investments.filter(inv => inv.fundName === fund);
                    const fundCurrentValue = fundInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
                    const fundProfitLoss = fundCurrentValue - amount;
                    const fundProfitLossPercentage = amount > 0 ? (fundProfitLoss / amount) * 100 : 0;
                    const hasFundProfitLoss = fundCurrentValue > 0;
                    const percentage = stats.totalInvested > 0 ? ((amount / stats.totalInvested) * 100).toFixed(1) : '0';
                    
                    return (
                      <div key={fund} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium text-gray-800 dark:text-white block">{fund}</span>
                          {hasFundProfitLoss && (
                            <span className={`text-xs font-medium mt-1 ${
                              fundProfitLoss >= 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {fundProfitLoss >= 0 ? '+' : ''}{formatCurrency(fundProfitLoss)} ({formatPercentage(fundProfitLossPercentage)})
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900 dark:text-white block">
                            {formatCurrency(amount)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            (%{percentage})
                          </span>
                          {hasFundProfitLoss && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                              Güncel: {formatCurrency(fundCurrentValue)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }), [investments, stats.byFund, stats.totalInvested])
              }
            </div>
          </div>
        </div>

        {/* Performance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Performans</h3>
          {hasProfitLoss ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Yatırım</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalInvested)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Güncel Değer</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCurrentValue)}</p>
              </div>
              <div className={`rounded-lg p-4 ${
                totalProfitLoss >= 0 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kar/Zarar</p>
                <p className={`text-2xl font-bold ${
                  totalProfitLoss >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
                </p>
                <p className={`text-sm mt-1 ${
                  totalProfitLoss >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercentage(totalProfitLossPercentage)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">Mevcut değer girilen yatırım yok</p>
              <p className="text-sm">Yatırımlarınıza mevcut değer ekleyin</p>
            </div>
          )}
        </div>

        {/* Investment List */}
        <InvestmentList investments={investments} onUpdate={handleUpdate} />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2026 Yatırım Portföyüm • Tüm hakları saklıdır
          </p>
        </div>
      </footer>
    </div>
  );
}
