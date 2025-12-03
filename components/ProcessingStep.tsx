import React from 'react';
import { Loader2, Sparkles, Cpu } from 'lucide-react';
import { AppState } from '../types';

interface ProcessingStepProps {
  state: AppState;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({ state }) => {
  const isAnalyzing = state === AppState.ANALYZING;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-2xl mx-auto glass-panel rounded-2xl p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Robot Icon / Main Graphic */}
        <div className="relative w-32 h-32 mb-8">
           {/* Orbit rings */}
          <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
          <div className="absolute inset-2 border border-purple-500/30 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
          
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded-full border border-slate-700 shadow-xl">
             {isAnalyzing ? (
                 <Cpu className="w-12 h-12 text-cyan-400 animate-pulse" />
             ) : (
                 <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
             )}
          </div>
        </div>

        {/* Status Text */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3 animate-pulse">
          {isAnalyzing ? 'Analyzing Document' : 'Synthesizing Audio'}
        </h2>
        
        <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-mono">
             {isAnalyzing 
              ? 'Extracting key concepts & simplifying...' 
              : 'Generating neural speech & visualizer data...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStep;