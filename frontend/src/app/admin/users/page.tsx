'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { FiUsers, FiSearch } from 'react-icons/fi';

export default function AdminUsersPage() {
  const { dark } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FiUsers className="text-blue-400" /> User Management</h1>
        <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>View and manage all platform users</p>
      </motion.div>

      <div className="mb-4">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className={`input-field !w-80 text-sm ${!dark && 'input-field-light'}`} />
      </div>

      <div className="glass-card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className={dark ? 'border-b border-white/10' : 'border-b border-gray-200'}>
              {['Name', 'Email', 'Role', 'Joined'].map(h => (
                <th key={h} className={`text-left text-xs font-semibold uppercase tracking-wider px-5 py-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={`${dark ? 'border-b border-white/5 hover:bg-white/3' : 'border-b border-gray-100 hover:bg-gray-50'} transition-colors`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">{u.name?.charAt(0)}</div>
                    <span className="text-sm font-medium">{u.name}</span>
                  </div>
                </td>
                <td className={`px-5 py-3 text-sm ${dark ? 'text-white/60' : 'text-gray-500'}`}>{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'}`}>{u.role}</span>
                </td>
                <td className={`px-5 py-3 text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>{u.createdAt?.toDate?.()?.toLocaleDateString?.() || '—'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className={`text-sm ${dark ? 'text-white/30' : 'text-gray-400'}`}>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
