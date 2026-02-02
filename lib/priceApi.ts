/**
 * Financial Price API Service
 * Fetches current prices for different investment types from various APIs
 */

import { InvestmentType } from '@/types/investment';

export interface PriceData {
  price: number;
  currency: string;
  source: string;
  lastUpdated: string;
  error?: string;
}

export interface PriceApiResponse {
  success: boolean;
  data?: PriceData;
  error?: string;
}

/**
 * Client-side function to fetch prices via Next.js API route
 * This avoids CORS issues by proxying through our own API
 */
async function fetchPriceViaAPI(
  type: InvestmentType,
  fundName: string,
  currency?: string
): Promise<PriceApiResponse> {
  try {
    const response = await fetch('/api/price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        fundName,
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'API çağrısı başarısız',
    };
  }
}


/**
 * Main function to fetch price based on investment type
 * Uses Next.js API route to avoid CORS issues
 */
export async function fetchCurrentPrice(
  type: InvestmentType,
  fundName: string,
  currency?: string
): Promise<PriceApiResponse> {
  return fetchPriceViaAPI(type, fundName, currency);
}

/**
 * Calculate current value based on fetched price and investment amount
 */
export function calculateCurrentValueFromPrice(
  price: number,
  amount: number,
  originalPrice?: number
): number {
  // If original price is available, calculate based on ratio
  if (originalPrice && originalPrice > 0) {
    const units = amount / originalPrice;
    return units * price;
  }
  
  // Otherwise, assume 1:1 ratio (for currency exchanges)
  return amount * price;
}
