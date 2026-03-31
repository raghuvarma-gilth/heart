'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHeart, FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff, FiShield, FiCheck, FiActivity, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

const roleInfo = {
  patient: {
    title: '🏥 Patient',
    desc: 'Heart risk prediction, stress relief, symptom checker, and AI chat.',
    features: ['Heart Prediction AI', 'Stress Relief Hub', 'Symptom Checker', 'AI Health Chat'],
  },
  admin: {
    title: '👨‍⚕️ Doctor / Admin',
    desc: 'Manage appointments, view analytics, and oversee patients.',
    features: ['Appointment Management', 'User Oversight', 'Platform Analytics', 'Status Control'],
  },
};

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'admin'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { signup, user, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && userData) {
      router.push(userData.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, userData, router]);

  const handleStep1 = () => {
    if (!name.trim()) return toast.error('Please enter your name');
    if (!email.trim()) return toast.error('Please enter your email');
    if (!password) return toast.error('Please enter a password');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await signup(email, password, name, role);
      toast.success('Welcome to CardioMind! 🎉');
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use' ? 'Email already registered'
        : err.code === 'auth/weak-password' ? 'Password is too weak'
        : err.message || 'Signup failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = [password.length >= 6, /\d/.test(password), /[a-zA-Z]/.test(password)].filter(Boolean).length;

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(230, 57, 70, 0.2)',
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #131b35 50%, #0f1a30 100%)' }}>
      {/* Left Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12" style={{ background: 'linear-gradient(160deg, #1a0a0e 0%, #2d0a12 30%, #1a1030 70%, #0a0f1e 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-red-800/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30">
              <FiHeart className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-white">CardioMind</span>
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Start Your<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #ff4d5a, #ff6b81, #ff8fa3)' }}>
              Health Journey
            </span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-md">
            Join thousands who trust CardioMind for AI-powered heart health predictions and personalized wellness plans.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[{ v: '95%+', l: 'ML Accuracy' }, { v: '24/7', l: 'AI Assistant' }, { v: '50K+', l: 'Predictions' }].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="text-center py-4 rounded-xl"
                style={{ background: 'rgba(230, 57, 70, 0.08)', border: '1px solid rgba(230, 57, 70, 0.15)' }}
              >
                <p className="text-xl font-bold text-red-400">{s.v}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.l}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-500">Registrations Open</span>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-[80px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-[480px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center"><FiHeart className="text-white" /></div>
              <span className="text-xl font-bold text-white">CardioMind</span>
            </Link>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${step >= 1 ? 'text-red-400' : 'text-gray-500'}`} style={step >= 1 ? { background: 'rgba(230, 57, 70, 0.12)', border: '1px solid rgba(230, 57, 70, 0.25)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: step >= 1 ? 'rgba(230, 57, 70, 0.2)' : 'rgba(255,255,255,0.08)' }}>
                {step > 1 ? <FiCheck /> : '1'}
              </span>
              Details
            </div>
            <div className={`w-8 h-px ${step >= 2 ? 'bg-red-500/40' : 'bg-white/10'}`} />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${step >= 2 ? 'text-red-400' : 'text-gray-500'}`} style={step >= 2 ? { background: 'rgba(230, 57, 70, 0.12)', border: '1px solid rgba(230, 57, 70, 0.25)' } : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: 'rgba(255,255,255,0.06)' }}>2</span>
              Role
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(20px)' }}>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/8 rounded-full blur-[60px]" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px]" />
            
            <div className="relative z-10">
              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
                  <p className="text-gray-400 text-sm mb-6">Enter your information to get started</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-red-400 text-xs font-bold mb-2 block uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/50" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                          style={inputStyle} placeholder="John Doe"
                          onFocus={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.5)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.2)'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-red-400 text-xs font-bold mb-2 block uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/50" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                          style={inputStyle} placeholder="you@example.com"
                          onFocus={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.5)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.2)'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-red-400 text-xs font-bold mb-2 block uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/50" />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                          style={inputStyle} placeholder="Min 6 characters"
                          onFocus={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.5)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.2)'}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors">
                          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                      {password && (
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full ${passwordStrength >= i ? (passwordStrength === 3 ? 'bg-green-500' : passwordStrength === 2 ? 'bg-yellow-500' : 'bg-red-500') : 'bg-white/10'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-red-400 text-xs font-bold mb-2 block uppercase tracking-wider">Confirm Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/50" />
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                          style={inputStyle} placeholder="Re-enter password"
                          onFocus={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.5)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.2)'}
                        />
                        {confirmPassword && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {password === confirmPassword ? <FiCheck className="text-green-400" /> : <span className="text-red-400 text-sm">✕</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={handleStep1}
                      className="w-full py-4 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 mt-2 transition-all hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg, #E63946, #C62828)', boxShadow: '0 4px 20px rgba(230, 57, 70, 0.3)' }}
                    >
                      Continue <FiArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-red-400 mb-4 flex items-center gap-1 transition-colors">← Back to details</button>
                  <h1 className="text-2xl font-bold text-white mb-1">Choose Your Role</h1>
                  <p className="text-gray-400 text-sm mb-6">Select how you&apos;ll use CardioMind</p>
                  <div className="space-y-4 mb-6">
                    {(['patient', 'admin'] as const).map(r => {
                      const info = roleInfo[r];
                      const active = role === r;
                      return (
                        <button key={r} onClick={() => setRole(r)}
                          className="w-full text-left p-5 rounded-2xl transition-all"
                          style={active
                            ? { background: 'rgba(230, 57, 70, 0.1)', border: '1px solid rgba(230, 57, 70, 0.3)' }
                            : { background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }
                          }
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-base font-semibold text-white">{info.title}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-red-500 bg-red-500' : 'border-gray-600'}`}>
                              {active && <FiCheck className="text-white text-xs" />}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mb-3">{info.desc}</p>
                          <div className="grid grid-cols-2 gap-1">
                            {info.features.map((f, i) => (
                              <div key={i} className="flex items-center gap-2 py-0.5">
                                <span className={`text-[10px] ${active ? 'text-red-300' : 'text-gray-500'}`}>✓ {f}</span>
                              </div>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={handleSubmit} disabled={loading}
                    className="w-full py-4 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #E63946, #C62828)', boxShadow: '0 4px 20px rgba(230, 57, 70, 0.3)' }}
                  >
                    {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</> : <>Create Account <FiArrowRight /></>}
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-gray-400 mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors">Sign In</Link>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-6">
            <span className="text-[10px] text-gray-500 flex items-center gap-1"><FiShield className="text-red-500/60" /> Secure Signup</span>
            <span className="text-[10px] text-gray-500">HIPAA Compliant</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
