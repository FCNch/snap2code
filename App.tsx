import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { PreviewFrame } from './components/PreviewFrame';
import { CodeViewer } from './components/CodeViewer';
import { Button } from './components/Button';
import { HistorySidebar } from './components/HistorySidebar';
import { AppStatus, ImageFile, HistoryItem, OutputFormat } from './types';
import { generateCodeFromImage } from './services/geminiService';
import { saveToHistory, getHistory, deleteFromHistory } from './services/db';

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'html_tailwind', label: 'HTML + Tailwind' },
  { value: 'html_bootstrap', label: 'HTML + Bootstrap' },
  { value: 'react_tailwind', label: 'React + Tailwind' },
  { value: 'json', label: 'JSON Data' },
  { value: 'sql', label: 'SQL Schema' },
];

export default function App() {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [image, setImage] = useState<ImageFile | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('html_tailwind');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
        const items = await getHistory();
        // Backwards compatibility mapping
        const mappedItems = items.map(item => ({
        ...item,
        code: item.code || (item as any).html || '', // Handle old records
        format: item.format || 'html_tailwind'
        }));
        setHistoryItems(mappedItems);
    } catch (e) {
        console.warn("Failed to load history", e);
    }
  };

  const handleImageSelect = (selectedImage: ImageFile) => {
    setImage(selectedImage);
    setStatus(AppStatus.PREVIEWING);
    setGeneratedCode(null);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setImage(null);
    setGeneratedCode(null);
    setStatus(AppStatus.IDLE);
    setErrorMessage(null);
  };

  const handleConvert = async () => {
    if (!image) return;
    
    setStatus(AppStatus.PROCESSING);
    setErrorMessage(null);
    
    try {
      const result = await generateCodeFromImage(image.base64, image.mimeType, selectedFormat);
      setGeneratedCode(result.code);
      setStatus(AppStatus.SUCCESS);
      
      // Switch to code view for non-HTML formats
      if (!result.format.startsWith('html')) {
        setViewMode('code');
      } else {
        setViewMode('preview');
      }

      // Auto-save to History DB with silent error handling
      try {
        const newItem: HistoryItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            imageName: image.file.name,
            code: result.code,
            format: result.format,
            previewBase64: image.base64,
            mimeType: image.mimeType
        };
        await saveToHistory(newItem);
        await loadHistory(); // Refresh list
      } catch (dbError) {
          console.error("Failed to save history entry:", dbError);
          // We do not block the user flow for a DB save failure
      }

    } catch (error: any) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setErrorMessage(error.message || "An unexpected error occurred. Please try again.");
    }
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    const dummyFile = new File([""], item.imageName, { type: item.mimeType });
    
    const imageFile: ImageFile = {
      file: dummyFile,
      previewUrl: `data:${item.mimeType};base64,${item.previewBase64}`,
      base64: item.previewBase64,
      mimeType: item.mimeType
    };

    setImage(imageFile);
    setGeneratedCode(item.code);
    setSelectedFormat(item.format);
    setStatus(AppStatus.SUCCESS);
    setErrorMessage(null);
    
    if (item.format.startsWith('html')) {
        setViewMode('preview');
    } else {
        setViewMode('code');
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteFromHistory(id);
        await loadHistory();
      } catch (e) {
          console.error("Delete failed", e);
          alert("Failed to delete item from history.");
      }
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    let extension = 'txt';
    if (selectedFormat.startsWith('html')) extension = 'html';
    if (selectedFormat === 'json') extension = 'json';
    if (selectedFormat === 'sql') extension = 'sql';
    if (selectedFormat === 'react_tailwind') extension = 'tsx';

    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30 scroll-smooth">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* BK DIGITAL Logo */}
            <div className="flex items-center gap-3 select-none">
                <div className="w-10 h-10 bg-black rounded-full border-2 border-red-600 flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.3)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-900/30 to-transparent opacity-50"></div>
                    <span className="text-red-600 font-black italic text-lg leading-none -mr-0.5 translate-y-[1px] group-hover:scale-110 transition-transform">B</span>
                    <span className="text-slate-300 font-black italic text-lg leading-none -ml-0.5 translate-y-[1px] group-hover:scale-110 transition-transform">K</span>
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-xl font-bold text-white tracking-wider leading-none">
                        BK <span className="font-light text-slate-400">DIGITAL</span>
                    </span>
                </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <Button 
              variant="ghost" 
              onClick={() => setIsHistoryOpen(true)}
              className="text-slate-400 hover:text-white"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              History
            </Button>
            <div className="w-px h-4 bg-slate-700 hidden sm:block"></div>
             <span className="text-xs text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 rounded-full px-2 py-1 hidden sm:inline-block">
                Gemini 2.5 Flash
             </span>
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        history={historyItems}
        onLoad={handleLoadHistoryItem}
        onDelete={handleDeleteHistoryItem}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)] min-h-[600px]">
          
          {/* Left Column: Input & Controls */}
          <div className="flex flex-col space-y-6 h-full">
            <div className="flex-none">
              <h1 className="text-3xl font-bold text-white mb-2">
                Clone any <span className="text-red-500">Design</span>
              </h1>
              <p className="text-slate-400">
                Upload a screenshot or interface design. We'll clone it into code.
              </p>
            </div>

            <div className="flex-1 min-h-0">
              <ImageUploader 
                onImageSelect={handleImageSelect} 
                selectedImage={image}
                onReset={handleReset}
              />
            </div>

            <div className="flex-none bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Output Format</label>
                    <select 
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value as OutputFormat)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
                        disabled={status === AppStatus.PROCESSING}
                    >
                        {FORMAT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-slate-400 w-full">
                  {status === AppStatus.PROCESSING ? (
                    <span className="flex items-center text-red-400">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      Generating {selectedFormat.split('_')[0].toUpperCase()}...
                    </span>
                  ) : status === AppStatus.ERROR ? (
                    <div className="flex flex-col items-start text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 w-full">
                        <div className="flex items-center mb-1">
                             <svg className="w-5 h-5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-sm">Error</span>
                        </div>
                        <span className="text-xs opacity-90 mb-2">{errorMessage}</span>
                        
                        {/* Troubleshooting Box for API Key issues */}
                        {(errorMessage?.includes("API Key") || errorMessage?.includes(".env")) && (
                            <div className="w-full mt-2 p-2 bg-slate-900/50 rounded text-slate-400 text-xs border border-slate-700">
                                <p className="font-semibold text-slate-300 mb-1">Troubleshooting:</p>
                                <ul className="list-disc list-inside space-y-1 mb-2">
                                    <li>Check the <code className="bg-slate-800 px-1 rounded text-white">.env</code> file in your project root.</li>
                                    <li>Key must start with <code className="bg-slate-800 px-1 rounded text-white">AIza</code>.</li>
                                    <li>Restart server: <code className="bg-slate-800 px-1 rounded text-white">Ctrl+C</code> then <code className="bg-slate-800 px-1 rounded text-white">npm run dev</code>.</li>
                                </ul>
                                <a 
                                  href="https://aistudio.google.com/app/apikey" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-400 hover:text-blue-300 underline mt-1"
                                >
                                  Get a valid API Key here
                                  <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                            </div>
                        )}
                    </div>
                  ) : status === AppStatus.SUCCESS ? (
                    <span className="text-emerald-400 flex items-center">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      Complete & Saved
                    </span>
                  ) : (
                    <span>Ready to convert</span>
                  )}
                </div>
                
                <Button 
                  onClick={handleConvert}
                  disabled={!image || status === AppStatus.PROCESSING}
                  isLoading={status === AppStatus.PROCESSING}
                  className={`w-full sm:w-auto min-w-[140px] transition-all duration-300 ${status === AppStatus.ERROR ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-500/30'}`}
                  icon={
                    status === AppStatus.ERROR ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    )
                  }
                >
                  {status === AppStatus.ERROR ? 'Retry' : 'Convert'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col space-y-4 h-full min-h-[400px]">
            {status === AppStatus.SUCCESS || generatedCode ? (
              <>
                <div className="flex-none flex justify-between items-center">
                  <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button
                      onClick={() => setViewMode('preview')}
                      disabled={!selectedFormat.startsWith('html')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        viewMode === 'preview' 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                      title={!selectedFormat.startsWith('html') ? "Preview only available for HTML formats" : ""}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setViewMode('code')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        viewMode === 'code' 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      Source Code
                    </button>
                  </div>

                  <Button variant="outline" onClick={handleDownload} icon={
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }>
                    Download
                  </Button>
                </div>

                <div className="flex-1 min-h-0">
                  {viewMode === 'preview' ? (
                    <PreviewFrame html={generatedCode || ''} />
                  ) : (
                    <CodeViewer code={generatedCode || ''} />
                  )}
                </div>
              </>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center bg-slate-900/30 text-slate-600 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500 via-slate-900 to-slate-900"></div>
                 <div className="relative z-10 flex flex-col items-center">
                   <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700 shadow-lg shadow-red-900/10">
                      <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                   </div>
                   <p className="font-medium text-slate-300">Result will appear here</p>
                   <p className="text-sm mt-2 text-slate-500 max-w-xs text-center px-4">
                     Upload an image and select a format to generate code.
                   </p>
                 </div>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}