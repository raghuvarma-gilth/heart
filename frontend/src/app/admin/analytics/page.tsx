'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { FiBarChart2 } from 'react-icons/fi';

export default function AdminAnalyticsPage() {
  const { dark } = useTheme();
  const [data, setData] = useState({ users: 0, patients: 0, admins: 0, appointments: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'users'), snap => {
      const docs = snap.docs.map(d => d.data());
      setData(p => ({
        ...p,
        users: snap.size,
        patients: docs.filter(d => d.role === 'patient').length,
        admins: docs.filter(d => d.role === 'admin').length,
      }));
    });
    const unsub2 = onSnapshot(collection(db, 'appointments'), snap => {
      const docs = snap.docs.map(d => d.data());
      setData(p => ({
        ...p,
        appointments: snap.size,
        pending: docs.filter(d => d.status === 'pending').length,
        approved: docs.filter(d => d.status === 'approved').length,
        rejected: docs.filter(d => d.status === 'rejected').length,
      }));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const barData = [
    { label: 'Pending', value: data.pending, color: '#F4A261', max: Math.max(data.pending, data.approved, data.rejected, 1) },
    { label: 'Approved', value: data.approved, color: '#2A9D8F', max: Math.max(data.pending, data.approved, data.rejected, 1) },
    { label: 'Rejected', value: data.rejected, color: '#E63946', max: Math.max(data.pending, data.approved, data.rejected, 1) },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FiBarChart2 className="text-emerald-400" /> Analytics</h1>
        <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>Platform metrics and insights</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* User Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
          <h2 className="font-semibold mb-6">User Distribution</h2>
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <circle cx="100" cy="100" r="70" fill="none" stroke={dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="24" />
                <motion.circle
                  cx="100" cy="100" r="70" fill="none" stroke="#457B9D" strokeWidth="24"
                  strokeDasharray={2 * Math.PI * 70}
                  initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                  animate={{ strokeDashoffset: data.users ? 2 * Math.PI * 70 * (1 - data.patients / data.users) : 2 * Math.PI * 70 }}
                  transition={{ duration: 1 }}
                />
                <motion.circle
                  cx="100" cy="100" r="70" fill="none" stroke="#7C3AED" strokeWidth="24"
                  strokeDasharray={2 * Math.PI * 70}
                  initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                  animate={{ strokeDashoffset: data.users ? 2 * Math.PI * 70 * (1 - data.admins / data.users) : 2 * Math.PI * 70 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  strokeDashoffset={data.users ? 2 * Math.PI * 70 * (data.patients / data.users) : 0}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{data.users}</span>
                <span className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>total</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#457B9D]" />
                <span className={`text-sm ${dark ? 'text-white/60' : 'text-gray-600'}`}>Patients: {data.patients}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#7C3AED]" />
                <span className={`text-sm ${dark ? 'text-white/60' : 'text-gray-600'}`}>Admins: {data.admins}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appointment Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card">
          <h2 className="font-semibold mb-6">Appointment Status</h2>
          <div className="space-y-4">
            {barData.map((b, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className={`text-sm ${dark ? 'text-white/60' : 'text-gray-600'}`}>{b.label}</span>
                  <span className="text-sm font-semibold">{b.value}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: b.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${b.max > 0 ? (b.value / b.max) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-6 pt-4 border-t ${dark ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex justify-between">
              <span className={`text-sm ${dark ? 'text-white/40' : 'text-gray-400'}`}>Total Appointments</span>
              <span className="text-lg font-bold">{data.appointments}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
