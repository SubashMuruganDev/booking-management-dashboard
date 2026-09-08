'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from './ThemeProvider';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/roadmap', label: 'Roadmap', icon: '🗺️' },
  { href: '/session', label: 'Today', icon: '📅' },
  { href: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
  { href: '/notes', label: 'Notes', icon: '📝' },
  { href: '/review', label: 'Review Queue', icon: '🔄' },
  { href: '/certifications', label: 'Certifications', icon: '🏆' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="w-60 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <div>
            <div className="font-bold text-sm text-gray-900 dark:text-white leading-tight">AI Engineer</div>
            <div className="text-xs text-gray-500">52-Week Curriculum</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <div className="flex items-center gap-1 px-2">
          {(['light', 'system', 'dark'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 py-1.5 text-xs rounded-md capitalize transition-colors ${
                theme === t
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t === 'system' ? 'Auto' : t}
            </button>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
