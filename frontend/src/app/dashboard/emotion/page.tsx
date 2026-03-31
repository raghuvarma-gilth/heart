'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { analyzeEmotionWithGroq, api } from '@/lib/api';
import { FiSmile, FiCamera, FiRefreshCw, FiStopCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const emotionEmojis: Record<string, string> = {
  happy: '😊', sad: '😢', angry: '😠', surprised: '😲', fearful: '😨',
  disgusted: '🤢', neutral: '😐', stressed: '😰', anxious: '😟', calm: '😌',
};

export default function EmotionPage() {
  const { dark } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [emotion, setEmotion] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStreaming(true);
      }
    } catch {
      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setAnalyzing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;
    ctx?.drawImage(videoRef.current, 0, 0, 640, 480);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = dataUrl.split(',')[1];

    try {
      const result = await analyzeEmotionWithGroq(base64);
      setEmotion(result);
      if (result.emotion && result.emotion !== 'neutral') {
        setLoadingInsight(true);
        const insight = await api.grokEmotion(result.emotion, result.confidence || 0);
        setAiInsight(insight.response || insight.error || '');
        setLoadingInsight(false);
      }
    } catch {
      toast.error('Emotion analysis failed');
    }
    setAnalyzing(false);
  }, []);

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><FiSmile className="text-amber-400" /> Emotion AI Detection</h1>
        <p className={`text-sm mb-6 ${dark ? 'text-white/50' : 'text-gray-500'}`}>Real-time facial emotion detection powered by Gemini AI</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card">
          <div className={`relative rounded-xl overflow-hidden mb-4 aspect-video ${dark ? 'bg-black/30' : 'bg-gray-100'}`}>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {!streaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <FiCamera className={`text-5xl mb-3 ${dark ? 'text-white/20' : 'text-gray-300'}`} />
                <p className={`text-sm ${dark ? 'text-white/30' : 'text-gray-400'}`}>Camera preview</p>
              </div>
            )}
            {analyzing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!streaming ? (
              <button onClick={startCamera} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                <FiCamera /> Start Camera
              </button>
            ) : (
              <>
                <button onClick={captureAndAnalyze} disabled={analyzing} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {analyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiRefreshCw /> Analyze</>}
                </button>
                <button onClick={stopCamera} className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium">
                  <FiStopCircle />
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Emotion Result */}
          <div className="glass-card text-center">
            <h2 className="font-semibold mb-4 text-left">Detected Emotion</h2>
            {emotion ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="text-6xl mb-3">{emotionEmojis[emotion.emotion] || '😐'}</div>
                <p className="text-xl font-bold capitalize mb-1">{emotion.emotion}</p>
                <p className={`text-sm ${dark ? 'text-white/40' : 'text-gray-400'}`}>{emotion.confidence}% confidence</p>
                <div className="w-full max-w-xs mx-auto mt-3 h-2 rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${emotion.confidence || 0}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </motion.div>
            ) : (
              <div className="py-8">
                <p className={`text-5xl mb-3`}>🎭</p>
                <p className={`text-sm ${dark ? 'text-white/30' : 'text-gray-400'}`}>Start camera and analyze to detect emotion</p>
              </div>
            )}
          </div>

          {/* AI Insight */}
          <div className="glass-card">
            <h2 className="font-semibold mb-3 flex items-center gap-2">🤖 AI Wellness Insight</h2>
            {loadingInsight ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-4 rounded shimmer" style={{ width: `${85 - i * 10}%` }} />)}
              </div>
            ) : aiInsight ? (
              <div className={`text-sm leading-relaxed whitespace-pre-wrap ${dark ? 'text-white/70' : 'text-gray-600'}`}>{aiInsight}</div>
            ) : (
              <p className={`text-sm text-center py-6 ${dark ? 'text-white/30' : 'text-gray-400'}`}>Emotion insights will appear here after analysis</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
