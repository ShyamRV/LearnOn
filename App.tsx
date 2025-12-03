import React, { useState } from 'react';
import { AppState, ProcessingError, ProcessedDocument } from './types';
import FileUpload from './components/FileUpload';
import ProcessingStep from './components/ProcessingStep';
import AudioPlayer from './components/AudioPlayer';
import { generateScriptFromDocument, generateAudioFromScript } from './services/geminiService';
import { 
  Headphones, FileText, Activity, AlertOctagon, Cpu, Zap, 
  BookOpen, Clock, Globe, Shield, PlayCircle, ArrowRight, Sparkles, Bot, Music, Star, Heart, BrainCircuit
} from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [data, setData] = useState<ProcessedDocument | null>(null);
  const [error, setError] = useState<ProcessingError | null>(null);

  const handleFileSelect = async (file: File) => {
    setCurrentFile(file);
    setAppState(AppState.ANALYZING);
    setError(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = error => reject(error);
      });

      const script = await generateScriptFromDocument(base64, file.type);
      setAppState(AppState.SYNTHESIZING);
      const audioBuffer = await generateAudioFromScript(script);

      setData({
        originalFileName: file.name,
        script,
        audioBuffer
      });
      setAppState(AppState.READY);

    } catch (err: any) {
      console.error(err);
      setError({ message: err.message || "An unexpected error occurred." });
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setCurrentFile(null);
    setData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/60 backdrop-blur-lg border-b border-white/5 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleReset}>
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-all duration-300">
              <Bot size={24} className="animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-mono group-hover:text-cyan-300 transition-colors">
              LearnOn<span className="text-cyan-400">_AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
             <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
             <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
             <div className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center space-x-2">
               <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
               <span className="text-xs font-mono text-green-400">ONLINE</span>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="container mx-auto px-4 pt-32 pb-12 relative z-10">
        
        <main className="max-w-7xl mx-auto">
          
          {/* Landing / IDLE State */}
          {appState === AppState.IDLE && (
            <div className="flex flex-col items-center animate-fade-in">
              
              {/* Hero Section */}
              <div className="w-full grid lg:grid-cols-2 gap-12 items-center mb-24">
                
                {/* Left: Text */}
                <div className="space-y-8 text-left relative z-10 order-2 lg:order-1">
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-sm font-medium text-cyan-400">
                    <Sparkles size={14} />
                    <span>Your AI Learning Companion</span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                    Understand Smarter, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 glow-text">
                      Learn Faster
                    </span>
                  </h1>
                  
                  <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                    Transform your PDFs and PPTs into clear, audio-based explanations. 
                    No more reading long notes — just upload, listen, and learn effortlessly.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                    <button 
                      onClick={() => document.getElementById('upload-area')?.scrollIntoView({ behavior: 'smooth' })} 
                      className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-full shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center space-x-2 group"
                    >
                      <span>Start Learning Instantly</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium rounded-full border border-slate-700 hover:border-slate-600 transition-all text-center">
                      How It Works
                    </a>
                  </div>
                </div>

                {/* Right: Cute Robot Image */}
                <div className="relative w-full flex items-center justify-center order-1 lg:order-2">
                   <div className="relative w-full max-w-lg mx-auto transform hover:scale-[1.02] transition-transform duration-500">
                      {/* Background Glow */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                      
                      {/* Main Image */}
                      {/* TRYING DIFFERENT STRATEGY: THUMBNAIL ENDPOINT */}
                      <img 
                        src="https://drive.google.com/thumbnail?id=1oNcDneQvshtyUBa9ehr2tA0pjxqWvm8s&sz=w1000"
                        onError={(e) => {
                          // Fallback to a high quality stock image if the user's drive link fails due to permissions
                          e.currentTarget.src = "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop"; 
                          e.currentTarget.onerror = null; // Prevent infinite loop
                        }}
                        referrerPolicy="no-referrer"
                        alt="Cute AI Robot Learning" 
                        className="relative z-10 w-full h-auto rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] border border-white/10 animate-float object-cover bg-slate-800"
                      />
                      
                      {/* Floating Badge */}
                      <div className="absolute -bottom-6 -right-4 glass-panel px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-xl z-20 animate-float-delayed border border-white/20 bg-slate-900/60 backdrop-blur-md">
                          <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/40">
                              <Headphones size={20} fill="currentColor" />
                          </div>
                          <div>
                              <div className="text-xs text-cyan-300 font-mono tracking-wider">STATUS</div>
                              <div className="text-sm font-bold text-white">Learning Active</div>
                          </div>
                      </div>
                      
                       {/* Floating Note Badge */}
                      <div className="absolute -top-6 -left-4 glass-panel px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-xl z-20 animate-float border border-white/20 bg-slate-900/60 backdrop-blur-md">
                           <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/40">
                              <Music size={16} />
                          </div>
                          <span className="text-xs font-bold text-white">Audio Generated</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Upload Section */}
              <div id="upload-area" className="w-full max-w-xl mb-32 scroll-mt-32 relative z-20">
                <FileUpload onFileSelect={handleFileSelect} />
              </div>

              {/* Features Grid */}
              <div id="features" className="w-full max-w-6xl mb-32 scroll-mt-32">
                <div className="text-center mb-16 space-y-4">
                   <h2 className="text-3xl md:text-5xl font-bold text-white">Features</h2>
                   <p className="text-slate-400 text-lg">Everything you need to learn smarter, not harder.</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Cute AI Mascot", desc: "Your friendly guide through complex topics.", icon: Bot, color: "text-cyan-400" },
                    { title: "Instant Upload", desc: "Supports PDF & PPT files seamlessly.", icon: FileText, color: "text-blue-400" },
                    { title: "Auto-Explanation", desc: "AI simplifies hard concepts for you.", icon: BrainCircuit, color: "text-purple-400" },
                    { title: "Natural Voice", desc: "Listen to smooth, human-like speech.", icon: Headphones, color: "text-pink-400" },
                    { title: "Download Notes", desc: "Take your audio lessons anywhere.", icon: PlayCircle, color: "text-green-400" },
                    { title: "Multilingual", desc: "Learn in multiple languages easily.", icon: Globe, color: "text-orange-400" },
                    { title: "Fast & Private", desc: "Your files are processed securely.", icon: Shield, color: "text-emerald-400" },
                    { title: "Simple UI", desc: "Distraction-free, friendly interface.", icon: Heart, color: "text-red-400" },
                  ].map((feat, i) => (
                    <div key={i} className="group glass-panel p-8 rounded-2xl hover:bg-slate-800/60 transition-all duration-300 border-white/5 hover:border-cyan-500/30 hover:-translate-y-2">
                       <div className={`w-14 h-14 bg-slate-900/80 rounded-2xl flex items-center justify-center ${feat.color} mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                         <feat.icon size={28} />
                       </div>
                       <h4 className="text-xl font-bold text-white mb-2">{feat.title}</h4>
                       <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div id="how-it-works" className="w-full max-w-5xl mb-32 scroll-mt-32">
                 <div className="glass-panel rounded-3xl p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-cyan-500/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16 relative z-10">How It Works</h2>
                    
                    <div className="grid md:grid-cols-4 gap-8 relative z-10">
                       {[
                         { step: "01", title: "Upload", desc: "Drop your PDF or PPT file.", icon: FileText },
                         { step: "02", title: "AI Reads", desc: "Our bot simplifies the content.", icon: Cpu },
                         { step: "03", title: "Listen", desc: "Hear clear audio explanations.", icon: Headphones },
                         { step: "04", title: "Learn", desc: "Absorb knowledge effortlessly.", icon: Sparkles }
                       ].map((step, i) => (
                          <div key={i} className="flex flex-col items-center text-center group">
                             <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-cyan-500 transition-colors duration-300">
                                <step.icon size={32} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />
                             </div>
                             <div className="text-xs font-bold text-cyan-500 mb-2 uppercase tracking-wider">Step {step.step}</div>
                             <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                             <p className="text-sm text-slate-400">{step.desc}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* About Section */}
              <div id="about" className="grid md:grid-cols-2 gap-16 items-center mb-32 max-w-5xl scroll-mt-32">
                 <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">About LearnOn</h2>
                    <p className="text-slate-300 text-lg leading-relaxed">
                      LearnOn is a smart learning platform designed to help students, professionals, and lifelong learners understand content more easily.
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                       Upload any PDF or PPT and LearnOn automatically extracts the key points, simplifies the concepts, and converts them into smooth, natural audio so you can learn on the go.
                    </p>
                    <div className="pt-4 flex items-center space-x-4">
                       <div className="flex -space-x-3">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs text-white font-bold">
                             User
                           </div>
                         ))}
                       </div>
                       <div className="text-sm text-slate-400">
                         Joined by thousands of learners
                       </div>
                    </div>
                 </div>
                 <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full"></div>
                    <div className="glass-panel p-8 rounded-3xl border border-white/10 relative transform rotate-3 hover:rotate-0 transition-transform duration-500">
                       <h3 className="text-xl font-bold text-white mb-6">Why LearnOn?</h3>
                       <ul className="space-y-4">
                         {[
                           "Save time & study faster",
                           "Learn while traveling",
                           "Avoid eye-strain",
                           "Revise quickly before exams",
                           "Adapt to your learning style"
                         ].map((item, idx) => (
                           <li key={idx} className="flex items-center space-x-3 text-slate-300">
                              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                              </div>
                              <span>{item}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                 </div>
              </div>

              {/* Developer / Footer */}
              <footer className="w-full border-t border-slate-800/50 pt-16 pb-12 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                 
                 <div className="mb-8">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-6 text-cyan-400">
                       <Bot size={28} />
                    </div>
                    <h4 className="text-white font-bold text-xl mb-3">Designed & Developed by Shyamji Pandey</h4>
                    <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                      A passionate builder focused on AI, robotics, and creating futuristic learning tools.
                    </p>
                 </div>
                 
                 <div className="text-xs text-slate-600 font-mono tracking-wide">
                    © 2025 LEARNON_AI. ALL RIGHTS RESERVED.
                 </div>
              </footer>
            </div>
          )}

          {/* Processing State */}
          {(appState === AppState.ANALYZING || appState === AppState.SYNTHESIZING) && (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
               <ProcessingStep state={appState} />
            </div>
          )}

          {/* Error State */}
          {appState === AppState.ERROR && (
             <div className="min-h-[50vh] flex items-center justify-center animate-fade-in">
               <div className="w-full max-w-md glass-panel border border-red-500/30 p-8 rounded-3xl shadow-2xl text-center">
                  <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertOctagon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
                  <p className="text-slate-400 mb-8 text-sm">{error?.message}</p>
                  <button 
                    onClick={handleReset}
                    className="w-full py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl transition-colors font-medium shadow-lg shadow-red-500/20"
                  >
                    Try Again
                  </button>
               </div>
             </div>
          )}

          {/* Results State */}
          {appState === AppState.READY && data && (
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-8 bg-slate-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur">
                <div>
                   <h2 className="text-2xl font-bold text-white flex items-center">
                     <span className="w-2 h-8 bg-cyan-500 rounded-full mr-3"></span>
                     Learning Session Ready
                   </h2>
                   <p className="text-slate-400 text-sm mt-1 ml-5">
                     {data.originalFileName}
                   </p>
                </div>
                <button 
                  onClick={handleReset} 
                  className="px-6 py-3 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-colors font-medium border border-slate-700 flex items-center space-x-2"
                >
                  <Bot size={16} />
                  <span>New Upload</span>
                </button>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 h-[600px]">
                
                {/* Script View (Left) */}
                <div className="lg:col-span-5 glass-panel rounded-3xl flex flex-col overflow-hidden h-full shadow-2xl">
                   <div className="bg-slate-900/40 px-6 py-5 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-cyan-400">
                        <FileText size={20} />
                        <span className="font-bold">Generated Summary</span>
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-transparent">
                      <p className="text-base leading-8 text-slate-300 whitespace-pre-wrap font-light">
                        {data.script}
                      </p>
                   </div>
                </div>

                {/* Player View (Right) */}
                <div className="lg:col-span-7 flex flex-col h-full space-y-6">
                  <div className="flex-1">
                    <AudioPlayer 
                      audioBuffer={data.audioBuffer || null} 
                      script={data.script}
                      onReset={handleReset}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default App;