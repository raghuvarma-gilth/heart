'use client';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiHeart, FiHome, FiActivity, FiAlertCircle, FiSmile, FiCalendar, FiLogOut, FiSun, FiMoon, FiMessageCircle, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { href: '/dashboard', icon: FiHome, label: 'Overview' },
  { href: '/dashboard/predict', icon: FiHeart, label: 'Heart Check' },
  { href: '/dashboard/stress', icon: FiActivity, label: 'Stress Relief' },
  { href: '/dashboard/symptoms', icon: FiAlertCircle, label: 'Symptoms' },
  { href: '/dashboard/emotion', icon: FiSmile, label: 'Emotion AI' },
  { href: '/dashboard/appointments', icon: FiCalendar, label: 'Appointments' },
  { href: '/dashboard/chat', icon: FiMessageCircle, label: 'AI Chat' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && userData && userData.role === 'admin') router.push('/admin');
  }, [user, userData, loading, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="heartbeat inline-block"><FiHeart className="text-4xl text-red-400" /></div>
          <p className="text-white/40 text-sm mt-4">Loading CardioMind...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen flex ${dark ? 'gradient-hero text-white' : 'bg-slate-50 text-gray-900'}`}>
      {dark && <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-50" />}

      {/* Mobile menu button */}
      <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'glass' : 'bg-white shadow-md border border-gray-200'}`}>
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 z-40 flex flex-col transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${dark ? 'glass border-r border-white/10' : 'bg-white border-r border-gray-200 shadow-lg'}`}>
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <FiHeart className="text-white text-sm" />
          </div>
          <span className="font-bold text-lg tracking-tight">CardioMind</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  active
                    ? dark
                      ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                      : 'bg-red-50 text-red-600 border border-red-100'
                    : dark
                    ? 'text-white/60 hover:text-white hover:bg-white/5'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className={active ? (dark ? 'text-red-400' : 'text-red-600') : ''} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t ${dark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
              {userData?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userData?.name || 'User'}</p>
              <p className={`text-xs truncate ${dark ? 'text-white/40' : 'text-gray-400'}`}>{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggle} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${dark ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
              {dark ? <FiSun className="inline mr-1" /> : <FiMoon className="inline mr-1" />}
              {dark ? 'Light' : 'Dark'}
            </button>
            <button onClick={signOut} className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors duration-150">
              <FiLogOut className="inline mr-1" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setMobileOpen(false)} />}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 relative z-10">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
