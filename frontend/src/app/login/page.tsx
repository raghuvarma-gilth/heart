'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHeart, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiShield, FiActivity, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, user, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && userData) {
      router.push(userData.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, userData, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back to CardioMind!');
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password'
        : err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.'
        : err.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome to CardioMind!');
    } catch (err: any) {
      const msg = err.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled'
        : err.code === 'auth/popup-blocked' ? 'Pop-up blocked. Allow pop-ups and try again.'
        : err.message || 'Google sign-in failed';
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #131b35 50%, #0f1a30 100%)' }}>
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12" style={{ background: 'linear-gradient(160deg, #1a0a0e 0%, #2d0a12 30%, #1a1030 70%, #0a0f1e 100%)' }}>
        {/* Background effects */}
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
          <p className="text-red-400/60 text-sm mt-1">AI-Powered Healthcare Platform</p>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome to the<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #ff4d5a, #ff6b81, #ff8fa3)' }}>
              Future of Heart Health
            </span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-md">
            Access your personalized health dashboard, AI predictions, and real-time wellness insights — all in one secure platform.
          </p>
          
          <div className="mt-10 space-y-4">
            {[
              { icon: FiShield, text: 'Bank-grade encryption', color: '#E63946' },
              { icon: FiZap, text: '95%+ ML accuracy', color: '#F4A261' },
              { icon: FiActivity, text: 'Real-time AI insights', color: '#2A9D8F' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                  <item.icon style={{ color: item.color }} className="text-lg" />
                </div>
                <span className="text-gray-300 text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-500">System Online</span>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-xs text-gray-500">SSL Protected</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-[80px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center"><FiHeart className="text-white" /></div>
              <span className="text-xl font-bold text-white">CardioMind</span>
            </Link>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(20px)' }}>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/8 rounded-full blur-[60px]" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px]" />
            
            <div className="relative z-10">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
                <p className="text-gray-400 text-sm">Enter your credentials to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-red-400 text-xs font-bold mb-2 block uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/50" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                      style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(230, 57, 70, 0.2)' }}
                      placeholder="you@example.com"
                      onFocus={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.2)'}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-red-400 text-xs font-bold mb-2 block uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                      style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(230, 57, 70, 0.2)' }}
                      placeholder="Enter your password"
                      onFocus={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(230, 57, 70, 0.2)'}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors">
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #E63946, #C62828)', boxShadow: '0 4px 20px rgba(230, 57, 70, 0.3)' }}
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                  ) : (
                    <>Sign In <FiArrowRight /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Google Sign-In */}
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
              >
                {googleLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                ) : (
                  <><svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continue with Google</>
                )}
              </button>

              <p className="text-center text-sm text-gray-400 mt-5">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-red-400 hover:text-red-300 font-semibold transition-colors">Create Account</Link>
              </p>
            </div>
          </div>

          {/* Bottom badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <span className="text-[10px] text-gray-500 flex items-center gap-1"><FiShield className="text-red-500/60" /> 256-bit SSL</span>
            <span className="text-[10px] text-gray-500">HIPAA Compliant</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
