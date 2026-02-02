import { z } from 'zod';
import { InvestmentType } from '@/types/investment';

export const investmentSchema = z.object({
  date: z.string()
    .min(1, 'Tarih gereklidir')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Bugünün sonu
      return selectedDate <= today;
    }, 'Tarih bugünden ileri olamaz'),
  
  type: z.enum(['fon', 'döviz', 'hisse', 'diğer'], {
    required_error: 'Yatırım türü seçilmelidir',
  }),
  
  fundName: z.string()
    .min(1, 'Fon adı gereklidir')
    .min(2, 'Fon adı en az 2 karakter olmalıdır')
    .max(100, 'Fon adı en fazla 100 karakter olabilir')
    .trim(),
  
  amount: z.number()
    .min(0.01, 'Tutar 0\'dan büyük olmalıdır')
    .max(999999999, 'Tutar çok büyük'),
  
  price: z.number()
    .min(0, 'Birim fiyat negatif olamaz')
    .max(999999999, 'Birim fiyat çok büyük')
    .optional()
    .or(z.literal(undefined)),
  
  currency: z.enum(['TRY', 'USD', 'EUR']),
  
  currentValue: z.number()
    .min(0, 'Güncel değer negatif olamaz')
    .max(999999999, 'Güncel değer çok büyük')
    .optional()
    .or(z.literal(undefined)),
  
  notes: z.string()
    .max(500, 'Notlar en fazla 500 karakter olabilir')
    .optional()
    .or(z.literal(undefined)),
});

export type InvestmentFormData = z.infer<typeof investmentSchema>;
