'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { FiUsers, FiCalendar, FiAlertTriangle, FiTrendingUp, FiHeart } from 'react-icons/fi';

export default function AdminOverview() {
  const { dark } = useTheme();
  const [stats, setStats] = useState({ users: 0, appointments: 0, pending: 0, approved: 0 });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      setStats(p => ({ ...p, users: snap.size }));
    });
    const unsubAppts = onSnapshot(collection(db, 'appointments'), snap => {
      const docs = snap.docs.map(d => d.data());
      setStats(p => ({
        ...p,
        appointments: snap.size,
        pending: docs.filter(d => d.status === 'pending').length,
        approved: docs.filter(d => d.status === 'approved').length,
      }));
    });
    return () => { unsubUsers(); unsubAppts(); };
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: FiUsers, color: '#457B9D', gradient: 'from-blue-500 to-cyan-600' },
    { label: 'Appointments', value: stats.appointments, icon: FiCalendar, color: '#F4A261', gradient: 'from-orange-500 to-amber-600' },
    { label: 'Pending', value: stats.pending, icon: FiAlertTriangle, color: '#E9C46A', gradient: 'from-yellow-500 to-amber-500' },
    { label: 'Approved', value: stats.approved, icon: FiTrendingUp, color: '#2A9D8F', gradient: 'from-teal-500 to-emerald-600' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className={dark ? 'text-white/50' : 'text-gray-500'}>CardioMind platform management overview</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.gradient} opacity-10 rounded-full -translate-y-6 translate-x-6`} />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}15` }}>
                <s.icon style={{ color: s.color }} />
              </div>
              <p className={`text-xs uppercase tracking-wider mb-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{s.label}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><FiHeart className="text-red-400" /> Platform Health</h2>
          <div className="space-y-3">
            {[
              { label: 'ML Model', status: 'Active', color: '#2A9D8F' },
              { label: 'Grok API', status: 'Connected', color: '#2A9D8F' },
              { label: 'Firebase', status: 'Online', color: '#2A9D8F' },
              { label: 'Predictions Today', status: '—', color: '#457B9D' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg ${dark ? 'bg-white/3' : 'bg-gray-50'}`}>
                <span className={`text-sm ${dark ? 'text-white/60' : 'text-gray-600'}`}>{item.label}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: `${item.color}15`, color: item.color }}>{item.status}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><FiCalendar className="text-orange-400" /> Recent Activity</h2>
          <div className={`text-sm text-center py-12 ${dark ? 'text-white/30' : 'text-gray-400'}`}>
            <FiCalendar className="text-4xl mx-auto mb-3 opacity-30" />
            <p>Activity feed coming soon</p>
            <p className="text-xs mt-1">Real-time updates from Firestore</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
