import React, { useState } from 'react';
import { Bot, Sparkles, BrainCircuit, Headphones, ChevronRight, RefreshCw } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ProcessingStep from './components/ProcessingStep';
import AudioPlayer from './components/AudioPlayer';
import { AppState, FileData } from './types';
import { analyzeDocument, synthesizeAudio } from './services/geminiService';
import { decodeRawPCM } from './utils/audioUtils';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelect = async (file: FileData) => {
    try {
      setAppState(AppState.ANALYZING);
      setErrorMsg('');

      // Step 1: Analyze Document
      const script = await analyzeDocument(file);
      setGeneratedScript(script);
      
      setAppState(AppState.SYNTHESIZING);

      // Step 2: Synthesize Audio
      const rawAudioData = await synthesizeAudio(script);
      
      // Step 3: Decode Raw PCM
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = decodeRawPCM(rawAudioData, audioCtx, 24000); // 24kHz for Gemini Preview TTS
      
      setAudioBuffer(buffer);
      setAppState(AppState.READY);

    } catch (err: any) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "An unexpected error occurred processing your file.");
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setGeneratedScript('');
    setAudioBuffer(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black selection:bg-cyan-500/30 text-slate-200">
      
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg">
            <Bot className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LearnOn<span className="text-cyan-400">_AI</span></span>
        </div>
        
        {appState !== AppState.IDLE && (
           <button 
             onClick={handleReset}
             className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
           >
             <RefreshCw className="w-4 h-4" />
             Start Over
           </button>
        )}
      </nav>

      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        
        {/* Render content based on state */}
        {appState === AppState.IDLE && (
          <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-4">
                 <Sparkles className="w-3 h-3" />
                 Powered by Gemini 2.5 Flash
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 pb-2">
                Understand Smarter.<br />
                <span className="text-cyan-400">Learn Faster.</span>
              </h1>
              
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Transform your boring PDFs and PowerPoints into engaging, podcast-style audio lessons. 
                Perfect for auditory learners and busy professionals.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
               <FeatureCard 
                 icon={<BrainCircuit className="w-6 h-6 text-purple-400" />}
                 title="AI Analysis"
                 desc="Extracts key concepts and simplifies complex jargon."
               />
               <FeatureCard 
                 icon={<Bot className="w-6 h-6 text-cyan-400" />}
                 title="Natural TTS"
                 desc="Uses Gemini 2.5 Preview for lifelike, neural intonation."
               />
               <FeatureCard 
                 icon={<Headphones className="w-6 h-6 text-emerald-400" />}
                 title="Audio Learning"
                 desc="Listen on the go. Download WAV files for later."
               />
            </div>

            {/* Upload Area */}
            <div className="w-full flex justify-center">
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        )}

        {(appState === AppState.ANALYZING || appState === AppState.SYNTHESIZING) && (
          <ProcessingStep state={appState} />
        )}

        {appState === AppState.READY && (
          <div className="w-full animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Your Lesson is Ready</h2>
              <p className="text-slate-400">Listen to the generated summary or read along with the script.</p>
            </div>
            <AudioPlayer audioBuffer={audioBuffer} script={generatedScript} />
          </div>
        )}

        {appState === AppState.ERROR && (
           <div className="text-center max-w-md glass-panel p-8 rounded-2xl border-red-900/50 bg-red-900/10">
              <h3 className="text-xl font-bold text-red-400 mb-2">Processing Error</h3>
              <p className="text-slate-300 mb-6">{errorMsg}</p>
              <button 
                onClick={handleReset}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
              >
                Try Again
              </button>
           </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} LearnOn AI. Built with Gemini API & React.</p>
        </div>
      </footer>
    </div>
  );
};

// Helper Component for Features
const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="glass-panel p-6 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all duration-300 group">
    <div className="mb-4 p-3 bg-slate-800 rounded-lg inline-block group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2 font-mono">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default App;