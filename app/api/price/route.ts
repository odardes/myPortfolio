import { NextRequest, NextResponse } from 'next/server';

// Using Node.js runtime for XML parsing support
// export const runtime = 'edge'; // Edge runtime doesn't support all Node.js APIs

interface PriceRequest {
  type: 'döviz' | 'hisse' | 'fon' | 'diğer';
  fundName: string;
  currency?: string;
}

/**
 * TCMB API proxy for currency exchange rates
 */
async function fetchTCMBExchangeRate(currency: string) {
  try {
    const response = await fetch(
      `https://www.tcmb.gov.tr/kurlar/today.xml`,
      {
        headers: { 'Accept': 'application/xml' },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`TCMB API error: ${response.status}`);
    }

    const xmlText = await response.text();
    const currencyCode = currency.toUpperCase();
    
    // TCMB XML format: <Currency CrossOrder="0" Kod="USD" CurrencyCode="USD">
    // Use "Kod" attribute (Turkish for "Code")
    const regex = new RegExp(
      `<Currency[^>]*Kod=["']${currencyCode}["'][^>]*>([\\s\\S]*?)</Currency>`,
      'i'
    );
    const match = xmlText.match(regex);

    if (!match) {
      return {
        success: false,
        error: `${currencyCode} kuru bulunamadı. Lütfen geçerli bir döviz kodu girin (USD, EUR, GBP, vb.)`,
      };
    }

    // Extract ForexBuying rate (alış kuru)
    // Format: <ForexBuying>43.3414</ForexBuying>
    const forexBuyingMatch = match[1].match(/<ForexBuying>([^<]+)<\/ForexBuying>/);
    
    if (!forexBuyingMatch) {
      // Try BanknoteBuying as fallback
      const banknoteMatch = match[1].match(/<BanknoteBuying>([^<]+)<\/BanknoteBuying>/);
      if (!banknoteMatch) {
        return {
          success: false,
          error: `${currencyCode} kuru parse edilemedi`,
        };
      }
      const rateStr = banknoteMatch[1].trim().replace(',', '.');
      const rate = parseFloat(rateStr);
      
      if (isNaN(rate) || rate <= 0) {
        return {
          success: false,
          error: `Geçersiz kur değeri: ${rateStr}`,
        };
      }

      return {
        success: true,
        data: {
          price: rate,
          currency: 'TRY',
          source: 'TCMB',
          lastUpdated: new Date().toISOString(),
        },
      };
    }

    // Parse the rate (TCMB uses dot as decimal separator)
    const rateStr = forexBuyingMatch[1].trim().replace(',', '.');
    const rate = parseFloat(rateStr);

    if (isNaN(rate) || rate <= 0) {
      return {
        success: false,
        error: `Geçersiz kur değeri: ${rate}`,
      };
    }

    return {
      success: true,
      data: {
        price: rate,
        currency: 'TRY',
        source: 'TCMB',
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'TCMB API hatası',
    };
  }
}

/**
 * Fetch gold price per gram in TRY
 * Uses multiple APIs as fallback
 */
async function fetchGoldPrice() {
  try {
    // Try method 1: Get latest gold price from FreeGoldAPI (historical data, get latest)
    try {
      const goldResponse = await fetch(
        'https://freegoldapi.com/data/latest.json',
        {
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (goldResponse.ok) {
        const goldDataArray = await goldResponse.json();
        
        // Get the latest entry (last item in array)
        if (Array.isArray(goldDataArray) && goldDataArray.length > 0) {
          const latestEntry = goldDataArray[goldDataArray.length - 1];
          const pricePerTroyOunceUSD = latestEntry.price;
          
          if (pricePerTroyOunceUSD && pricePerTroyOunceUSD > 0) {
            // Convert from troy ounce to gram (1 troy ounce = 31.1035 grams)
            const pricePerGramUSD = pricePerTroyOunceUSD / 31.1035;
            
            // Get USD/TRY rate from TCMB
            const usdRateResponse = await fetchTCMBExchangeRate('USD');
            
            if (usdRateResponse.success && usdRateResponse.data) {
              const usdToTryRate = usdRateResponse.data.price;
              const pricePerGramTRY = pricePerGramUSD * usdToTryRate;
              
              return {
                success: true,
                data: {
                  price: pricePerGramTRY,
                  currency: 'TRY',
                  source: 'FreeGoldAPI + TCMB',
                  lastUpdated: new Date().toISOString(),
                },
              };
            }
          }
        }
      }
    } catch (error) {
      // Continue to next method
    }

    // Try method 2: Use CoinGecko for gold (XAU) price
    try {
      // CoinGecko doesn't have direct gold, but we can use PAX Gold as proxy
      // Or try to get XAU price from another source
      // For now, return error with helpful message
      return {
        success: false,
        error: 'Altın fiyatları için otomatik çekme şu anda kullanılamıyor. Lütfen "Güncel Değer" butonunu kullanarak manuel olarak gram başına TL fiyatını girin. Örnek: Güncel altın fiyatı 4.300 TL/gram ise, toplam gram × 4.300 değerini girin.',
      };
    } catch (error) {
      // Final fallback
    }

    return {
      success: false,
      error: 'Altın fiyatı alınamadı. Lütfen "Güncel Değer" butonunu kullanarak manuel olarak gram başına TL fiyatını girin.',
    };
  } catch (error) {
    return {
      success: false,
      error: `Altın fiyatı alınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}. Lütfen "Güncel Değer" butonunu kullanarak manuel olarak gram başına TL fiyatını girin.`,
    };
  }
}

/**
 * CoinGecko API proxy for cryptocurrency and gold prices
 */
async function fetchCoinGeckoPrice(cryptoId: string) {
  try {
    const cryptoMap: Record<string, string> = {
      'bitcoin': 'bitcoin',
      'btc': 'bitcoin',
      'ethereum': 'ethereum',
      'eth': 'ethereum',
      'usdt': 'tether',
      'tether': 'tether',
      'usdc': 'usd-coin',
      'bnb': 'binancecoin',
      'solana': 'solana',
      'sol': 'solana',
      'cardano': 'cardano',
      'ada': 'cardano',
      // Gold - CoinGecko uses different endpoints, we'll use a workaround
      'gold': 'pax-gold', // PAX Gold is gold-backed token, close to gold price
      'altın': 'pax-gold',
      'xau': 'pax-gold',
    };

    const coinId = cryptoMap[cryptoId.toLowerCase()] || cryptoId.toLowerCase();

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,try`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: 'API rate limit aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.',
        };
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data[coinId]) {
      return {
        success: false,
        error: `${cryptoId} bulunamadı`,
      };
    }

    const priceData = data[coinId];
    
    // For gold, CoinGecko returns price per troy ounce (31.1 grams)
    // We need to convert to price per gram
    let priceTRY = priceData.try || (priceData.usd * 30); // Fallback
    
    // If it's gold-related, convert from troy ounce to gram
    const isGoldRelated = cryptoId.toLowerCase().includes('gold') || 
                          cryptoId.toLowerCase().includes('altın') ||
                          cryptoId.toLowerCase().includes('xau') ||
                          coinId === 'pax-gold';
    
    if (isGoldRelated) {
      // Convert from troy ounce (31.1035 grams) to gram
      priceTRY = priceTRY / 31.1035;
    }

    return {
      success: true,
      data: {
        price: priceTRY,
        currency: 'TRY',
        source: 'CoinGecko',
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CoinGecko API hatası',
    };
  }
}

/**
 * Alpha Vantage API proxy for stock prices
 */
async function fetchAlphaVantagePrice(symbol: string, apiKey?: string) {
  if (!apiKey) {
    return {
      success: false,
      error: 'Alpha Vantage API anahtarı gerekli',
    };
  }

  try {
    const stockSymbol = symbol.includes('.') ? symbol : `${symbol}.IS`;

    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    if (data['Error Message']) {
      return {
        success: false,
        error: data['Error Message'],
      };
    }

    if (data['Note']) {
      return {
        success: false,
        error: 'API rate limit aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.',
      };
    }

    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      return {
        success: false,
        error: `${symbol} hisse senedi bulunamadı`,
      };
    }

    const price = parseFloat(quote['05. price']);

    if (isNaN(price) || price <= 0) {
      return {
        success: false,
        error: `Geçersiz fiyat değeri: ${price}`,
      };
    }

    return {
      success: true,
      data: {
        price: price,
        currency: 'TRY',
        source: 'Alpha Vantage',
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Alpha Vantage API hatası',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PriceRequest = await request.json();
    const { type, fundName, currency } = body;

    // Validate request
    if (!type || !fundName) {
      return NextResponse.json(
        { success: false, error: 'Type ve fundName gerekli' },
        { status: 400 }
      );
    }

    // Handle different investment types
    if (type === 'diğer') {
      return NextResponse.json({
        success: false,
        error: 'Bu yatırım tipi için otomatik fiyat çekme desteklenmiyor',
      });
    }

    if (type === 'fon') {
      return NextResponse.json({
        success: false,
        error: 'Fon fiyatları için otomatik çekme desteklenmiyor. Lütfen manuel olarak girin.',
      });
    }

    if (type === 'döviz') {
      const currencyCode = currency || fundName.toUpperCase();
      
      // Check if it's gold (altın)
      const isGold = fundName.toLowerCase().includes('altın') || 
                     fundName.toLowerCase().includes('gold') ||
                     currencyCode === 'XAU' || currencyCode === 'GOLD';
      
      if (isGold) {
        // Fetch gold price from MetalpriceAPI (free tier available)
        const result = await fetchGoldPrice();
        return NextResponse.json(result);
      }
      
      // TRY is the base currency, no exchange rate needed
      if (currencyCode === 'TRY' || currencyCode === 'TL') {
        return NextResponse.json({
          success: false,
          error: 'TRY (Türk Lirası) ana para birimidir ve döviz kuru çekilemez. Zaten TRY cinsinden değer giriyorsunuz.',
        });
      }
      
      const result = await fetchTCMBExchangeRate(currencyCode);
      return NextResponse.json(result);
    }

    if (type === 'hisse') {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      const result = await fetchAlphaVantagePrice(fundName, apiKey);
      return NextResponse.json(result);
    }

    return NextResponse.json({
      success: false,
      error: 'Desteklenmeyen yatırım tipi',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}
