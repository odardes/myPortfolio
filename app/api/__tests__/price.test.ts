// Mock Next.js server modules before importing route
jest.mock('next/server', () => {
  const mockNextResponse = {
    json: jest.fn((data, init?) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  };

  return {
    NextRequest: class MockNextRequest {
      url: string;
      method: string;
      body: string | null;
      
      constructor(url: string, init?: RequestInit) {
        this.url = url;
        this.method = init?.method || 'GET';
        this.body = init?.body as string || null;
      }
      
      async json() {
        if (!this.body) return {};
        try {
          return JSON.parse(this.body);
        } catch {
          return {};
        }
      }
    },
    NextResponse: mockNextResponse,
  };
});

import { POST } from '../price/route';
import { NextRequest } from 'next/server';

// Mock fetch globally
global.fetch = jest.fn();

describe('Price API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Currency Exchange Rates (TCMB)', () => {
    it('should fetch USD exchange rate successfully', async () => {
      const mockXml = `
        <Tarih_Date>
          <Currency CrossOrder="0" Kod="USD" CurrencyCode="USD">
            <Unit>1</Unit>
            <Isim>ABD DOLARI</Isim>
            <CurrencyName>US DOLLAR</CurrencyName>
            <ForexBuying>43.3414</ForexBuying>
            <ForexSelling>43.4195</ForexSelling>
            <BanknoteBuying>43.3110</BanknoteBuying>
            <BanknoteSelling>43.4846</BanknoteSelling>
          </Currency>
        </Tarih_Date>
      `;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockXml,
      });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'USD',
          currency: 'USD',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data?.price).toBe(43.3414);
      expect(data.data?.currency).toBe('TRY');
      expect(data.data?.source).toBe('TCMB');
    });

    it('should fetch EUR exchange rate successfully', async () => {
      const mockXml = `
        <Tarih_Date>
          <Currency CrossOrder="9" Kod="EUR" CurrencyCode="EUR">
            <Unit>1</Unit>
            <Isim>EURO</Isim>
            <CurrencyName>EURO</CurrencyName>
            <ForexBuying>47.1234</ForexBuying>
            <ForexSelling>47.2345</ForexSelling>
          </Currency>
        </Tarih_Date>
      `;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockXml,
      });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'EUR',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data?.price).toBe(47.1234);
    });

    it('should return error for unsupported currency', async () => {
      const mockXml = `
        <Tarih_Date>
          <Currency CrossOrder="0" Kod="USD" CurrencyCode="USD">
            <ForexBuying>43.3414</ForexBuying>
          </Currency>
        </Tarih_Date>
      `;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockXml,
      });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'XYZ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('XYZ kuru bulunamadı');
    });

    it('should return error for TRY currency', async () => {
      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'TRY',
          currency: 'TRY',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('TRY');
      expect(data.error).toContain('ana para birimi');
    });

    it('should handle TCMB API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'USD',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      // Error message should indicate API failure or currency not found
      expect(typeof data.error).toBe('string');
      expect(data.error.length).toBeGreaterThan(0);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'USD',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      // Error should contain either "TCMB API" or the error message
      expect(typeof data.error).toBe('string');
      expect(data.error.length).toBeGreaterThan(0);
    });
  });

  describe('Gold Prices', () => {
    it('should fetch gold price successfully using FreeGoldAPI + TCMB', async () => {
      // Mock FreeGoldAPI response
      const mockGoldData = [
        {
          date: '2025-01-01',
          price: 100.5,
          source: 'test',
        },
        {
          date: '2026-02-02',
          price: 4713.89,
          source: 'yahoo_finance',
        },
      ];

      // Mock TCMB USD rate
      const mockTCMBXml = `
        <Tarih_Date>
          <Currency CrossOrder="0" Kod="USD" CurrencyCode="USD">
            <ForexBuying>43.3414</ForexBuying>
          </Currency>
        </Tarih_Date>
      `;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoldData,
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockTCMBXml,
        });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'Altın',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data?.price).toBeCloseTo(4713.89 / 31.1035 * 43.3414, 2);
      expect(data.data?.currency).toBe('TRY');
      expect(data.data?.source).toBe('FreeGoldAPI + TCMB');
    });

    it('should detect gold by fundName containing "altın"', async () => {
      const mockGoldData = [
        { date: '2026-02-02', price: 4713.89, source: 'test' },
      ];
      const mockTCMBXml = `
        <Tarih_Date>
          <Currency Kod="USD"><ForexBuying>43.3414</ForexBuying></Currency>
        </Tarih_Date>
      `;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoldData,
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockTCMBXml,
        });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'Gram Altın',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it('should detect gold by fundName containing "gold"', async () => {
      const mockGoldData = [
        { date: '2026-02-02', price: 4713.89, source: 'test' },
      ];
      const mockTCMBXml = `
        <Tarih_Date>
          <Currency Kod="USD"><ForexBuying>43.3414</ForexBuying></Currency>
        </Tarih_Date>
      `;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoldData,
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockTCMBXml,
        });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'Gold',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it('should handle FreeGoldAPI failure gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'Altın',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      // Error message should mention gold or manual entry
      expect(typeof data.error).toBe('string');
      expect(data.error.length).toBeGreaterThan(0);
    });

    it('should handle empty gold data array', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'Altın',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
    });
  });

  describe('Stock Prices (Alpha Vantage)', () => {
    it('should fetch stock price successfully with API key', async () => {
      const mockStockData = {
        'Global Quote': {
          '05. price': '125.50',
        },
      };

      process.env.ALPHA_VANTAGE_API_KEY = 'test-key';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStockData,
      });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'hisse',
          fundName: 'THYAO',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data?.price).toBe(125.50);
      expect(data.data?.source).toBe('Alpha Vantage');

      delete process.env.ALPHA_VANTAGE_API_KEY;
    });

    it('should return error when API key is missing', async () => {
      delete process.env.ALPHA_VANTAGE_API_KEY;

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'hisse',
          fundName: 'THYAO',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('API anahtarı');
    });

    it('should handle Alpha Vantage API errors', async () => {
      process.env.ALPHA_VANTAGE_API_KEY = 'test-key';

      const mockErrorData = {
        'Error Message': 'Invalid API call',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorData,
      });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'hisse',
          fundName: 'INVALID',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid API call');

      delete process.env.ALPHA_VANTAGE_API_KEY;
    });

    it('should handle rate limit errors', async () => {
      process.env.ALPHA_VANTAGE_API_KEY = 'test-key';

      const mockRateLimitData = {
        Note: 'Thank you for using Alpha Vantage API',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRateLimitData,
      });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'hisse',
          fundName: 'THYAO',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('rate limit');

      delete process.env.ALPHA_VANTAGE_API_KEY;
    });
  });

  describe('Request Validation', () => {
    it('should return error for missing type', async () => {
      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          fundName: 'USD',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Type ve fundName gerekli');
    });

    it('should return error for missing fundName', async () => {
      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return error for unsupported type "diğer"', async () => {
      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'diğer',
          fundName: 'Test',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('desteklenmiyor');
    });

    it('should return error for unsupported type "fon"', async () => {
      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'fon',
          fundName: 'Test Fon',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Fon fiyatları');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: 'invalid json',
      });

      // Route should handle JSON parse errors gracefully
      const response = await POST(request);
      const data = await response.json();

      // Should return error response, not throw
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle TCMB XML parsing errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => '<invalid>xml</invalid>',
      });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'USD',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
    });

    it('should handle missing ForexBuying in TCMB XML', async () => {
      const mockXml = `
        <Tarih_Date>
          <Currency Kod="USD" CurrencyCode="USD">
            <Unit>1</Unit>
            <Isim>ABD DOLARI</Isim>
          </Currency>
        </Tarih_Date>
      `;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockXml,
      });

      const request = new NextRequest('http://localhost/api/price', {
        method: 'POST',
        body: JSON.stringify({
          type: 'döviz',
          fundName: 'USD',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('parse edilemedi');
    });
  });
});
