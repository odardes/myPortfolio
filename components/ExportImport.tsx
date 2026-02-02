'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Investment } from '@/types/investment';
import { downloadJSON, downloadCSV, importInvestments } from '@/lib/exportImport';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface ExportImportProps {
  investments: Investment[];
  onImport: (investments: Investment[]) => void;
}

export default function ExportImport({ investments, onImport }: ExportImportProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importPreview, setImportPreview] = useState<Investment[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    if (showExportMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
          setShowExportMenu(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showExportMenu]);

  const handleExportJSON = useCallback(() => {
    try {
      downloadJSON(investments);
      toast.success('Yatırımlar JSON formatında indirildi');
      setShowExportMenu(false);
    } catch (error) {
      toast.error('Export işlemi başarısız oldu');
    }
  }, [investments]);

  const handleExportCSV = useCallback(() => {
    try {
      downloadCSV(investments);
      toast.success('Yatırımlar CSV formatında indirildi');
      setShowExportMenu(false);
    } catch (error) {
      toast.error('Export işlemi başarısız oldu');
    }
  }, [investments]);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsImporting(true);
    setImportError(null);
    setImportPreview(null);

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.onerror = () => reject(new Error('Dosya okunamadı'));
        reader.readAsText(file);
      });
      
      const importedInvestments = importInvestments(text);
      
      if (importedInvestments.length === 0) {
        setImportError('Dosyada yatırım bulunamadı');
        setIsImporting(false);
        return;
      }

      setImportPreview(importedInvestments);
      setIsImporting(false);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Dosya okunamadı');
      setIsImporting(false);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json' || file.name.endsWith('.json')) {
      handleFileSelect(file);
    } else {
      setImportError('Lütfen geçerli bir JSON dosyası seçin');
    }
  }, [handleFileSelect]);

  const handleImportConfirm = useCallback(() => {
    if (importPreview && importPreview.length > 0) {
      onImport(importPreview);
      toast.success(`${importPreview.length} yatırım başarıyla içe aktarıldı`);
      setShowImportModal(false);
      setImportPreview(null);
      setImportError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [importPreview, onImport]);

  const handleImportCancel = useCallback(() => {
    setShowImportModal(false);
    setImportPreview(null);
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleOpenImport = useCallback(() => {
    setShowImportModal(true);
    setImportPreview(null);
    setImportError(null);
  }, []);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Export Button with Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Yatırımları dışa aktar"
            aria-expanded={showExportMenu}
            aria-haspopup="true"
          >
            <Download size={18} aria-hidden="true" />
            <span>Dışa Aktar</span>
          </button>

          {showExportMenu && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              role="menu"
              aria-label="Export formatları"
            >
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                role="menuitem"
                aria-label="JSON formatında dışa aktar"
              >
                <FileJson size={18} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">JSON</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Yedekleme için</div>
                </div>
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                role="menuitem"
                aria-label="CSV formatında dışa aktar"
              >
                <FileSpreadsheet size={18} className="text-green-600 dark:text-green-400" aria-hidden="true" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">CSV</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Excel için</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Import Button */}
        <button
          onClick={handleOpenImport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Yatırımları içe aktar"
        >
          <Upload size={18} aria-hidden="true" />
          <span>İçe Aktar</span>
        </button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleImportCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 id="import-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                Yatırımları İçe Aktar
              </h2>
              <button
                onClick={handleImportCancel}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Modalı kapat"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                role="region"
                aria-label="Dosya sürükle bırak alanı"
              >
                <Upload 
                  size={48} 
                  className={`mx-auto mb-4 ${
                    isDragging 
                      ? 'text-blue-500' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Dosyayı buraya sürükleyin veya
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  aria-label="Dosya seç"
                >
                  dosya seçin
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  JSON formatında yatırım dosyası
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileInputChange}
                  className="hidden"
                  aria-label="Dosya seçici"
                />
              </div>

              {/* Loading State */}
              {isImporting && (
                <div className="mt-6 flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400">
                  <LoadingSpinner size="sm" aria-label="Dosya yükleniyor" />
                  <span>Dosya yükleniyor...</span>
                </div>
              )}

              {/* Error State */}
              {importError && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">Hata</p>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">{importError}</p>
                  </div>
                </div>
              )}

              {/* Preview */}
              {importPreview && importPreview.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4 text-green-600 dark:text-green-400">
                    <CheckCircle size={20} aria-hidden="true" />
                    <p className="font-medium">
                      {importPreview.length} yatırım bulundu
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {importPreview.slice(0, 5).map((inv, index) => (
                        <div 
                          key={index}
                          className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                        >
                          <span className="font-medium">{inv.fundName}</span>
                          {' • '}
                          <span>{inv.type}</span>
                          {' • '}
                          <span>{new Date(inv.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                      ))}
                      {importPreview.length > 5 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                          ... ve {importPreview.length - 5} yatırım daha
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleImportCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="İçe aktarmayı iptal et"
              >
                İptal
              </button>
              {importPreview && importPreview.length > 0 && (
                <button
                  onClick={handleImportConfirm}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
                  aria-label="İçe aktarmayı onayla"
                >
                  <CheckCircle size={18} aria-hidden="true" />
                  <span>İçe Aktar ({importPreview.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
