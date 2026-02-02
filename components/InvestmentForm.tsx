'use client';

import { Investment, InvestmentType } from '@/types/investment';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { investmentSchema, InvestmentFormData } from '@/lib/validation';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface InvestmentFormProps {
  investment?: Investment;
  onSave: (investment: Investment) => void;
  onCancel?: () => void;
}

export default function InvestmentForm({ investment, onSave, onCancel }: InvestmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema) as any,
    defaultValues: {
      date: investment?.date || new Date().toISOString().split('T')[0],
      type: investment?.type || 'fon',
      fundName: investment?.fundName || '',
      amount: investment?.amount,
      price: investment?.price,
      currency: (investment?.currency || 'TRY') as 'TRY' | 'USD' | 'EUR',
      notes: investment?.notes,
      currentValue: investment?.currentValue,
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: InvestmentFormData) => {
    const newInvestment: Investment = {
      id: investment?.id || Date.now().toString(),
      date: data.date,
      type: data.type as InvestmentType,
      fundName: data.fundName,
      amount: data.amount,
      price: data.price,
      currency: data.currency,
      notes: data.notes,
      currentValue: data.currentValue,
    };
    
    onSave(newInvestment);
    toast.success(investment ? 'Yatırım güncellendi!' : 'Yatırım eklendi!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="investment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tarih
          </label>
          <input
            id="investment-date"
            type="date"
            {...register('date')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ${
              errors.date 
                ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            aria-required="true"
            aria-invalid={errors.date ? 'true' : 'false'}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
          {errors.date && (
            <p id="date-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.date.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="investment-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Yatırım Türü
          </label>
          <select
            id="investment-type"
            {...register('type')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ${
              errors.type 
                ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            aria-required="true"
            aria-invalid={errors.type ? 'true' : 'false'}
            aria-describedby={errors.type ? 'type-error' : undefined}
          >
            <option value="fon">Fon</option>
            <option value="döviz">Döviz</option>
            <option value="hisse">Hisse Senedi</option>
            <option value="diğer">Diğer</option>
          </select>
          {errors.type && (
            <p id="type-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.type.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="investment-fund-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fon Adı
          </label>
          <input
            id="investment-fund-name"
            type="text"
            {...register('fundName')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ${
              errors.fundName 
                ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            placeholder="Örn: Altın Fon, Gümüş Fon, Altın, Dolar"
            aria-required="true"
            aria-invalid={errors.fundName ? 'true' : 'false'}
            aria-describedby={errors.fundName ? 'fund-name-error' : 'fund-name-hint'}
          />
          {errors.fundName ? (
            <p id="fund-name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.fundName.message}
            </p>
          ) : (
            <p id="fund-name-hint" className="sr-only">Örnek: Altın Fon, Gümüş Fon, Altın, Dolar</p>
          )}
        </div>
        <div>
          <label htmlFor="investment-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tutar (TRY)
          </label>
          <input
            id="investment-amount"
            type="number"
            {...register('amount', { 
              valueAsNumber: true,
              required: 'Tutar gereklidir',
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ${
              errors.amount 
                ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            placeholder="0"
            aria-required="true"
            aria-invalid={errors.amount ? 'true' : 'false'}
            aria-describedby={errors.amount ? 'amount-error' : 'amount-hint'}
            min="0.01"
            step="0.01"
          />
          {errors.amount ? (
            <p id="amount-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.amount.message}
            </p>
          ) : (
            <p id="amount-hint" className="sr-only">Tutarı Türk Lirası cinsinden girin</p>
          )}
        </div>
        <div>
          <label htmlFor="investment-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Birim Fiyat (Opsiyonel)
          </label>
          <input
            id="investment-price"
            type="number"
            {...register('price', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ${
              errors.price 
                ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            placeholder="0"
            min="0"
            step="0.01"
            aria-invalid={errors.price ? 'true' : 'false'}
            aria-describedby={errors.price ? 'price-error' : 'price-hint'}
          />
          {errors.price ? (
            <p id="price-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.price.message}
            </p>
          ) : (
            <p id="price-hint" className="sr-only">Birim fiyat opsiyoneldir</p>
          )}
        </div>
        <div>
          <label htmlFor="investment-currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Para Birimi
          </label>
          <select
            id="investment-currency"
            {...register('currency')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ${
              errors.currency 
                ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            aria-label="Para birimi seçin"
            aria-invalid={errors.currency ? 'true' : 'false'}
            aria-describedby={errors.currency ? 'currency-error' : undefined}
          >
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          {errors.currency && (
            <p id="currency-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.currency.message}
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="investment-current-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span aria-hidden="true">💰</span> Güncel Değer (TRY) - <span className="text-green-600 dark:text-green-400 font-semibold">Kar/Zarar Hesaplaması İçin</span>
          </label>
          <input
            id="investment-current-value"
            type="number"
            {...register('currentValue', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 ${
              errors.currentValue 
                ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
                : 'border-green-400 dark:border-green-600 focus:ring-green-500'
            }`}
            placeholder="Yatırımınızın şu anki değerini girin"
            min="0"
            step="0.01"
            aria-invalid={errors.currentValue ? 'true' : 'false'}
            aria-describedby={errors.currentValue ? 'current-value-error' : 'current-value-description'}
          />
          {errors.currentValue ? (
            <p id="current-value-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.currentValue.message}
            </p>
          ) : (
            <p id="current-value-description" className="text-xs text-green-700 dark:text-green-400 mt-1 font-medium" role="note">
              Bu alanı doldurduğunuzda kar/zarar durumunuz otomatik hesaplanacak ve gösterilecektir!
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="investment-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notlar (Opsiyonel)
          </label>
          <textarea
            id="investment-notes"
            {...register('notes')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ${
              errors.notes 
                ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            placeholder="Ek notlar..."
            rows={2}
            aria-invalid={errors.notes ? 'true' : 'false'}
            aria-describedby={errors.notes ? 'notes-error' : 'notes-hint'}
          />
          {errors.notes ? (
            <p id="notes-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.notes.message}
            </p>
          ) : (
            <p id="notes-hint" className="sr-only">Ek notlar opsiyoneldir</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          aria-label={investment ? 'Yatırımı güncelle' : 'Yeni yatırım ekle'}
          aria-busy={isSubmitting}
        >
          {isSubmitting && <LoadingSpinner size="sm" aria-label="Kaydediliyor" />}
          <span>{isSubmitting ? 'Kaydediliyor...' : investment ? 'Güncelle' : 'Ekle'}</span>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Formu iptal et"
          >
            İptal
          </button>
        )}
      </div>
    </form>
  );
}
