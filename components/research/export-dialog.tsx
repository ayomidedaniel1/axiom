'use client';

import { useState } from 'react';
import { FileDown, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToPdf, exportToDocx, extractTitle } from '@/lib/export-utils';
import { useCitationsStore } from '@/stores/citations-store';

interface ExportDialogProps {
  content: string;
  query?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ content, query, isOpen, onClose }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf');
  const citations = useCitationsStore((state) => state.citations);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const title = extractTitle(content);
      const options = { title, content, citations, query };

      if (format === 'pdf') {
        await exportToPdf(options);
      } else {
        await exportToDocx(options);
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-secondary border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
            <FileDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Export Report</h2>
            <p className="text-xs text-muted-foreground">Download as PDF or Word document</p>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-muted-foreground">Select format:</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('pdf')}
              className={`
                flex items-center gap-3 p-4 rounded-xl border transition-all
                ${format === 'pdf'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }
              `}
            >
              <FileText className="w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-medium">PDF</p>
                <p className="text-[10px] text-muted-foreground">Best for sharing</p>
              </div>
            </button>
            <button
              onClick={() => setFormat('docx')}
              className={`
                flex items-center gap-3 p-4 rounded-xl border transition-all
                ${format === 'docx'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }
              `}
            >
              <FileText className="w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-medium">Word</p>
                <p className="text-[10px] text-muted-foreground">Best for editing</p>
              </div>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white/5 rounded-lg p-3 mb-6">
          <p className="text-xs text-muted-foreground">
            Your export will include:
          </p>
          <ul className="text-xs text-muted-foreground mt-2 space-y-1">
            <li>• Full research report content</li>
            <li>• {citations.length} cited source{citations.length !== 1 ? 's' : ''}</li>
            <li>• Axiom branding</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11 border-white/10 hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 h-11 gradient-purple hover:opacity-90"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </span>
            ) : (
              `Download ${format.toUpperCase()}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
