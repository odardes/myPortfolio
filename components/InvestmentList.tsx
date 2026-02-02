'use client';

import { Investment, InvestmentType } from '@/types/investment';
import { formatCurrency, formatDate, getTypeColor, getTypeLabel, calculateProfitLoss, formatPercentage } from '@/lib/utils';
import { Trash2, Edit, ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign, Search, Filter, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import InvestmentForm from './InvestmentForm';
import { saveInvestmentsSync, saveInvestments } from '@/lib/storage';

interface InvestmentListProps {
  investments: Investment[];
  onUpdate: () => void;
}

interface GroupedInvestments {
  [key: string]: {
    [fundName: string]: Investment[];
  };
}

export default function InvestmentList({ investments, onUpdate }: InvestmentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<InvestmentType>>(
    new Set(['fon', 'döviz', 'diğer'] as InvestmentType[])
  );
  const [expandedFunds, setExpandedFunds] = useState<Set<string>>(new Set());
  const [editingCurrentValue, setEditingCurrentValue] = useState<{fundName: string; type: InvestmentType} | null>(null);
  const [currentValueInput, setCurrentValueInput] = useState<string>('');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<InvestmentType | 'all'>('all');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const handleDelete = (id: string) => {
    const updated = investments.filter(inv => inv.id !== id);
    saveInvestmentsSync(updated);
    onUpdate();
    setDeleteConfirm(null);
  };

  const handleSave = (investment: Investment) => {
    const updated = investments.map(inv => 
      inv.id === investment.id ? investment : inv
    );
    saveInvestmentsSync(updated);
    onUpdate();
    setEditingId(null);
  };

  const handleQuickEditCurrentValue = (investment: Investment, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    const fundKey = `${investment.type}-${investment.fundName}`;
    if (!expandedFunds.has(fundKey)) {
      toggleFund(fundKey);
    }
    
    const fundInvestments = investments.filter(inv => 
      inv.fundName === investment.fundName && inv.type === investment.type
    );
    const totalCurrentValue = fundInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    
    setEditingCurrentValue({
      fundName: investment.fundName,
      type: investment.type
    });
    setCurrentValueInput(totalCurrentValue > 0 ? totalCurrentValue.toFixed(2).replace('.', ',') : '');
  };

  const handleSaveCurrentValue = async () => {
    if (!editingCurrentValue) return;
    
    const { fundName, type } = editingCurrentValue;
    const fundInvestments = investments.filter(inv => 
      inv.fundName === fundName && inv.type === type
    );
    const totalInvested = fundInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const value = parseFloat(currentValueInput.replace(',', '.'));
    
    if (isNaN(value) || value < 0) return;
    
    const updated = investments.map(inv => {
      if (inv.fundName === fundName && inv.type === type) {
        const ratio = inv.amount / totalInvested;
        return { ...inv, currentValue: value * ratio };
      }
      return inv;
    });
    
    // Önce localStorage'a kaydet (hızlı erişim)
    saveInvestmentsSync(updated);
    
    // Sonra Firebase'e de kaydet (senkronizasyon için)
    try {
      await saveInvestments(updated);
    } catch (error) {
      // Firebase hatası olsa bile localStorage'da var, sessizce devam et
      console.warn('Firebase sync failed, data saved locally:', error);
    }
    
    onUpdate();
    setEditingCurrentValue(null);
    setCurrentValueInput('');
  };

  const handleCancelCurrentValue = () => {
    setEditingCurrentValue(null);
    setCurrentValueInput('');
  };

  const toggleCategory = (type: InvestmentType) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const toggleFund = (fundKey: string) => {
    setExpandedFunds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fundKey)) {
        newSet.delete(fundKey);
      } else {
        newSet.add(fundKey);
      }
      return newSet;
    });
  };

  // Filter investments based on search and filters
  const filteredInvestments = useMemo(() => {
    return investments.filter((investment) => {
      // Search filter (fundName)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        if (!investment.fundName.toLowerCase().includes(query) &&
            !investment.notes?.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Type filter
      if (filterType !== 'all' && investment.type !== filterType) {
        return false;
      }
      
      // Currency filter
      if (filterCurrency !== 'all' && investment.currency !== filterCurrency) {
        return false;
      }
      
      return true;
    });
  }, [investments, searchQuery, filterType, filterCurrency]);

  const groupedInvestments = useMemo(() => {
    const grouped: GroupedInvestments = {};
    
    filteredInvestments.forEach((investment) => {
      if (!grouped[investment.type]) {
        grouped[investment.type] = {};
      }
      if (!grouped[investment.type][investment.fundName]) {
        grouped[investment.type][investment.fundName] = [];
      }
      grouped[investment.type][investment.fundName].push(investment);
    });

    Object.keys(grouped).forEach((type) => {
      Object.keys(grouped[type]).forEach((fundName) => {
        grouped[type][fundName].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });
    });

    return grouped;
  }, [filteredInvestments]);
  
  // Get unique currencies for filter dropdown
  const uniqueCurrencies = useMemo(() => {
    const currencies = new Set<string>();
    investments.forEach(inv => {
      if (inv.currency) {
        currencies.add(inv.currency);
      }
    });
    return Array.from(currencies).sort();
  }, [investments]);
  
  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() !== '' || filterType !== 'all' || filterCurrency !== 'all';
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCurrency('all');
  };

  const categoryOrder: InvestmentType[] = ['fon', 'döviz', 'diğer'];

  const renderInvestmentItem = (investment: Investment) => {
    if (editingId === investment.id) {
      return (
        <InvestmentForm
          key={investment.id}
          investment={investment}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
        />
      );
    }

    const { profitLoss, profitLossPercentage } = calculateProfitLoss(investment);
    const hasProfitLoss = investment.currentValue !== undefined && investment.currentValue > 0;

    return (
      <div
        key={investment.id}
        className="flex items-center justify-between p-3 pl-8 border-l-2 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
        onClick={(e) => e.stopPropagation()}
        role="listitem"
        aria-label={`${investment.fundName} yatırımı, ${formatDate(investment.date)}, tutar: ${formatCurrency(investment.amount)}`}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <time className="text-sm font-medium text-gray-900 dark:text-white" dateTime={investment.date}>
                {formatDate(investment.date)}
              </time>
              {investment.price && (
                <span className="text-xs text-gray-500 dark:text-gray-400" aria-label={`Birim fiyat: ${formatCurrency(investment.price)}`}>
                  • {formatCurrency(investment.price)}/birim
                </span>
              )}
            </div>
            {hasProfitLoss ? (
              <div className="flex items-center gap-2 mt-1" role="status" aria-live="polite">
                {profitLoss >= 0 ? (
                  <TrendingUp size={14} className="text-green-600 dark:text-green-400" aria-hidden="true" />
                ) : (
                  <TrendingDown size={14} className="text-red-600 dark:text-red-400" aria-hidden="true" />
                )}
                <span 
                  className={`text-xs font-medium ${
                    profitLoss >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}
                  aria-label={`${profitLoss >= 0 ? 'Kar' : 'Zarar'}: ${formatCurrency(profitLoss)}, yüzde: ${formatPercentage(profitLossPercentage)}`}
                >
                  {formatCurrency(profitLoss)} ({formatPercentage(profitLossPercentage)})
                </span>
                {investment.currentValue && (
                  <span className="text-xs text-gray-500 dark:text-gray-400" aria-label={`Güncel değer: ${formatCurrency(investment.currentValue)}`}>
                    • Güncel: {formatCurrency(investment.currentValue)}
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-1">
                <span className="text-xs text-gray-400 dark:text-gray-500 italic" role="note">
                  Kar/zarar görmek için düzenle butonuna tıklayıp &quot;Güncel Değer&quot; girin
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-base font-semibold text-gray-900 dark:text-white" aria-label={`Yatırım tutarı: ${formatCurrency(investment.amount)}`}>
              {formatCurrency(investment.amount)}
            </p>
            {hasProfitLoss && (
              <p 
                className={`text-sm font-medium ${
                  profitLoss >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}
                aria-label={`${profitLoss >= 0 ? 'Kar' : 'Zarar'}: ${formatCurrency(profitLoss)}`}
              >
                {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4" role="group" aria-label="Yatırım işlemleri">
          <button
            type="button"
            onClick={(e) => handleQuickEditCurrentValue(investment, e)}
            className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors cursor-pointer z-10 relative focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label={`${investment.fundName} için güncel değer gir`}
            style={{ pointerEvents: 'auto' }}
          >
            <DollarSign size={18} aria-hidden="true" />
            <span className="sr-only">Güncel Değer Gir</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditingId(investment.id);
            }}
            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`${investment.fundName} yatırımını düzenle`}
          >
            <Edit size={16} aria-hidden="true" />
            <span className="sr-only">Düzenle</span>
          </button>
          {deleteConfirm === investment.id ? (
            <div className="flex gap-1" role="group" aria-label="Silme onayı">
              <button
                onClick={() => handleDelete(investment.id)}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Silme işlemini onayla"
              >
                Sil
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Silme işlemini iptal et"
              >
                İptal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(investment.id)}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label={`${investment.fundName} yatırımını sil`}
            >
              <Trash2 size={16} aria-hidden="true" />
              <span className="sr-only">Sil</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" aria-labelledby="investment-history-heading">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 id="investment-history-heading" className="text-xl font-semibold text-gray-800 dark:text-white">
          Yatırım Geçmişi
          {hasActiveFilters && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({filteredInvestments.length} sonuç)
            </span>
          )}
        </h3>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 sm:min-w-[250px]">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" 
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fon adı veya notlarda ara..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              aria-label="Yatırımlarda ara"
              aria-describedby="search-hint"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Arama metnini temizle"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <p id="search-hint" className="sr-only">Fon adı veya notlarda arama yapabilirsiniz</p>
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-colors ${
              hasActiveFilters
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            aria-label="Filtreleri göster veya gizle"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Filtrele</span>
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 rounded-full" aria-label="Aktif filtre sayısı">
                {[filterType !== 'all', filterCurrency !== 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Filter Panel */}
      {showFilters && (
        <div
          id="filter-panel"
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
          role="region"
          aria-label="Filtre seçenekleri"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type Filter */}
            <div>
              <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Yatırım Türü
              </label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as InvestmentType | 'all')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                aria-label="Yatırım türüne göre filtrele"
              >
                <option value="all">Tümü</option>
                <option value="fon">Fon</option>
                <option value="döviz">Döviz</option>
                <option value="hisse">Hisse Senedi</option>
                <option value="diğer">Diğer</option>
              </select>
            </div>
            
            {/* Currency Filter */}
            <div>
              <label htmlFor="filter-currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Para Birimi
              </label>
              <select
                id="filter-currency"
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                aria-label="Para birimine göre filtrele"
              >
                <option value="all">Tümü</option>
                {uniqueCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                aria-label="Tüm filtreleri temizle"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* No Results Message */}
      {hasActiveFilters && filteredInvestments.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
          <p>Arama kriterlerinize uygun yatırım bulunamadı.</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          >
            Filtreleri temizle
          </button>
        </div>
      )}
      
      <div className="space-y-4" role="region" aria-label="Yatırım kategorileri">
        {categoryOrder.map((type) => {
          const categoryInvestments = groupedInvestments[type];
          if (!categoryInvestments || Object.keys(categoryInvestments).length === 0) {
            return null;
          }

          const categoryTotal = Object.values(categoryInvestments)
            .flat()
            .reduce((sum, inv) => sum + inv.amount, 0);
          const categoryCount = Object.values(categoryInvestments)
            .flat()
            .length;

          const isExpanded = expandedCategories.has(type);

          return (
            <div
              key={type}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(type)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-expanded={isExpanded}
                aria-controls={`category-${type}-content`}
                aria-label={`${getTypeLabel(type)} kategorisini ${isExpanded ? 'kapat' : 'aç'}`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-4 h-4 rounded-full ${getTypeColor(type)}`}
                    role="img"
                    aria-label={`${getTypeLabel(type)} kategorisi rengi`}
                    style={{ 
                      minWidth: '16px', 
                      minHeight: '16px',
                      backgroundColor: type === 'diğer' ? '#a855f7' : undefined
                    }} 
                  />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{getTypeLabel(type)}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {categoryCount} yatırım • {formatCurrency(categoryTotal)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300" aria-label={`Toplam tutar: ${formatCurrency(categoryTotal)}`}>
                    {formatCurrency(categoryTotal)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div id={`category-${type}-content`} className="divide-y divide-gray-100 dark:divide-gray-700" role="region" aria-label={`${getTypeLabel(type)} kategorisi yatırımları`}>
                  {Object.entries(categoryInvestments)
                    .sort(([, a], [, b]) => {
                      const totalA = a.reduce((sum, inv) => sum + inv.amount, 0);
                      const totalB = b.reduce((sum, inv) => sum + inv.amount, 0);
                      return totalB - totalA;
                    })
                    .map(([fundName, fundInvestments]) => {
                      const fundTotal = fundInvestments.reduce((sum, inv) => sum + inv.amount, 0);
                      const fundCurrentValue = fundInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
                      const fundProfitLoss = fundCurrentValue - fundTotal;
                      const fundProfitLossPercentage = fundTotal > 0 ? (fundProfitLoss / fundTotal) * 100 : 0;
                      const fundKey = `${type}-${fundName}`;
                      const isFundExpanded = expandedFunds.has(fundKey);
                      const hasFundProfitLoss = fundCurrentValue > 0;

                      const handleFundQuickEdit = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (!isFundExpanded) {
                          toggleFund(fundKey);
                        }
                        
                        const totalCurrentValue = fundInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
                        setEditingCurrentValue({ fundName, type });
                        setCurrentValueInput(totalCurrentValue > 0 ? totalCurrentValue.toFixed(2).replace('.', ',') : '');
                      };

                      return (
                        <div key={fundKey} className="bg-white dark:bg-gray-800">
                          <div className="w-full flex items-center justify-between p-3 px-4">
                            <button
                              onClick={() => toggleFund(fundKey)}
                              className="flex-1 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              aria-expanded={isFundExpanded}
                              aria-controls={`fund-${fundKey}-content`}
                              aria-label={`${fundName} fonunu ${isFundExpanded ? 'kapat' : 'aç'}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {fundName}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400" aria-label={`${fundInvestments.length} yatırım`}>
                                  ({fundInvestments.length} yatırım)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white block" aria-label={`Toplam tutar: ${formatCurrency(fundTotal)}`}>
                                    {formatCurrency(fundTotal)}
                                  </span>
                                  {hasFundProfitLoss && (
                                    <span className={`text-xs font-medium ${
                                      fundProfitLoss >= 0 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                    }`}
                                    aria-label={`${fundProfitLoss >= 0 ? 'Kar' : 'Zarar'}: ${formatCurrency(fundProfitLoss)} (${formatPercentage(fundProfitLossPercentage)})`}
                                    >
                                      {fundProfitLoss >= 0 ? '+' : ''}{formatCurrency(fundProfitLoss)} ({formatPercentage(fundProfitLossPercentage)})
                                    </span>
                                  )}
                                </div>
                                {isFundExpanded ? (
                                  <ChevronUp size={16} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
                                ) : (
                                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
                                )}
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={handleFundQuickEdit}
                              className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors cursor-pointer z-10 relative ml-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                              aria-label={`${fundName} fonu için güncel değer gir`}
                              style={{ pointerEvents: 'auto' }}
                            >
                              <DollarSign size={18} aria-hidden="true" />
                              <span className="sr-only">Güncel Değer Gir</span>
                            </button>
                          </div>

                          {isFundExpanded && (
                            <div id={`fund-${fundKey}-content`} role="region" aria-label={`${fundName} fonu yatırımları`}>
                              {editingCurrentValue?.fundName === fundName && editingCurrentValue?.type === type ? (
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 border-t border-green-200 dark:border-green-800" role="dialog" aria-labelledby={`current-value-dialog-${fundKey}`} aria-modal="false">
                                  <h4 id={`current-value-dialog-${fundKey}`} className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    {fundName} - Mevcut Değer Girişi
                                  </h4>
                                  <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                                    <p>Toplam Yatırım: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(fundTotal)}</span></p>
                                    <p>Yatırım Sayısı: <span className="font-semibold text-gray-900 dark:text-white">{fundInvestments.length}</span></p>
                                  </div>
                                  <div className="mb-4">
                                    <label htmlFor={`current-value-input-${fundKey}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Mevcut Değer (TRY)
                                    </label>
                                    <input
                                      id={`current-value-input-${fundKey}`}
                                      type="text"
                                      value={currentValueInput}
                                      onChange={(e) => setCurrentValueInput(e.target.value)}
                                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                                      placeholder="0"
                                      autoFocus
                                      aria-describedby={`current-value-hint-${fundKey}`}
                                      aria-required="false"
                                    />
                                    <p id={`current-value-hint-${fundKey}`} className="sr-only">
                                      Fonun mevcut değerini Türk Lirası cinsinden girin. Kar/zarar otomatik hesaplanacaktır.
                                    </p>
                                  </div>
                                  {(() => {
                                    const value = parseFloat(currentValueInput.replace(',', '.')) || 0;
                                    if (!currentValueInput || isNaN(value)) return null;
                                    
                                    const profitLoss = value - fundTotal;
                                    const profitLossPercentage = fundTotal > 0 ? (profitLoss / fundTotal) * 100 : 0;
                                    const isProfit = profitLoss >= 0;
                                    
                                    return (
                                      <div 
                                        className={`mb-4 p-3 rounded-lg ${
                                          isProfit 
                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                            : 'bg-red-100 dark:bg-red-900/30'
                                        }`}
                                        role="status"
                                        aria-live="polite"
                                        aria-atomic="true"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className={`font-semibold ${
                                            isProfit 
                                              ? 'text-green-700 dark:text-green-400' 
                                              : 'text-red-700 dark:text-red-400'
                                          }`}>
                                            {isProfit ? 'Kar' : 'Zarar'}:
                                          </span>
                                          <span className={`text-lg font-bold ${
                                            isProfit 
                                              ? 'text-green-600 dark:text-green-400' 
                                              : 'text-red-600 dark:text-red-400'
                                          }`}
                                          aria-label={`${isProfit ? 'Kar' : 'Zarar'}: ${formatCurrency(Math.abs(profitLoss))}, yüzde: ${formatPercentage(profitLossPercentage)}`}
                                          >
                                            {formatCurrency(Math.abs(profitLoss))} ({formatPercentage(profitLossPercentage)})
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  <div className="flex gap-3">
                                    <button
                                      onClick={handleSaveCurrentValue}
                                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                      aria-label="Güncel değeri kaydet"
                                    >
                                      Kaydet
                                    </button>
                                    <button
                                      onClick={handleCancelCurrentValue}
                                      className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                      aria-label="Güncel değer girişini iptal et"
                                    >
                                      İptal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 dark:bg-gray-900">
                                  {fundInvestments.map(renderInvestmentItem)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {investments.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
          <p className="text-lg mb-2">Henüz yatırım eklenmemiş</p>
          <p className="text-sm">Yeni yatırım eklemek için yukarıdaki butona tıklayın</p>
        </div>
      )}
    </section>
  );
}
