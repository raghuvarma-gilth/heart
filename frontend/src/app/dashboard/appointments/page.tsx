'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { FiCalendar, FiClock, FiPlus, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const doctors = [
  'Dr. Sarah Chen - Cardiologist',
  'Dr. James Wilson - General Physician',
  'Dr. Priya Sharma - Cardiac Surgeon',
  'Dr. Michael Torres - Internal Medicine',
  'Dr. Emily Park - Preventive Cardiology',
];

export default function AppointmentsPage() {
  const { dark } = useTheme();
  const { user, userData } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientName: '', date: '', time: '', symptoms: '', doctor: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName || !form.date || !form.time || !form.doctor) {
      return toast.error('Please fill all required fields');
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        userId: user!.uid,
        patientName: form.patientName || userData?.name,
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
        doctor: form.doctor,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success('Appointment booked!');
      setForm({ patientName: '', date: '', time: '', symptoms: '', doctor: '' });
      setShowForm(false);
    } catch (err: any) {
      toast.error('Failed to book appointment');
    }
    setSubmitting(false);
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    pending: { color: '#F4A261', bg: 'rgba(244,162,97,0.15)', icon: FiClock },
    approved: { color: '#2A9D8F', bg: 'rgba(42,157,143,0.15)', icon: FiCheck },
    rejected: { color: '#E63946', bg: 'rgba(230,57,70,0.15)', icon: FiX },
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FiCalendar className="text-orange-400" /> Appointments</h1>
          <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>Book and manage your appointments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus /> Book Appointment
        </button>
      </motion.div>

      {/* Booking Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <form onSubmit={handleSubmit} className="glass-card">
              <h2 className="font-semibold mb-4">Book New Appointment</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs mb-1 block ${dark ? 'text-white/50' : 'text-gray-500'}`}>Patient Name *</label>
                  <input type="text" value={form.patientName} onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))} className={`input-field ${!dark && 'input-field-light'}`} placeholder={userData?.name || 'Your name'} />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${dark ? 'text-white/50' : 'text-gray-500'}`}>Doctor *</label>
                  <select value={form.doctor} onChange={e => setForm(p => ({ ...p, doctor: e.target.value }))} className={`input-field ${!dark && 'input-field-light'}`}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${dark ? 'text-white/50' : 'text-gray-500'}`}>Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={`input-field ${!dark && 'input-field-light'}`} />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${dark ? 'text-white/50' : 'text-gray-500'}`}>Time *</label>
                  <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className={`input-field ${!dark && 'input-field-light'}`} />
                </div>
                <div className="md:col-span-2">
                  <label className={`text-xs mb-1 block ${dark ? 'text-white/50' : 'text-gray-500'}`}>Symptoms / Notes</label>
                  <textarea value={form.symptoms} onChange={e => setForm(p => ({ ...p, symptoms: e.target.value }))} rows={2} className={`input-field resize-none ${!dark && 'input-field-light'}`} placeholder="Describe your symptoms..." />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck /> Submit</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className={`px-4 py-2.5 rounded-xl text-sm font-medium ${dark ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-600'}`}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment Timeline */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="glass-card text-center py-16">
            <FiCalendar className={`text-5xl mx-auto mb-4 ${dark ? 'text-white/10' : 'text-gray-200'}`} />
            <p className={`text-sm ${dark ? 'text-white/30' : 'text-gray-400'}`}>No appointments yet. Book your first one!</p>
          </div>
        ) : (
          appointments.map((apt, i) => {
            const sc = statusConfig[apt.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: sc.bg }}>
                  <StatusIcon style={{ color: sc.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{apt.doctor}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize" style={{ background: sc.bg, color: sc.color }}>
                      {apt.status}
                    </span>
                  </div>
                  <p className={`text-xs ${dark ? 'text-white/50' : 'text-gray-500'}`}>
                    📅 {apt.date} at {apt.time} • Patient: {apt.patientName}
                  </p>
                  {apt.symptoms && <p className={`text-xs mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>📝 {apt.symptoms}</p>}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
