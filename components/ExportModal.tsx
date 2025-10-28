import React from 'react';
import { BookOpenIcon, CloseIcon, PdfIcon } from './IconComponents';

interface ExportModalProps {
  onClose: () => void;
  onDownloadPdf: () => void;
  onViewInteractive: () => void;
  isExporting: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, onDownloadPdf, onViewInteractive, isExporting }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <CloseIcon />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Export Your Storybook</h2>
        <div className="space-y-4">
          <button 
            onClick={onViewInteractive} 
            disabled={isExporting}
            className="w-full flex items-center justify-center text-left p-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            <BookOpenIcon />
            <span className="ml-4 font-semibold">View Interactive Book</span>
          </button>
          <button 
            onClick={onDownloadPdf} 
            disabled={isExporting}
            className="w-full flex items-center justify-center text-left p-4 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors disabled:opacity-50"
          >
            <PdfIcon />
            <span className="ml-4 font-semibold">{isExporting ? 'Creating PDF...' : 'Download as PDF'}</span>
            {isExporting && (
                <div className="ml-4 w-5 h-5 border-2 border-pink-700 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};