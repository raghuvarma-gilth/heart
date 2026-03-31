'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FiHeart, FiActivity, FiShield, FiCalendar, FiCpu, FiArrowRight, FiCheck, FiZap } from 'react-icons/fi';

const features = [
  { icon: FiHeart, title: 'Heart Risk Prediction', desc: 'AI-powered analysis using advanced ML models with 95%+ accuracy', color: '#E63946', bg: 'rgba(230, 57, 70, 0.12)' },
  { icon: FiActivity, title: 'Stress Relief Hub', desc: 'Breathing exercises, meditation, and ambient soundscapes', color: '#457B9D', bg: 'rgba(69, 123, 157, 0.12)' },
  { icon: FiShield, title: 'Symptom Checker', desc: 'Intelligent symptom analysis powered by Grok AI', color: '#2A9D8F', bg: 'rgba(42, 157, 143, 0.12)' },

  { icon: FiCalendar, title: 'Appointments', desc: 'Real-time booking with instant status updates', color: '#F4A261', bg: 'rgba(244, 162, 97, 0.12)' },
  { icon: FiCpu, title: 'AI Health Assistant', desc: 'Personal healthcare chatbot for guidance', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)' },
];

export default function LandingPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && userData) {
      router.push(userData.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, userData, router]);

  return (
    <div className="min-h-screen text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #131b35 30%, #1a2847 60%, #0f1a30 100%)' }}>
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/6 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-5">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center pulse-glow">
            <FiHeart className="text-white text-lg" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CardioMind</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
          <Link href="/login" className="px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition-all text-sm font-medium text-white">
            Sign In
          </Link>
          <Link href="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all">
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-300 font-medium">AI-Powered Healthcare Platform</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-white">
              Your Heart,{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #ff4d5a, #ff6b81, #e63946)' }}>
                Our Priority
              </span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed">
              CardioMind combines cutting-edge AI with medical expertise to predict heart disease risk, 
              manage stress, and provide personalized health insights — all in one platform.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/signup" className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold flex items-center gap-2 text-base hover:shadow-lg hover:shadow-red-500/30 transition-all hover:-translate-y-0.5">
                Start Free Analysis <FiArrowRight />
              </Link>
              <Link href="/login" className="px-7 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white font-semibold flex items-center gap-2 text-base hover:bg-white/10 transition-all">
                Sign In
              </Link>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              {['ML Accuracy 95%+', 'Real-time Analysis', 'HIPAA Aware'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5"><FiCheck className="text-red-400" /><span className="text-gray-300">{t}</span></span>
              ))}
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-80 h-80">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-red-500/20"
                  animate={{ scale: [1, 1.3 + i * 0.15], opacity: [0.5, 0] }}
                  transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-red-500/20 to-red-900/20 backdrop-blur-sm border border-red-500/30 flex items-center justify-center">
                <FiHeart className="text-7xl text-red-400 heartbeat" />
              </div>
              {[
                { label: 'Risk Score', val: '95%', pos: '-top-4 -right-8' },
                { label: 'Heart Rate', val: '72 bpm', pos: '-bottom-4 -left-8' },
                { label: 'Stress Level', val: 'Low', pos: 'top-1/2 -right-16' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${s.pos} glass-card !p-3 !rounded-xl`}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.7 }}
                >
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</div>
                  <div className="text-lg font-bold text-white">{s.val}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pb-32">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Intelligent Health Features</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base">Comprehensive tools powered by AI to monitor, predict, and improve your cardiovascular health.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: f.bg }}>
                <f.icon className="text-xl" style={{ color: f.color }} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 lg:px-16 pb-32 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-2xl p-12" style={{ background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.15), rgba(29, 53, 87, 0.2))', border: '1px solid rgba(230, 57, 70, 0.2)' }}>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-500/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/8 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <FiZap className="text-4xl text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to Take Control of Your Heart Health?</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto text-base">Join thousands using CardioMind to predict, prevent, and manage cardiovascular risks with AI.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold text-lg hover:shadow-xl hover:shadow-red-500/30 transition-all hover:-translate-y-0.5">
              Get Started Free <FiArrowRight />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-gray-500">
        <p>© 2026 CardioMind. AI-powered healthcare insights. Not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
}
