import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { bufferToWave } from '../utils/audioUtils';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  script: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, script }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Initialize Duration
  useEffect(() => {
    if (audioBuffer) {
      setDuration(audioBuffer.duration);
    }
  }, [audioBuffer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const initAudio = () => {
    if (!audioBuffer) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Connect nodes
    analyzerRef.current = audioContextRef.current.createAnalyser();
    analyzerRef.current.fftSize = 256;
    
    gainNodeRef.current = audioContextRef.current.createGain();
    
    // Connect analyzer and gain
    // Source -> Analyzer -> Gain -> Destination
  };

  const playAudio = () => {
    if (!audioBuffer) return;
    initAudio();

    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    sourceRef.current = audioContextRef.current!.createBufferSource();
    sourceRef.current.buffer = audioBuffer;

    // Reconnect graph
    sourceRef.current.connect(analyzerRef.current!);
    analyzerRef.current!.connect(gainNodeRef.current!);
    gainNodeRef.current!.connect(audioContextRef.current!.destination);

    // Set start time relative to pause time
    const offset = pauseTimeRef.current;
    sourceRef.current.start(0, offset);
    startTimeRef.current = audioContextRef.current!.currentTime - offset;

    sourceRef.current.onended = () => {
        // Only reset if we naturally reached the end
        if (audioContextRef.current!.currentTime - startTimeRef.current >= audioBuffer.duration - 0.1) {
             setIsPlaying(false);
             pauseTimeRef.current = 0;
             setCurrentTime(0);
        }
    };

    setIsPlaying(true);
    drawVisualizer();
  };

  const pauseAudio = () => {
    if (sourceRef.current && isPlaying) {
      sourceRef.current.stop();
      pauseTimeRef.current = audioContextRef.current!.currentTime - startTimeRef.current;
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
    }
    setIsPlaying(false);
    pauseTimeRef.current = 0;
    setCurrentTime(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const toggleMute = () => {
    if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = isMuted ? 1 : 0;
        setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    pauseTimeRef.current = time;
    if (isPlaying) {
        // Restart at new time
        if (sourceRef.current) sourceRef.current.stop();
        playAudio();
    }
  };

  const drawVisualizer = () => {
    if (!analyzerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) return;
      
      // Update progress
      if (audioContextRef.current) {
          setCurrentTime(audioContextRef.current.currentTime - startTimeRef.current);
      }

      animationRef.current = requestAnimationFrame(draw);
      analyzerRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // Scale down

        // Gradient color based on height
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#22d3ee'); // cyan-400
        gradient.addColorStop(1, '#a855f7'); // purple-500

        ctx.fillStyle = gradient;
        
        // Rounded top bars
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth + 1;
      }
    };

    draw();
  };
  
  const handleDownload = () => {
    if (!audioBuffer) return;
    const blob = bufferToWave(audioBuffer, audioBuffer.length);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learnon_ai_lesson.wav';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format seconds to mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto h-full min-h-[500px]">
      
      {/* Left Panel: Script */}
      <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col h-[500px] lg:h-[600px]">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Generated Lesson Script
        </h3>
        <div className="flex-1 overflow-y-auto pr-2 text-slate-300 leading-relaxed font-light text-lg whitespace-pre-wrap font-sans">
            {script}
        </div>
      </div>

      {/* Right Panel: Player */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-[300px]">
             {/* Visualizer */}
            <div className="flex-1 w-full flex items-end justify-center mb-6 overflow-hidden rounded-lg bg-slate-900/50 relative">
                <div className="absolute top-2 left-2 text-xs font-mono text-cyan-500/50">FREQ.VISUALIZER_V1</div>
                <canvas 
                    ref={canvasRef} 
                    width={500} 
                    height={200}
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
                 {/* Progress Bar */}
                 <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <input 
                        type="range" 
                        min="0" 
                        max={duration} 
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
                    />
                    <span>{formatTime(duration)}</span>
                 </div>

                 <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={togglePlay}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                        >
                            {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                        </button>
                        
                        <button onClick={() => { stopAudio(); playAudio(); }} className="p-2 text-slate-400 hover:text-white transition-colors">
                            <RotateCcw size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                         <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                         </button>
                        
                        <button 
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-all"
                        >
                            <Download size={16} />
                            <span>Download WAV</span>
                        </button>
                    </div>
                 </div>
            </div>
        </div>

        {/* Info Panel */}
        <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col justify-center">
             <h4 className="text-slate-400 text-sm font-mono mb-2">SESSION_INFO</h4>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <p className="text-xs text-slate-500 uppercase">Voice Model</p>
                     <p className="text-cyan-300 font-medium">Gemini 2.5 Preview (Fenrir)</p>
                 </div>
                 <div>
                     <p className="text-xs text-slate-500 uppercase">Sample Rate</p>
                     <p className="text-purple-300 font-medium">24kHz PCM (Upsampled)</p>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;