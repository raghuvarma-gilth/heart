'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { FiCalendar, FiCheck, FiX, FiClock, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminAppointments() {
  const { dark } = useTheme();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      toast.success(`Appointment ${status}!`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const filtered = appointments.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search && !a.patientName?.toLowerCase().includes(search.toLowerCase()) && !a.doctor?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusConfig: Record<string, { color: string; bg: string }> = {
    pending: { color: '#F4A261', bg: 'rgba(244,162,97,0.15)' },
    approved: { color: '#2A9D8F', bg: 'rgba(42,157,143,0.15)' },
    rejected: { color: '#E63946', bg: 'rgba(230,57,70,0.15)' },
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FiCalendar className="text-orange-400" /> Appointment Management</h1>
        <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>Review and manage all patient appointments</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize ${filter === f ? 'bg-red-500/20 text-red-400 border border-red-500/30' : dark ? 'bg-white/5 text-white/50 border border-white/10' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
              {f} {f !== 'all' && `(${appointments.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patient or doctor..."
          className={`input-field !w-64 text-sm ${!dark && 'input-field-light'}`}
        />
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card text-center py-16">
            <FiCalendar className={`text-5xl mx-auto mb-4 ${dark ? 'text-white/10' : 'text-gray-200'}`} />
            <p className={`text-sm ${dark ? 'text-white/30' : 'text-gray-400'}`}>No appointments found</p>
          </div>
        ) : (
          filtered.map((apt, i) => {
            const sc = statusConfig[apt.status] || statusConfig.pending;
            return (
              <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{apt.patientName}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize" style={{ background: sc.bg, color: sc.color }}>
                        {apt.status}
                      </span>
                    </div>
                    <p className={`text-xs ${dark ? 'text-white/50' : 'text-gray-500'}`}>
                      👤 {apt.doctor} • 📅 {apt.date} at {apt.time}
                    </p>
                    {apt.symptoms && <p className={`text-xs mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>📝 {apt.symptoms}</p>}
                  </div>
                  {apt.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => updateStatus(apt.id, 'approved')} className="px-3 py-2 rounded-lg bg-green-500/15 text-green-400 text-xs font-medium hover:bg-green-500/25 transition-all flex items-center gap-1">
                        <FiCheck /> Approve
                      </button>
                      <button onClick={() => updateStatus(apt.id, 'rejected')} className="px-3 py-2 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-all flex items-center gap-1">
                        <FiX /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
