'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import { FiActivity, FiPlay, FiPause, FiRefreshCw, FiMusic, FiWind, FiTarget, FiStar, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

// ─── Bubble Pop Game ───
function BubblePopGame({ dark }: { dark: boolean }) {
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; popped: boolean }>>([]);
  const [score, setScore] = useState(0);
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const colors = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#7C3AED', '#F4A261'];

  const spawnBubble = useCallback(() => {
    setBubbles(prev => [...prev.slice(-14), {
      id: Date.now() + Math.random(),
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 70,
      size: 30 + Math.random() * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      popped: false,
    }]);
  }, []);

  useEffect(() => {
    if (!active) return;
    const spawn = setInterval(spawnBubble, 800);
    const timer = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { setActive(false); toast.success(`🫧 You popped ${score} bubbles! Great stress relief!`); return 30; }
      return p - 1;
    }), 1000);
    return () => { clearInterval(spawn); clearInterval(timer); };
  }, [active, spawnBubble, score]);

  const pop = (id: number) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    setScore(s => s + 1);
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 300);
  };

  const start = () => { setBubbles([]); setScore(0); setTimeLeft(30); setActive(true); };

  return (
    <div className="glass-card">
      <h2 className="font-semibold mb-2 flex items-center gap-2"><FiTarget className="text-red-400" /> Bubble Pop</h2>
      <p className={`text-xs mb-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>Pop bubbles to release tension — focus on each pop!</p>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium ${dark ? 'text-white/50' : 'text-gray-500'}`}>Score: <span className="text-red-400 font-bold">{score}</span></span>
        {active && <span className={`text-xs font-medium ${dark ? 'text-white/50' : 'text-gray-500'}`}>⏱ {timeLeft}s</span>}
      </div>
      <div className={`relative rounded-xl overflow-hidden mb-3 ${dark ? 'bg-white/5' : 'bg-gray-50'}`} style={{ height: 220 }}>
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <button onClick={start} className="btn-primary text-sm"><FiPlay className="mr-1" /> {score > 0 ? 'Play Again' : 'Start Game'}</button>
          </div>
        )}
        <AnimatePresence>
          {bubbles.map(b => (
            <motion.div
              key={b.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: b.popped ? 1.5 : 1, opacity: b.popped ? 0 : 0.85 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => active && !b.popped && pop(b.id)}
              className="absolute rounded-full cursor-pointer hover:scale-110 transition-transform"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size, background: `radial-gradient(circle at 30% 30%, ${b.color}90, ${b.color}50)`, border: `2px solid ${b.color}`, boxShadow: `0 0 15px ${b.color}30` }}
            />
          ))}
        </AnimatePresence>
      </div>
      <p className={`text-[11px] ${dark ? 'text-white/30' : 'text-gray-400'}`}>💡 Popping motions help release physical tension in your hands and reduce cortisol</p>
    </div>
  );
}

