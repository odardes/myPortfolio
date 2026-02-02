import { z } from 'zod';
import { InvestmentType } from '@/types/investment';
import { VALIDATION_LIMITS } from './constants';

export const investmentSchema = z.object({
  date: z.string()
    .min(1, 'Tarih gereklidir')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Bugünün sonu
      return selectedDate <= today;
    }, 'Tarih bugünden ileri olamaz'),
  
  type: z.enum(['fon', 'döviz', 'hisse', 'diğer']),
  
  fundName: z.string()
    .min(1, 'Fon adı gereklidir')
    .min(2, 'Fon adı en az 2 karakter olmalıdır')
    .max(100, 'Fon adı en fazla 100 karakter olabilir')
    .trim(),
  
  amount: z.number({
    message: 'Tutar bir sayı olmalıdır',
  })
    .min(0.01, 'Tutar 0\'dan büyük olmalıdır')
    .max(999999999, 'Tutar çok büyük'),
  
  price: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined || (typeof val === 'number' && isNaN(val))) {
        return undefined;
      }
      return Number(val);
    },
    z.number()
      .min(0, 'Birim fiyat negatif olamaz')
      .max(VALIDATION_LIMITS.PRICE_MAX, 'Birim fiyat çok büyük')
      .optional()
  ),
  
  currency: z.enum(['TRY', 'USD', 'EUR']),
  
  currentValue: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined || (typeof val === 'number' && isNaN(val))) {
        return undefined;
      }
      return Number(val);
    },
    z.number()
      .min(0, 'Güncel değer negatif olamaz')
      .max(VALIDATION_LIMITS.CURRENT_VALUE_MAX, 'Güncel değer çok büyük')
      .optional()
  ),
  
  notes: z.string()
    .max(VALIDATION_LIMITS.NOTES_MAX, `Notlar en fazla ${VALIDATION_LIMITS.NOTES_MAX} karakter olabilir`)
    .optional()
    .or(z.literal(undefined)),
});

export type InvestmentFormData = {
  date: string;
  type: 'fon' | 'döviz' | 'hisse' | 'diğer';
  fundName: string;
  amount: number;
  price?: number | undefined;
  currency: 'TRY' | 'USD' | 'EUR';
  currentValue?: number | undefined;
  notes?: string | undefined;
};
