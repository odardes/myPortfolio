import { Investment } from '@/types/investment';

// Yatırımları JSON formatında export et
export function exportInvestments(investments: Investment[]): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    investments,
  };
  return JSON.stringify(data, null, 2);
}

// JSON dosyasını indir
export function downloadJSON(investments: Investment[]): void {
  const json = exportInvestments(investments);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `yatirim-portfoyu-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// CSV formatında export et
export function exportCSV(investments: Investment[]): string {
  const headers = ['Tarih', 'Kategori', 'Fon Adı', 'Tutar (TRY)', 'Birim Fiyat', 'Para Birimi', 'Notlar'];
  const rows = investments.map(inv => [
    inv.date,
    inv.type,
    inv.fundName,
    inv.amount.toString(),
    inv.price?.toString() || '',
    inv.currency || 'TRY',
    inv.notes || '',
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csv;
}

// CSV dosyasını indir
export function downloadCSV(investments: Investment[]): void {
  const csv = exportCSV(investments);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM ekle (Excel için)
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `yatirim-portfoyu-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// JSON dosyasını import et
export function importInvestments(jsonString: string): Investment[] {
  try {
    const data = JSON.parse(jsonString);
    
    // Eski format kontrolü (sadece array)
    if (Array.isArray(data)) {
      return data;
    }
    
    // Yeni format kontrolü (object with investments)
    if (data.investments && Array.isArray(data.investments)) {
      return data.investments;
    }
    
    throw new Error('Geçersiz dosya formatı');
  } catch (error) {
    throw new Error('Dosya okunamadı. Lütfen geçerli bir JSON dosyası seçin.');
  }
}

// Dosya seçici aç ve import et
export function importFromFile(): Promise<Investment[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('Dosya seçilmedi'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const investments = importInvestments(content);
          resolve(investments);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsText(file);
    };
    input.click();
  });
}
