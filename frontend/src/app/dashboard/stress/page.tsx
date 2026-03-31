'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import { FiActivity, FiPlay, FiPause, FiRefreshCw, FiMusic, FiWind } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StressPage() {
  const { dark } = useTheme();
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathActive, setBreathActive] = useState(false);
  const [medTimer, setMedTimer] = useState(0);
  const [medActive, setMedActive] = useState(false);
  const [medDuration, setMedDuration] = useState(120);
  const [aiPlan, setAiPlan] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const intervalRef = useRef<any>(null);
  const breathRef = useRef<any>(null);

  // Breathing exercise
  useEffect(() => {
    if (!breathActive) { setBreathPhase('idle'); clearInterval(breathRef.current); return; }
    let phase = 0;
    const phases: Array<{ name: 'inhale' | 'hold' | 'exhale'; duration: number }> = [
      { name: 'inhale', duration: 4000 },
      { name: 'hold', duration: 4000 },
      { name: 'exhale', duration: 6000 },
    ];
    const cycle = () => {
      setBreathPhase(phases[phase % 3].name);
      breathRef.current = setTimeout(() => { phase++; cycle(); }, phases[(phase) % 3].duration);
    };
    cycle();
    return () => clearTimeout(breathRef.current);
  }, [breathActive]);

  // Meditation timer
  useEffect(() => {
    if (!medActive) { clearInterval(intervalRef.current); return; }
    setMedTimer(medDuration);
    intervalRef.current = setInterval(() => {
      setMedTimer(p => {
        if (p <= 1) { setMedActive(false); toast.success('Meditation complete! 🧘'); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [medActive, medDuration]);

  const getStressPlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await api.grokStress('moderate', 'relaxation and heart health', '15 minutes');
      setAiPlan(res.response || res.error || 'No plan available');
    } catch { setAiPlan('Could not generate plan'); }
    setLoadingPlan(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const breathScale = breathPhase === 'inhale' ? 1.5 : breathPhase === 'hold' ? 1.5 : breathPhase === 'exhale' ? 1 : 1;
  const breathColor = breathPhase === 'inhale' ? '#457B9D' : breathPhase === 'hold' ? '#E9C46A' : breathPhase === 'exhale' ? '#2A9D8F' : '#457B9D';

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><FiActivity className="text-blue-400" /> Stress Relief Hub</h1>
        <p className={`text-sm mb-6 ${dark ? 'text-white/50' : 'text-gray-500'}`}>Breathing exercises, meditation, and personalized wellness plans</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Breathing Exercise */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card flex flex-col items-center">
          <h2 className="font-semibold mb-2 flex items-center gap-2 self-start"><FiWind /> Breathing Exercise</h2>
          <p className={`text-xs mb-6 self-start ${dark ? 'text-white/40' : 'text-gray-400'}`}>4-4-6 technique: Inhale 4s, Hold 4s, Exhale 6s</p>
          
          <div className="relative w-52 h-52 flex items-center justify-center mb-6">
            <motion.div
              className="absolute rounded-full"
              style={{ background: `${breathColor}15`, border: `2px solid ${breathColor}40` }}
              animate={{ width: breathScale * 180, height: breathScale * 180 }}
              transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'exhale' ? 6 : 0.1, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{ background: `${breathColor}25`, border: `2px solid ${breathColor}60` }}
              animate={{ width: breathScale * 130, height: breathScale * 130 }}
              transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'exhale' ? 6 : 0.1, ease: 'easeInOut', delay: 0.1 }}
            />
            <div className="relative z-10 text-center">
              <p className="text-lg font-bold capitalize" style={{ color: breathColor }}>
                {breathPhase === 'idle' ? 'Ready' : breathPhase}
              </p>
              <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>
                {breathPhase === 'inhale' ? 'Breathe In...' : breathPhase === 'hold' ? 'Hold...' : breathPhase === 'exhale' ? 'Breathe Out...' : 'Press Start'}
              </p>
            </div>
          </div>

          <button onClick={() => setBreathActive(!breathActive)} className={`px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${breathActive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'btn-secondary'}`}>
            {breathActive ? <><FiPause /> Stop</> : <><FiPlay /> Start</>}
          </button>
        </motion.div>

        {/* Meditation Timer */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card flex flex-col items-center">
          <h2 className="font-semibold mb-2 flex items-center gap-2 self-start">🧘 Meditation Timer</h2>
          <p className={`text-xs mb-6 self-start ${dark ? 'text-white/40' : 'text-gray-400'}`}>Set your meditation duration and find your calm</p>

          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              <circle cx="100" cy="100" r="85" fill="none" stroke={dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="8" />
              <motion.circle
                cx="100" cy="100" r="85" fill="none" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 85}
                animate={{ strokeDashoffset: medActive ? 2 * Math.PI * 85 * (1 - medTimer / medDuration) : 0 }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-3xl font-bold">{medActive ? formatTime(medTimer) : formatTime(medDuration)}</p>
              <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>{medActive ? 'remaining' : 'duration'}</p>
            </div>
          </div>

          {!medActive && (
            <div className="flex gap-2 mb-4">
              {[60, 120, 300, 600].map(d => (
                <button key={d} onClick={() => setMedDuration(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${medDuration === d ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : dark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500'}`}>
                  {d < 60 ? `${d}s` : `${d / 60}m`}
                </button>
              ))}
            </div>
          )}

          <button onClick={() => setMedActive(!medActive)} className={`px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${medActive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'}`}>
            {medActive ? <><FiPause /> Stop</> : <><FiPlay /> Start</>}
          </button>
        </motion.div>

        {/* Ambient Music */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><FiMusic /> Ambient Sounds</h2>
          <div className="grid grid-cols-3 gap-3">
            {['🌊 Ocean', '🌧️ Rain', '🌲 Forest', '🔥 Fireplace', '🎵 Calm', '🦗 Night'].map(s => (
              <button key={s} className={`py-4 rounded-xl text-sm font-medium transition-all ${dark ? 'bg-white/5 hover:bg-white/10 text-white/70' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                {s}
              </button>
            ))}
          </div>
          <p className={`text-xs mt-3 ${dark ? 'text-white/30' : 'text-gray-400'}`}>🔊 Connect headphones for best experience</p>
        </motion.div>

        {/* AI Stress Plan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
          <h2 className="font-semibold mb-3 flex items-center gap-2">🤖 AI Wellness Plan</h2>
          <button onClick={getStressPlan} disabled={loadingPlan} className="btn-primary w-full mb-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            {loadingPlan ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiRefreshCw /> Generate Plan</>}
          </button>
          {aiPlan ? (
            <div className={`text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto ${dark ? 'text-white/70' : 'text-gray-600'}`}>{aiPlan}</div>
          ) : (
            <p className={`text-sm text-center py-8 ${dark ? 'text-white/30' : 'text-gray-400'}`}>Click generate to get a personalized stress relief plan</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
