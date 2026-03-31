'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import { FiHeart, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const fields = [
  { key: 'age', label: 'Age', type: 'number', placeholder: '55', min: 1, max: 120 },
  { key: 'sex', label: 'Sex', type: 'select', options: [{ v: '1', l: 'Male' }, { v: '0', l: 'Female' }] },
  { key: 'cp', label: 'Chest Pain Type', type: 'select', options: [{ v: '0', l: 'Typical Angina' }, { v: '1', l: 'Atypical Angina' }, { v: '2', l: 'Non-Anginal' }, { v: '3', l: 'Asymptomatic' }] },
  { key: 'trestbps', label: 'Resting BP (mmHg)', type: 'number', placeholder: '130', min: 60, max: 250 },
  { key: 'chol', label: 'Cholesterol (mg/dl)', type: 'number', placeholder: '240', min: 100, max: 600 },
  { key: 'fbs', label: 'Fasting Blood Sugar > 120', type: 'select', options: [{ v: '0', l: 'No' }, { v: '1', l: 'Yes' }] },
  { key: 'restecg', label: 'Resting ECG', type: 'select', options: [{ v: '0', l: 'Normal' }, { v: '1', l: 'ST-T Abnormality' }, { v: '2', l: 'LV Hypertrophy' }] },
  { key: 'thalach', label: 'Max Heart Rate', type: 'number', placeholder: '150', min: 50, max: 220 },
  { key: 'exang', label: 'Exercise Angina', type: 'select', options: [{ v: '0', l: 'No' }, { v: '1', l: 'Yes' }] },
  { key: 'oldpeak', label: 'ST Depression', type: 'number', placeholder: '1.5', min: 0, max: 7, step: 0.1 },
  { key: 'slope', label: 'ST Slope', type: 'select', options: [{ v: '0', l: 'Downsloping' }, { v: '1', l: 'Flat' }, { v: '2', l: 'Upsloping' }] },
  { key: 'ca', label: 'Major Vessels (0-4)', type: 'select', options: [{ v: '0', l: '0' }, { v: '1', l: '1' }, { v: '2', l: '2' }, { v: '3', l: '3' }, { v: '4', l: '4' }] },
  { key: 'thal', label: 'Thalassemia', type: 'select', options: [{ v: '0', l: 'Normal' }, { v: '1', l: 'Fixed Defect' }, { v: '2', l: 'Reversible Defect' }, { v: '3', l: 'Other' }] },
];

