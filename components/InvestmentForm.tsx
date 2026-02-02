'use client';

import { Investment, InvestmentType } from '@/types/investment';
import { useState } from 'react';

interface InvestmentFormProps {
  investment?: Investment;
  onSave: (investment: Investment) => void;
  onCancel?: () => void;
}

export default function InvestmentForm({ investment, onSave, onCancel }: InvestmentFormProps) {
  const [formData, setFormData] = useState<Partial<Investment>>({
    date: investment?.date || new Date().toISOString().split('T')[0],
    type: investment?.type || 'fon',
    fundName: investment?.fundName || '',
    amount: investment?.amount || 0,
    price: investment?.price,
    currency: investment?.currency || 'TRY',
    notes: investment?.notes || '',
    currentValue: investment?.currentValue,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvestment: Investment = {
      id: investment?.id || Date.now().toString(),
      date: formData.date!,
      type: formData.type as InvestmentType,
      fundName: formData.fundName!,
      amount: formData.amount!,
      price: formData.price,
      currency: formData.currency,
      notes: formData.notes,
      currentValue: formData.currentValue,
    };
    onSave(newInvestment);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="investment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tarih
          </label>
          <input
            id="investment-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="investment-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Yatırım Türü
          </label>
          <select
            id="investment-type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as InvestmentType })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            required
            aria-required="true"
          >
            <option value="fon">Fon</option>
            <option value="döviz">Döviz</option>
            <option value="hisse">Hisse Senedi</option>
            <option value="diğer">Diğer</option>
          </select>
        </div>
        <div>
          <label htmlFor="investment-fund-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fon Adı
          </label>
          <input
            id="investment-fund-name"
            type="text"
            value={formData.fundName}
            onChange={(e) => setFormData({ ...formData, fundName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            placeholder="Örn: Altın Fon, Gümüş Fon, Altın, Dolar"
            required
            aria-required="true"
            aria-describedby="fund-name-hint"
          />
          <p id="fund-name-hint" className="sr-only">Örnek: Altın Fon, Gümüş Fon, Altın, Dolar</p>
        </div>
        <div>
          <label htmlFor="investment-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tutar (TRY)
          </label>
          <input
            id="investment-amount"
            type="number"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            placeholder="0"
            required
            aria-required="true"
            min="0"
            step="0.01"
            aria-describedby="amount-hint"
          />
          <p id="amount-hint" className="sr-only">Tutarı Türk Lirası cinsinden girin</p>
        </div>
        <div>
          <label htmlFor="investment-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Birim Fiyat (Opsiyonel)
          </label>
          <input
            id="investment-price"
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            placeholder="0"
            min="0"
            step="0.01"
            aria-describedby="price-hint"
          />
          <p id="price-hint" className="sr-only">Birim fiyat opsiyoneldir</p>
        </div>
        <div>
          <label htmlFor="investment-currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Para Birimi
          </label>
          <select
            id="investment-currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            aria-label="Para birimi seçin"
          >
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="investment-current-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span aria-hidden="true">💰</span> Güncel Değer (TRY) - <span className="text-green-600 dark:text-green-400 font-semibold">Kar/Zarar Hesaplaması İçin</span>
          </label>
          <input
            id="investment-current-value"
            type="number"
            value={formData.currentValue || ''}
            onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || undefined })}
            className="w-full px-3 py-2 border-2 border-green-400 dark:border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20"
            placeholder="Yatırımınızın şu anki değerini girin"
            min="0"
            step="0.01"
            aria-describedby="current-value-description"
          />
          <p id="current-value-description" className="text-xs text-green-700 dark:text-green-400 mt-1 font-medium" role="note">
            Bu alanı doldurduğunuzda kar/zarar durumunuz otomatik hesaplanacak ve gösterilecektir!
          </p>
        </div>
        {formData.notes !== undefined && (
          <div className="md:col-span-2">
            <label htmlFor="investment-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notlar (Opsiyonel)
            </label>
            <textarea
              id="investment-notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="Ek notlar..."
              rows={2}
              aria-describedby="notes-hint"
            />
            <p id="notes-hint" className="sr-only">Ek notlar opsiyoneldir</p>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={investment ? 'Yatırımı güncelle' : 'Yeni yatırım ekle'}
        >
          {investment ? 'Güncelle' : 'Ekle'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Formu iptal et"
          >
            İptal
          </button>
        )}
      </div>
    </form>
  );
}
