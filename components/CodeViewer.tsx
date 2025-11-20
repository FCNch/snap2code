import React, { useState } from 'react';
import { Button } from './Button';

interface CodeViewerProps {
  code: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
      <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
        <span className="text-sm font-medium text-slate-300">Generated HTML</span>
        <Button 
          variant="ghost" 
          onClick={handleCopy}
          className="text-xs h-8"
        >
          {copied ? (
            <span className="text-emerald-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </span>
          ) : 'Copy Code'}
        </Button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <pre className="absolute inset-0 overflow-auto p-4 text-sm font-mono text-slate-300 bg-slate-900">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
