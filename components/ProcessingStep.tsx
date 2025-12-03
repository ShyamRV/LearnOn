import React, { useEffect, useState, useRef } from 'react';
import { Bot, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppState } from '../types';

interface ProcessingStepProps {
  state: AppState;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({ state }) => {
  const [message, setMessage] = useState("");
  
  const analysisMessages = [
    "Reading your document...",
    "Understanding key concepts...",
    "Simplifying complex terms...",
    "Drafting the perfect summary...",
  ];

  const synthesisMessages = [
    "Warming up voice engine...",
    "Converting text to speech...",
    "Polishing audio quality...",
    "Almost ready for you...",
  ];

  useEffect(() => {
    let interval: any;
    let messages = state === AppState.ANALYZING ? analysisMessages : synthesisMessages;
    let index = 0;

    setMessage(messages[0]);

    interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, [state]);

  if (state !== AppState.ANALYZING && state !== AppState.SYNTHESIZING) return null;

  return (
    <div className="w-full max-w-lg mx-auto my-12 text-center">
      <div className="relative mb-8 inline-block">
        {/* Pulsing rings */}
        <div className="absolute inset-0 bg-cyan-500/30 rounded-full animate-ping"></div>
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-pulse delay-75"></div>
        
        <div className="relative w-32 h-32 bg-slate-900 rounded-full border-4 border-cyan-500 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)]">
          <Bot size={64} className="text-cyan-400 animate-bounce" strokeWidth={1.5} />
        </div>
        
        {/* Orbiting particles */}
        <div className="absolute top-0 left-0 w-full h-full animate-spin-slow pointer-events-none">
           <div className="absolute top-0 left-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 transform -translate-x-1/2 -translate-y-2"></div>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">
        {state === AppState.ANALYZING ? "Analyzing Content..." : "Creating Audio..."}
      </h3>
      
      <div className="inline-flex items-center space-x-2 text-cyan-300 bg-cyan-950/30 px-4 py-2 rounded-full border border-cyan-500/20">
        <Sparkles size={14} className="animate-spin-slow" />
        <span className="text-sm font-medium">{message}</span>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 w-64 mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-1/2 animate-progress rounded-full"></div>
      </div>
    </div>
  );
};

export default ProcessingStep;