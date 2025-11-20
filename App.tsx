import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { PreviewFrame } from './components/PreviewFrame';
import { CodeViewer } from './components/CodeViewer';
import { Button } from './components/Button';
import { HistorySidebar } from './components/HistorySidebar';
import { AppStatus, ImageFile, HistoryItem } from './types';
import { generateHtmlFromImage } from './services/geminiService';
import { saveToHistory, getHistory, deleteFromHistory } from './services/db';

export default function App() {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [image, setImage] = useState<ImageFile | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  
  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistoryItems(items);
  };

  const handleImageSelect = (selectedImage: ImageFile) => {
    setImage(selectedImage);
    setStatus(AppStatus.PREVIEWING);
    setGeneratedCode(null);
  };

  const handleReset = () => {
    setImage(null);
    setGeneratedCode(null);
    setStatus(AppStatus.IDLE);
  };

  const handleConvert = async () => {
    if (!image) return;
    
    setStatus(AppStatus.PROCESSING);
    
    try {
      const result = await generateHtmlFromImage(image.base64, image.mimeType);
      setGeneratedCode(result.html);
      setStatus(AppStatus.SUCCESS);

      // Auto-save to History DB
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageName: image.file.name,
        html: result.html,
        previewBase64: image.base64,
        mimeType: image.mimeType
      };
      
      await saveToHistory(newItem);
      await loadHistory(); // Refresh list

    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    // Reconstruct ImageFile object
    // Note: We can't fully reconstruct the 'File' object easily without fetching, 
    // but for our app's purposes, we mostly need the base64 and previewUrl.
    // We'll mock the File object or adjust types if strictly needed, 
    // but since ImageUploader uses it primarily for display name and size, we can create a dummy.
    
    const dummyFile = new File([""], item.imageName, { type: item.mimeType });
    
    const imageFile: ImageFile = {
      file: dummyFile,
      previewUrl: `data:${item.mimeType};base64,${item.previewBase64}`,
      base64: item.previewBase64,
      mimeType: item.mimeType
    };

    setImage(imageFile);
    setGeneratedCode(item.html);
    setStatus(AppStatus.SUCCESS);
    setViewMode('preview');
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteFromHistory(id);
      await loadHistory();
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              C
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              CloneUI
            </span>
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
                Clone any <span className="text-blue-400">Design</span>
              </h1>
              <p className="text-slate-400">
                Upload a screenshot or interface design. We'll clone the colors, layout, and details into production-ready HTML.
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
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-400">
                  {status === AppStatus.PROCESSING ? (
                    <span className="flex items-center text-blue-400">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      Extracting colors & cloning layout...
                    </span>
                  ) : status === AppStatus.ERROR ? (
                    <span className="text-red-400">Error converting image. Please try again.</span>
                  ) : status === AppStatus.SUCCESS ? (
                    <span className="text-emerald-400 flex items-center">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      Clone Complete & Saved
                    </span>
                  ) : (
                    <span>Ready to clone</span>
                  )}
                </div>
                
                <Button 
                  onClick={handleConvert}
                  disabled={!image || status === AppStatus.PROCESSING}
                  isLoading={status === AppStatus.PROCESSING}
                  className="w-full sm:w-auto min-w-[140px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  }
                >
                  Convert to Code
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
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        viewMode === 'preview' 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
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
                    Download HTML
                  </Button>
                </div>

                <div className="flex-1 min-h-0">
                  {viewMode === 'preview' ? (
                    <PreviewFrame html={generatedCode} />
                  ) : (
                    <CodeViewer code={generatedCode} />
                  )}
                </div>
              </>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center bg-slate-900/30 text-slate-600 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-slate-900"></div>
                 <div className="relative z-10 flex flex-col items-center">
                   <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
                      <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                   </div>
                   <p className="font-medium text-slate-300">Result will appear here</p>
                   <p className="text-sm mt-2 text-slate-500 max-w-xs text-center px-4">
                     Upload an image and watch the AI recreate it pixel-by-pixel using Tailwind CSS.
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