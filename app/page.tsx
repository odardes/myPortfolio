'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Investment } from '@/types/investment';
import { DELAYS, STORAGE_KEYS } from '@/lib/constants';
import { getInvestmentsSync, saveInvestmentsSync, getInvestments, saveInvestments } from '@/lib/storage';
import { subscribeToInvestments } from '@/lib/cloudStorage';
import { calculateSummary, calculatePortfolioStats, formatCurrency, formatPercentage, calculateTimeSeriesData } from '@/lib/utils';
import SummaryCard from '@/components/SummaryCard';
import InvestmentList from '@/components/InvestmentList';
import ThemeToggle from '@/components/ThemeToggle';
import SkeletonLoader from '@/components/SkeletonLoader';

// Lazy load heavy components
const PortfolioChart = dynamic(() => import('@/components/PortfolioChart'), {
  loading: () => <SkeletonLoader type="chart" />,
});

const PerformanceChart = dynamic(() => import('@/components/PerformanceChart'), {
  loading: () => <SkeletonLoader type="chart" />,
});

const InvestmentForm = dynamic(() => import('@/components/InvestmentForm'), {
  loading: () => <SkeletonLoader type="form" />,
});

export default function Home() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { getInvestments } = await import('@/lib/storage');
        const loaded = await getInvestments();
        setInvestments(loaded);
      } catch {
        const loaded = getInvestmentsSync();
        setInvestments(loaded);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // Real-time sync için Firebase listener ekle
    const unsubscribe = subscribeToInvestments((cloudInvestments) => {
      if (cloudInvestments && cloudInvestments.length > 0) {
        // Firebase'den gelen veriyi kullan ve localStorage'a kaydet
        setInvestments(cloudInvestments);
        try {
          localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(cloudInvestments));
        } catch (error) {
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

  const handleUpdate = useCallback(async () => {
    try {
      const updated = await getInvestments();
      setInvestments(updated);
    } catch {
      const updated = getInvestmentsSync();
      setInvestments(updated);
    }
  }, []);

  const handleSaveInvestment = useCallback(async (investment: Investment) => {
    // Calculate updated investments array
    const updated = investments.some(inv => inv.id === investment.id)
      ? investments.map(inv => inv.id === investment.id ? investment : inv)
      : [...investments, investment];
    
    // Update state first for immediate UI feedback
    setInvestments(updated);
    
    // Add minimum delay to ensure spinner is visible BEFORE closing form (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Close form after delay so spinner is visible
    setShowAddForm(false);
    
    // Then save async (non-blocking)
    try {
      await saveInvestments(updated);
    } catch {
      saveInvestmentsSync(updated);
    }
  }, [investments]);

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
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Ana içeriğe geç
      </a>
      
      {/* Screen reader announcements */}
      <div id="announcements" aria-live="polite" aria-atomic="true" className="sr-only"></div>
      
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yatırım Portföyüm</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Yatırımlarınızı takip edin ve analiz edin</p>
            </div>
            <nav className="flex items-center gap-3" aria-label="Ana navigasyon">
              <ThemeToggle />
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={showAddForm ? 'Yatırım ekleme formunu kapat' : 'Yeni yatırım ekleme formunu aç'}
                aria-expanded={showAddForm}
              >
                <Plus size={20} aria-hidden="true" />
                Yeni Yatırım Ekle
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Total Summary Cards */}
        <section aria-label="Portföy özeti" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white" role="region" aria-label="Toplam yatırım bilgileri">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Toplam Yatırım</p>
                <p className="text-4xl font-bold" aria-label={`Toplam yatırım: ${formatCurrency(stats.totalInvested)}`}>
                  {formatCurrency(stats.totalInvested)}
                </p>
                <p className="text-blue-100 text-sm mt-2" aria-label={`${investments.length} yatırım, ${summary.length} farklı kategori`}>
                  {investments.length} yatırım • {summary.length} farklı kategori
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-4" aria-hidden="true">
                <TrendingUp size={32} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6" role="region" aria-label="Toplam kar/zarar bilgileri">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Toplam Kar/Zarar</p>
                {hasProfitLoss ? (
                  <>
                    <p 
                      className={`text-4xl font-bold ${
                        totalProfitLoss >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}
                      aria-label={`${totalProfitLoss >= 0 ? 'Kar' : 'Zarar'}: ${formatCurrency(totalProfitLoss)}`}
                    >
                      {formatCurrency(totalProfitLoss)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2" aria-label={`Güncel değer: ${formatCurrency(totalCurrentValue)}, yüzde: ${formatPercentage(totalProfitLossPercentage)}`}>
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
              <div 
                className={`rounded-full p-4 ${
                  hasProfitLoss 
                    ? totalProfitLoss >= 0 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
                aria-hidden="true"
              >
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
        </section>

        {/* Add Investment Form */}
        {showAddForm && (
          <div className="mb-8">
            <InvestmentForm
              onSave={handleSaveInvestment}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
            </div>
            <SkeletonLoader type="chart" />
            <SkeletonLoader type="list" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <section aria-label="Yatırım kategorileri özeti" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            </section>

            {/* Performance Chart */}
            <div className="mb-8">
              <PerformanceChart data={timeSeriesData} />
            </div>
          </>
        )}

        {/* Charts and List */}
        <section aria-label="Grafikler ve dağılımlar" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PortfolioChart data={summary} />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" role="region" aria-labelledby="fund-distribution-heading">
            <h3 id="fund-distribution-heading" className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Fon Bazında Dağılım
            </h3>
            <div className="space-y-3" role="list" aria-label="Fon dağılım listesi">
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
                      <div key={fund} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg" role="listitem" aria-label={`${fund} fonu, tutar: ${formatCurrency(amount)}, yüzde: %${percentage}${hasFundProfitLoss ? `, ${fundProfitLoss >= 0 ? 'kar' : 'zarar'}: ${formatCurrency(fundProfitLoss)}` : ''}`}>
                        <div className="flex-1">
                          <span className="font-medium text-gray-800 dark:text-white block">{fund}</span>
                          {hasFundProfitLoss && (
                            <span 
                              className={`text-xs font-medium mt-1 ${
                                fundProfitLoss >= 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                              aria-label={`${fundProfitLoss >= 0 ? 'Kar' : 'Zarar'}: ${formatCurrency(fundProfitLoss)}, yüzde: ${formatPercentage(fundProfitLossPercentage)}`}
                            >
                              {fundProfitLoss >= 0 ? '+' : ''}{formatCurrency(fundProfitLoss)} ({formatPercentage(fundProfitLossPercentage)})
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900 dark:text-white block" aria-label={`Toplam tutar: ${formatCurrency(amount)}`}>
                            {formatCurrency(amount)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400" aria-label={`Yüzde: %${percentage}`}>
                            (%{percentage})
                          </span>
                          {hasFundProfitLoss && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1" aria-label={`Güncel değer: ${formatCurrency(fundCurrentValue)}`}>
                              Güncel: {formatCurrency(fundCurrentValue)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }), [investments, stats.byFund, stats.totalInvested])}
            </div>
          </div>
        </section>

        {/* Performance Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8" aria-labelledby="performance-heading">
          <h3 id="performance-heading" className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Performans
          </h3>
          {hasProfitLoss ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="group" aria-label="Performans metrikleri">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4" role="region" aria-label="Toplam yatırım">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Yatırım</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" aria-label={`Toplam yatırım: ${formatCurrency(stats.totalInvested)}`}>
                  {formatCurrency(stats.totalInvested)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4" role="region" aria-label="Güncel değer">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Güncel Değer</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" aria-label={`Güncel değer: ${formatCurrency(totalCurrentValue)}`}>
                  {formatCurrency(totalCurrentValue)}
                </p>
              </div>
              <div className={`rounded-lg p-4 ${
                totalProfitLoss >= 0 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
              role="region"
              aria-label={`${totalProfitLoss >= 0 ? 'Kar' : 'Zarar'}`}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kar/Zarar</p>
                <p className={`text-2xl font-bold ${
                  totalProfitLoss >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}
                aria-label={`${totalProfitLoss >= 0 ? 'Kar' : 'Zarar'}: ${formatCurrency(totalProfitLoss)}`}
                >
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
            <div className="text-center py-8 text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
              <p className="text-lg mb-2">Mevcut değer girilen yatırım yok</p>
              <p className="text-sm">Yatırımlarınıza mevcut değer ekleyin</p>
            </div>
          )}
        </section>

        {/* Investment List */}
        {!isLoading && <InvestmentList investments={investments} onUpdate={handleUpdate} />}
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
