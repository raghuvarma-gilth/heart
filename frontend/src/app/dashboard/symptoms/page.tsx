'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import { FiAlertCircle, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const symptomsList = [
  'Chest Pain', 'Shortness of Breath', 'Heart Palpitations', 'Dizziness', 'Fatigue',
  'Swollen Ankles', 'Irregular Heartbeat', 'Nausea', 'Jaw Pain', 'Arm Pain',
  'Back Pain', 'Cold Sweats', 'Headache', 'Fainting', 'Rapid Weight Gain',
  'Persistent Cough', 'Numbness in Legs', 'High Blood Pressure', 'Anxiety', 'Insomnia',
  'Loss of Appetite', 'Excessive Thirst', 'Blurred Vision', 'Chest Tightness', 'Wheezing',
];

export default function SymptomsPage() {
  const { dark } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [search, setSearch] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = symptomsList.filter(s =>
    s.toLowerCase().includes(search.toLowerCase()) && !selected.includes(s)
  );

  const toggleSymptom = (s: string) => {
    setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  };

  const analyze = async () => {
    if (!selected.length) return toast.error('Please select at least one symptom');
    setLoading(true);
    setAnalysis('');
    try {
      const res = await api.grokSymptoms(selected, additionalInfo);
      setAnalysis(res.response || res.error || 'Analysis unavailable');
    } catch {
      setAnalysis('Failed to analyze symptoms');
    }
    setLoading(false);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><FiAlertCircle className="text-teal-400" /> Symptom Checker</h1>
        <p className={`text-sm mb-6 ${dark ? 'text-white/50' : 'text-gray-500'}`}>Select your symptoms for AI-powered health analysis</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Selected */}
          {selected.length > 0 && (
            <div className="glass-card">
              <h2 className="font-semibold mb-3 text-sm">Selected Symptoms ({selected.length})</h2>
              <div className="flex flex-wrap gap-2">
                {selected.map(s => (
                  <motion.button
                    key={s} layout
                    onClick={() => toggleSymptom(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-all"
                  >
                    {s} <FiX className="text-xs" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Search & Select */}
          <div className="glass-card">
            <div className="relative mb-4">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-white/30' : 'text-gray-400'}`} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search symptoms..."
                className={`input-field !pl-10 ${!dark && 'input-field-light'}`}
              />
            </div>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {filtered.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    dark ? 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Additional info */}
          <div className="glass-card">
            <label className={`text-sm font-medium mb-2 block ${dark ? 'text-white/60' : 'text-gray-600'}`}>Additional Information (optional)</label>
            <textarea
              value={additionalInfo}
              onChange={e => setAdditionalInfo(e.target.value)}
              placeholder="Any other details about your symptoms..."
              rows={3}
              className={`input-field resize-none ${!dark && 'input-field-light'}`}
            />
          </div>

          <button onClick={analyze} disabled={loading || !selected.length} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSearch /> Analyze Symptoms</>}
          </button>
        </motion.div>

        {/* Analysis Results */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="glass-card min-h-[400px]">
            <h2 className="font-semibold mb-4 flex items-center gap-2">🤖 AI Analysis</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-4 rounded shimmer" style={{ width: `${90 - i * 8}%` }} />)}
              </div>
            ) : analysis ? (
              <div className={`text-sm leading-relaxed whitespace-pre-wrap ${dark ? 'text-white/70' : 'text-gray-600'}`}>{analysis}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <FiAlertCircle className={`text-5xl mb-4 ${dark ? 'text-white/10' : 'text-gray-200'}`} />
                <p className={`text-sm ${dark ? 'text-white/30' : 'text-gray-400'}`}>Select symptoms and click analyze</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
