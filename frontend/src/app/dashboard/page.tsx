'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { FiHeart, FiActivity, FiAlertCircle, FiSmile, FiCalendar, FiTrendingUp, FiMessageCircle, FiArrowRight } from 'react-icons/fi';

const cards = [
  { href: '/dashboard/predict', icon: FiHeart, title: 'Heart Prediction', desc: 'AI-powered cardiac risk analysis', color: '#E63946', gradient: 'from-red-500 to-rose-600' },
  { href: '/dashboard/stress', icon: FiActivity, title: 'Stress Relief', desc: 'Breathing exercises & meditation', color: '#457B9D', gradient: 'from-blue-500 to-cyan-600' },
  { href: '/dashboard/symptoms', icon: FiAlertCircle, title: 'Symptom Checker', desc: 'Analyze your symptoms with AI', color: '#2A9D8F', gradient: 'from-teal-500 to-emerald-600' },
  { href: '/dashboard/emotion', icon: FiSmile, title: 'Emotion AI', desc: 'Real-time emotion detection', color: '#E9C46A', gradient: 'from-amber-500 to-yellow-600' },
  { href: '/dashboard/appointments', icon: FiCalendar, title: 'Appointments', desc: 'Book & manage appointments', color: '#F4A261', gradient: 'from-orange-500 to-amber-600' },
  { href: '/dashboard/chat', icon: FiMessageCircle, title: 'AI Chat', desc: 'Health assistant chatbot', color: '#7C3AED', gradient: 'from-purple-500 to-violet-600' },
];

export default function DashboardOverview() {
  const { userData } = useAuth();
  const { dark } = useTheme();

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">{userData?.name || 'User'}</span> 👋
        </h1>
        <p className={dark ? 'text-white/50' : 'text-gray-500'}>Here&apos;s your health dashboard overview</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Health Score', value: '92', unit: '/100', icon: FiHeart, color: 'text-red-400', bg: dark ? 'bg-red-500/10' : 'bg-red-50' },
          { label: 'Stress Level', value: 'Low', unit: '', icon: FiActivity, color: 'text-blue-400', bg: dark ? 'bg-blue-500/10' : 'bg-blue-50' },
          { label: 'Wellness Streak', value: '7', unit: ' days', icon: FiTrendingUp, color: 'text-green-400', bg: dark ? 'bg-green-500/10' : 'bg-green-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`text-xl ${stat.color}`} />
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider ${dark ? 'text-white/40' : 'text-gray-400'}`}>{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}<span className={`text-sm font-normal ${dark ? 'text-white/40' : 'text-gray-400'}`}>{stat.unit}</span></p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feature Cards */}
      <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
          >
            <Link href={card.href} className="block glass-card group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                    <card.icon className="text-lg" style={{ color: card.color }} />
                  </div>
                  <FiArrowRight className={`transition-transform group-hover:translate-x-1 ${dark ? 'text-white/20 group-hover:text-white/60' : 'text-gray-300 group-hover:text-gray-500'}`} />
                </div>
                <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>{card.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* AI Insight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 glass-card !p-6 border-l-4 border-l-red-500"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <FiHeart className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">AI Health Tip</h3>
            <p className={`text-sm leading-relaxed ${dark ? 'text-white/60' : 'text-gray-600'}`}>
              Regular cardiovascular exercise for just 30 minutes a day can reduce your heart disease risk by up to 35%. 
              Try starting with a brisk walk today! Use our Stress Relief hub for guided breathing exercises.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