// ─── Color Match Memory Game ───
function ColorMatchGame({ dark }: { dark: boolean }) {
  const palette = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#7C3AED', '#F4A261'];
  const [cards, setCards] = useState<Array<{ id: number; color: string; flipped: boolean; matched: boolean }>>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const initGame = () => {
    const picked = palette.slice(0, 6);
    const pairs = [...picked, ...picked].sort(() => Math.random() - 0.5).map((color, i) => ({ id: i, color, flipped: false, matched: false }));
    setCards(pairs);
    setFlipped([]);
    setMoves(0);
    setWon(false);
  };

  useEffect(() => { initGame(); }, []);

  const flip = (id: number) => {
    if (flipped.length === 2) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].color === newCards[b].color) {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === a || c.id === b ? { ...c, matched: true } : c));
          setFlipped([]);
          if (newCards.filter(c => !c.matched && c.id !== a && c.id !== b).length === 0) {
            setWon(true);
            toast.success(`🧠 Matched all in ${moves + 1} moves! Memory exercise reduces anxiety.`);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === a || c.id === b ? { ...c, flipped: false } : c));
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold flex items-center gap-2"><FiStar className="text-yellow-400" /> Color Match</h2>
        <button onClick={initGame} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${dark ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}><FiRefreshCw className="inline mr-1" size={12} />Reset</button>
      </div>
      <p className={`text-xs mb-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>Match pairs to train focus — mindful concentration lowers heart rate</p>
      <div className="flex items-center gap-4 mb-3">
        <span className={`text-xs ${dark ? 'text-white/50' : 'text-gray-500'}`}>Moves: <span className="font-bold text-purple-400">{moves}</span></span>
        {won && <span className="text-xs text-green-400 font-medium">✨ Complete!</span>}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map(card => (
          <motion.div
            key={card.id}
            onClick={() => flip(card.id)}
            className="aspect-square rounded-xl cursor-pointer flex items-center justify-center text-lg font-bold transition-all"
            animate={{ rotateY: card.flipped || card.matched ? 0 : 180 }}
            style={{
              background: card.flipped || card.matched ? card.color + '30' : dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: `2px solid ${card.flipped || card.matched ? card.color + '60' : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              opacity: card.matched ? 0.5 : 1,
            }}
          >
            {(card.flipped || card.matched) && <div className="w-4 h-4 rounded-full" style={{ background: card.color }} />}
          </motion.div>
        ))}
      </div>
      <p className={`text-[11px] mt-3 ${dark ? 'text-white/30' : 'text-gray-400'}`}>💡 Memory games activate the prefrontal cortex, shifting focus away from stress</p>
    </div>
  );
}

// ─── Gratitude Jar ───
function GratitudeJar({ dark }: { dark: boolean }) {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const jarColors = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#7C3AED', '#F4A261', '#FF6B6B', '#4ECDC4'];

  const add = () => {
    if (!input.trim()) return;
    setItems(prev => [input.trim(), ...prev]);
    setInput('');
    toast.success('💖 Gratitude noted! Positive thinking lowers blood pressure.');
  };

  return (
    <div className="glass-card">
      <h2 className="font-semibold mb-2 flex items-center gap-2"><FiHeart className="text-pink-400" /> Gratitude Jar</h2>
      <p className={`text-xs mb-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>Write what you're thankful for — gratitude practice reduces stress hormones</p>
      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="I'm grateful for..."
          className={`input-field text-sm flex-1 ${!dark && 'input-field-light'}`}
        />
        <button onClick={add} className="btn-primary text-sm px-4">Add</button>
      </div>
      <div className={`relative rounded-xl p-4 min-h-[140px] overflow-hidden ${dark ? 'bg-white/5' : 'bg-pink-50/50'}`} style={{ border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(236,72,153,0.15)'}` }}>
        {items.length === 0 ? (
          <p className={`text-sm text-center py-8 ${dark ? 'text-white/20' : 'text-gray-300'}`}>Your gratitude notes will appear here ✨</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-block px-3 py-1.5 rounded-full text-xs font-medium text-white"
                style={{ background: jarColors[i % jarColors.length] + 'CC' }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        )}
      </div>
      <p className={`text-[11px] mt-3 ${dark ? 'text-white/30' : 'text-gray-400'}`}>💡 Studies show gratitude journaling reduces cortisol by 23% and improves heart health</p>
    </div>
  );
}

// ─── Main Stress Page ───
export default function StressPage() {
  const { dark } = useTheme();
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathActive, setBreathActive] = useState(false);
  const [medTimer, setMedTimer] = useState(0);
  const [medActive, setMedActive] = useState(false);
  const [medDuration, setMedDuration] = useState(120);
  const [aiPlan, setAiPlan] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(false);
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
        <p className={`text-sm mb-6 ${dark ? 'text-white/50' : 'text-gray-500'}`}>Breathing exercises, meditation, games, and personalized wellness plans</p>
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

        {/* Bubble Pop Game */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <BubblePopGame dark={dark} />
        </motion.div>

        {/* Color Match */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ColorMatchGame dark={dark} />
        </motion.div>

        {/* Gratitude Jar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GratitudeJar dark={dark} />
        </motion.div>

        {/* AI Stress Plan — full width */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card lg:col-span-2">
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
