import React, { useState } from 'react';

interface PreviewFrameProps {
  html: string;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ html }) => {
  const [zoom, setZoom] = useState(100);

  // Create a blob URL to render the HTML in isolation
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleReset = () => setZoom(100);

  return (
    <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
      {/* Header */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between z-10 relative shrink-0">
        <div className="flex space-x-1.5 w-20">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
        </div>
        
        <div className="flex-1 text-center">
          <div className="inline-block px-3 py-0.5 bg-white rounded text-xs text-slate-500 border border-slate-200 shadow-sm font-mono">
            preview.html
          </div>
        </div>

        <div className="flex items-center justify-end space-x-1 w-32">
            <button 
                onClick={handleZoomOut} 
                className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors disabled:opacity-30 disabled:hover:bg-transparent" 
                title="Zoom Out"
                disabled={zoom <= 25}
            >
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
            <span className="text-xs text-slate-600 w-10 text-center font-mono select-none">{zoom}%</span>
            <button 
                onClick={handleZoomIn} 
                className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors disabled:opacity-30 disabled:hover:bg-transparent" 
                title="Zoom In"
                disabled={zoom >= 200}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
             <button 
                onClick={handleReset} 
                className="ml-1 p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors" 
                title="Reset Zoom"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
        </div>
      </div>

      {/* Zoom Container */}
      <div className="flex-1 bg-slate-200/50 overflow-auto relative flex">
        <div 
            className="origin-top-left transition-transform duration-200 ease-out bg-white"
            style={{ 
                // Hybrid Zoom Logic:
                // If Zoom < 100 (Zoom Out): Increase dimensions to simulate desktop on small screen.
                // If Zoom >= 100 (Zoom In): Keep dimensions 100% and magnify pixels.
                width: zoom < 100 ? `${100 * (100/zoom)}%` : '100%',
                height: zoom < 100 ? `${100 * (100/zoom)}%` : '100%',
                transform: `scale(${zoom / 100})`,
            }}
        >
            <iframe 
                src={url} 
                className="w-full h-full border-none block"
                title="Generated Preview"
                sandbox="allow-scripts" 
            />
        </div>
      </div>
    </div>
  );
};
