'use client';

import { Investment, InvestmentType } from '@/types/investment';
import { formatCurrency, formatDate, getTypeColor, getTypeLabel, calculateProfitLoss, formatPercentage } from '@/lib/utils';
import { Trash2, Edit, ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useState, useMemo } from 'react';
import InvestmentForm from './InvestmentForm';
import { saveInvestmentsSync } from '@/lib/storage';

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

  const handleSaveCurrentValue = () => {
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
    
    saveInvestmentsSync(updated);
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

  const groupedInvestments = useMemo(() => {
    const grouped: GroupedInvestments = {};
    
    investments.forEach((investment) => {
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
  }, [investments]);

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
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(investment.date)}
              </span>
              {investment.price && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {formatCurrency(investment.price)}/birim
                </span>
              )}
            </div>
            {hasProfitLoss ? (
              <div className="flex items-center gap-2 mt-1">
                {profitLoss >= 0 ? (
                  <TrendingUp size={14} className="text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown size={14} className="text-red-600 dark:text-red-400" />
                )}
                <span className={`text-xs font-medium ${
                  profitLoss >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(profitLoss)} ({formatPercentage(profitLossPercentage)})
                </span>
                {investment.currentValue && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    • Güncel: {formatCurrency(investment.currentValue)}
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-1">
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                  💡 Kar/zarar görmek için düzenle butonuna tıklayıp &quot;Güncel Değer&quot; girin
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {formatCurrency(investment.amount)}
            </p>
            {hasProfitLoss && (
              <p className={`text-sm font-medium ${
                profitLoss >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            type="button"
            onClick={(e) => handleQuickEditCurrentValue(investment, e)}
            className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors cursor-pointer z-10 relative"
            title="Güncel Değer Gir"
            style={{ pointerEvents: 'auto' }}
          >
            <DollarSign size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditingId(investment.id);
            }}
            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
            title="Düzenle"
          >
            <Edit size={16} />
          </button>
          {deleteConfirm === investment.id ? (
            <div className="flex gap-1">
              <button
                onClick={() => handleDelete(investment.id)}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sil
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                İptal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(investment.id)}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
              title="Sil"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Yatırım Geçmişi</h3>
      <div className="space-y-4">
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
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-4 h-4 rounded-full ${getTypeColor(type)}`} 
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatCurrency(categoryTotal)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
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
                              className="flex-1 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded p-1 -m-1"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {fundName}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({fundInvestments.length} yatırım)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                                    {formatCurrency(fundTotal)}
                                  </span>
                                  {hasFundProfitLoss && (
                                    <span className={`text-xs font-medium ${
                                      fundProfitLoss >= 0 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {fundProfitLoss >= 0 ? '+' : ''}{formatCurrency(fundProfitLoss)} ({formatPercentage(fundProfitLossPercentage)})
                                    </span>
                                  )}
                                </div>
                                {isFundExpanded ? (
                                  <ChevronUp size={16} className="text-gray-500 dark:text-gray-400" />
                                ) : (
                                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                                )}
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={handleFundQuickEdit}
                              className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors cursor-pointer z-10 relative ml-2"
                              title="Fon için Güncel Değer Gir"
                              style={{ pointerEvents: 'auto' }}
                            >
                              <DollarSign size={18} />
                            </button>
                          </div>

                          {isFundExpanded && (
                            <>
                              {editingCurrentValue?.fundName === fundName && editingCurrentValue?.type === type ? (
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 border-t border-green-200 dark:border-green-800">
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    {fundName} - Mevcut Değer Girişi
                                  </h4>
                                  <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                                    <p>Toplam Yatırım: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(fundTotal)}</span></p>
                                    <p>Yatırım Sayısı: <span className="font-semibold text-gray-900 dark:text-white">{fundInvestments.length}</span></p>
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Mevcut Değer (TRY)
                                    </label>
                                    <input
                                      type="text"
                                      value={currentValueInput}
                                      onChange={(e) => setCurrentValueInput(e.target.value)}
                                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                                      placeholder="0"
                                      autoFocus
                                    />
                                  </div>
                                  {(() => {
                                    const value = parseFloat(currentValueInput.replace(',', '.')) || 0;
                                    if (!currentValueInput || isNaN(value)) return null;
                                    
                                    const profitLoss = value - fundTotal;
                                    const profitLossPercentage = fundTotal > 0 ? (profitLoss / fundTotal) * 100 : 0;
                                    const isProfit = profitLoss >= 0;
                                    
                                    return (
                                      <div className={`mb-4 p-3 rounded-lg ${
                                        isProfit 
                                          ? 'bg-green-100 dark:bg-green-900/30' 
                                          : 'bg-red-100 dark:bg-red-900/30'
                                      }`}>
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
                                          }`}>
                                            {formatCurrency(Math.abs(profitLoss))} ({formatPercentage(profitLossPercentage)})
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  <div className="flex gap-3">
                                    <button
                                      onClick={handleSaveCurrentValue}
                                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                                    >
                                      Kaydet
                                    </button>
                                    <button
                                      onClick={handleCancelCurrentValue}
                                      className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
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
                            </>
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
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Henüz yatırım eklenmemiş</p>
          <p className="text-sm">Yeni yatırım eklemek için yukarıdaki butona tıklayın</p>
        </div>
      )}
    </div>
  );
}
