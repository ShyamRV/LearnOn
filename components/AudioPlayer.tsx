import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, RefreshCw, Volume2, VolumeX, Activity, FileText } from 'lucide-react';
import { bufferToWave } from '../utils/audioUtils';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  script: string;
  onReset: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, script, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    if (audioBuffer) {
      setDuration(audioBuffer.duration);
      stopAudio();
      pauseTimeRef.current = 0;
      setCurrentTime(0);
    }
    return () => stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBuffer]);

  const playAudio = () => {
    if (!audioBuffer) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = isMuted ? 0 : 1;
    
    const analyzer = ctx.createAnalyser();
    analyzer.fftSize = 512; // Higher resolution for visualizer

    source.connect(gainNode);
    gainNode.connect(analyzer);
    analyzer.connect(ctx.destination);

    sourceNodeRef.current = source;
    gainNodeRef.current = gainNode;
    analyzerRef.current = analyzer;

    const offset = pauseTimeRef.current;
    source.start(0, offset);
    startTimeRef.current = ctx.currentTime - offset;

    source.onended = () => {
       if (ctx.currentTime - startTimeRef.current >= audioBuffer.duration - 0.1) {
         setIsPlaying(false);
         pauseTimeRef.current = 0;
         setCurrentTime(0);
       }
    };

    setIsPlaying(true);
    drawVisualizer();
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current && audioContextRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
      pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      setIsPlaying(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    const wasPlaying = isPlaying;
    
    if (wasPlaying) pauseAudio();
    pauseTimeRef.current = time;
    setCurrentTime(time);
    if (wasPlaying) playAudio();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = !isMuted ? 0 : 1;
    }
  };

  const downloadAudio = () => {
    if (!audioBuffer) return;
    const blob = bufferToWave(audioBuffer, audioBuffer.length);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DocuVoice_AI_Output.wav';
    a.click();
    URL.revokeObjectURL(url);
  };

  const drawVisualizer = () => {
    if (!analyzerRef.current || !canvasRef.current) return;
    
    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!isPlaying) return;
      animationFrameRef.current = requestAnimationFrame(render);
      
      // Update time
      if (audioContextRef.current) {
         let curr = audioContextRef.current.currentTime - startTimeRef.current;
         if (curr > duration) curr = duration;
         setCurrentTime(curr);
      }

      analyzerRef.current!.getByteFrequencyData(dataArray);

      const width = canvasRef.current!.width;
      const height = canvasRef.current!.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5;
        
        // Neon Gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#06b6d4'); // Cyan-500
        gradient.addColorStop(1, '#8b5cf6'); // Violet-500
        
        ctx.fillStyle = gradient;
        
        // Rounded bars logic simplified
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    render();
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="w-full h-full flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Header / Info */}
      <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Activity size={18} />
          <span className="font-mono text-sm tracking-wider">AUDIO SYNTHESIS ENGINE</span>
        </div>
        <div className="text-xs font-mono text-slate-500">
          GEMINI-2.5-FLASH
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="relative h-48 bg-black/50 w-full flex items-center justify-center border-b border-slate-800">
        <canvas ref={canvasRef} width={800} height={192} className="w-full h-full" />
        
        {!isPlaying && audioBuffer && currentTime === 0 && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
             <button 
                onClick={togglePlay}
                className="group flex items-center space-x-3 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
             >
                <Play size={20} fill="currentColor" />
                <span>INITIATE PLAYBACK</span>
             </button>
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-slate-900/40">
        <div className="flex flex-col space-y-6">
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-4 font-mono text-xs text-cyan-500/80">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1 relative h-1 bg-slate-800 rounded-full overflow-hidden group cursor-pointer">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-100 ease-linear"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              ></div>
            </div>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <button 
                onClick={togglePlay}
                disabled={!audioBuffer}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 text-white hover:bg-slate-700 hover:text-cyan-400 transition-colors border border-slate-700"
               >
                 {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
               </button>
               
               <button onClick={toggleMute} className="text-slate-500 hover:text-cyan-400 transition-colors">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
               </button>
            </div>

            <div className="flex items-center space-x-2">
               <button 
                 onClick={downloadAudio}
                 disabled={!audioBuffer}
                 className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-sm font-medium border border-slate-700"
               >
                 <Download size={16} />
                 <span className="hidden sm:inline">Export WAV</span>
               </button>
               
               <button 
                 onClick={onReset}
                 className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-red-900/30"
                 title="Reset System"
               >
                 <RefreshCw size={18} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;