export default function PredictPage() {
  const { dark } = useTheme();
  const [form, setForm] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [backendError, setBackendError] = useState('');

  const handleChange = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handlePredict = async () => {
    const missing = fields.filter(f => form[f.key] === undefined || form[f.key] === '');
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing.slice(0, 3).map(m => m.label).join(', ')}${missing.length > 3 ? ` (+${missing.length - 3} more)` : ''}`);
      return;
    }
    setLoading(true);
    setResult(null);
    setAiExplanation('');
    setBackendError('');
    try {
      const data: Record<string, number> = {};
      fields.forEach(f => { data[f.key] = parseFloat(form[f.key]); });
      const res = await api.predict(data);
      if (res.error) { setBackendError(res.error); toast.error(res.error); setLoading(false); return; }
      setResult(res);
      toast.success('Prediction complete!');
      setLoading(false);
      // Fetch Groq AI explanation (direct from frontend)
      setExplaining(true);
      try {
        const exp = await api.grokExplain(res, data);
        setAiExplanation(exp.response || exp.error || 'AI explanation unavailable.');
      } catch { setAiExplanation('AI explanation unavailable. Check your Groq API key.'); }
      setExplaining(false);
    } catch (err: any) {
      setLoading(false);
      if (err.message?.includes('fetch') || err.name === 'TypeError') {
        setBackendError('Cannot connect to backend. Start Flask server: python app.py');
        toast.error('Backend not running!');
      } else { toast.error(err.message || 'Prediction failed'); }
    }
  };

  const fillSample = () => {
    setForm({ age: '55', sex: '1', cp: '2', trestbps: '140', chol: '260', fbs: '0', restecg: '1', thalach: '145', exang: '1', oldpeak: '2.3', slope: '1', ca: '1', thal: '2' });
    toast.success('Sample data filled!');
  };

  const riskColor = result?.risk_level === 'High' ? '#E63946' : result?.risk_level === 'Medium' ? '#F4A261' : '#2A9D8F';
  const RiskIcon = result?.risk_level === 'High' ? FiAlertTriangle : result?.risk_level === 'Low' ? FiCheckCircle : FiInfo;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FiHeart className="text-red-400" /> Heart Risk Prediction</h1>
          <p className={`text-sm mt-1 ${dark ? 'text-white/60' : 'text-gray-500'}`}>Enter medical data for AI-powered cardiac risk analysis</p>
        </div>
        <button onClick={fillSample} className={`text-xs px-4 py-2.5 rounded-lg font-semibold transition-colors ${dark ? 'bg-white/10 text-white/70 hover:bg-white/15' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          📋 Sample Data
        </button>
      </div>

      {backendError && (
        <div className={`mb-4 p-4 rounded-xl text-sm ${dark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
          <p className="font-semibold text-red-500 flex items-center gap-2"><FiAlertTriangle /> Backend Connection Error</p>
          <p className={`text-xs mt-1 ${dark ? 'text-red-400/70' : 'text-red-400'}`}>{backendError}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass-card">
          <h2 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Medical Information</h2>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key}>
                <label className={`text-xs font-semibold mb-1.5 block ${dark ? 'text-white/70' : 'text-gray-600'}`}>{f.label}</label>
                {f.type === 'select' ? (
                  <select value={form[f.key] ?? ''} onChange={e => handleChange(f.key, e.target.value)} className={`input-field text-sm ${!dark && 'input-field-light'}`}>
                    <option value="">Select</option>
                    {f.options?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ) : (
                  <input type="number" value={form[f.key] ?? ''} onChange={e => handleChange(f.key, e.target.value)} placeholder={f.placeholder} min={f.min} max={f.max} step={f.step || 1} className={`input-field text-sm ${!dark && 'input-field-light'}`} />
                )}
              </div>
            ))}
          </div>
          <button onClick={handlePredict} disabled={loading} className="btn-primary w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiHeart /> Analyze Risk</>}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card">
              <h2 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Results</h2>
              {/* Gauge */}
              <div className="flex justify-center mb-4">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                    <circle cx="100" cy="100" r="80" fill="none" stroke={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} strokeWidth="14" />
                    <motion.circle cx="100" cy="100" r="80" fill="none" stroke={riskColor} strokeWidth="14" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 80}
                      initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - (result.probability || 0) / 100) }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color: riskColor }}>{result.probability}%</span>
                    <span className={`text-xs ${dark ? 'text-white/50' : 'text-gray-400'}`}>probability</span>
                  </div>
                </div>
              </div>
              {/* Prediction result */}
              <div className="text-center mb-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold" style={{ background: `${riskColor}20`, color: riskColor }}>
                  <RiskIcon /> {result.prediction}
                </span>
              </div>
              <p className={`text-center text-sm font-medium ${dark ? 'text-white/70' : 'text-gray-600'}`}>{result.risk_level} Risk Level</p>
              {/* Recommendation */}
              {result.recommendation && (
                <div className={`mt-4 p-3 rounded-xl text-sm ${dark ? 'bg-white/5 text-white/70' : 'bg-gray-50 text-gray-600'}`}>
                  {result.recommendation}
                </div>
              )}
              {result.model_accuracy > 0 && (
                <p className={`text-center text-xs mt-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>Model Accuracy: {(result.model_accuracy * 100).toFixed(1)}%</p>
              )}
            </motion.div>
          )}

          {(explaining || aiExplanation) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
              <h2 className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-800'}`}>🤖 AI Health Insights</h2>
              {explaining ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-4 rounded shimmer" style={{ width: `${85 - i * 10}%` }} />)}</div>
              ) : (
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${dark ? 'text-white/70' : 'text-gray-600'}`}>{aiExplanation}</div>
              )}
            </motion.div>
          )}

          {!result && !backendError && (
            <div className="glass-card text-center py-12">
              <FiHeart className={`text-4xl mx-auto mb-3 ${dark ? 'text-white/15' : 'text-gray-200'}`} />
              <p className={`text-sm font-medium ${dark ? 'text-white/40' : 'text-gray-400'}`}>Fill in the medical form and click Analyze Risk</p>
              <p className={`text-xs mt-1 ${dark ? 'text-white/25' : 'text-gray-300'}`}>Use &quot;Sample Data&quot; for a quick test</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
