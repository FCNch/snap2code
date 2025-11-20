import React from 'react';
import { HistoryItem } from '../types';
import { Button } from './Button';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onLoad, 
  onDelete 
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 w-80 sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl 
        transform transition-transform duration-300 ease-in-out z-[70] flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">History</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              <p>No history yet.</p>
              <p className="text-sm">Convert an image to see it here.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden group hover:border-blue-500/50 transition-all"
              >
                <div 
                  className="h-32 w-full bg-slate-900 relative cursor-pointer"
                  onClick={() => {
                    onLoad(item);
                    onClose();
                  }}
                >
                  <img 
                    src={`data:${item.mimeType};base64,${item.previewBase64}`} 
                    alt={item.imageName}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs text-slate-300 truncate font-medium">{item.imageName}</p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="p-2 flex space-x-2 bg-slate-800/50">
                  <Button 
                    variant="secondary" 
                    className="flex-1 text-xs h-8 px-2"
                    onClick={() => {
                      onLoad(item);
                      onClose();
                    }}
                  >
                    Load
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 px-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => onDelete(item.id)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};