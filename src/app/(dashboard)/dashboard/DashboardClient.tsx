'use client';

import Link from 'next/link';
import type { Week, DailySession, Phase } from '@/data/types';

type PhaseWithStats = Phase & { total: number; completed: number };

interface Props {
  userName: string;
  totalSessions: number;
  completedCount: number;
  streak: number;
  startDate: string | null;
  todayData: { week: Week; session: DailySession } | null;
  phaseStats: PhaseWithStats[];
  recentActivity: ({ session: DailySession; week: Week; completed_at: string | null } | null)[];
}

const CATEGORY_COLORS: Record<string, string> = {
  backend: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  frontend: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  python: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  azure: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  ai: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  rag: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  agents: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  data: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  fde: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  interview: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  review: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  certification: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  security: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

export function DashboardClient({ userName, totalSessions, completedCount, streak, startDate, todayData, phaseStats, recentActivity }: Props) {
  const pct = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}, {userName} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: completedCount, sub: `of ${totalSessions} sessions`, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Progress', value: `${pct}%`, sub: 'overall completion', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Streak', value: streak, sub: streak === 1 ? 'day in a row' : 'days in a row', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Remaining', value: totalSessions - completedCount, sub: 'sessions left', color: 'text-gray-600 dark:text-gray-400' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</div>
            <div className={`text-3xl font-bold mt-1 ${color}`}>{value}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-gray-500">{completedCount} / {totalSessions}</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's session */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">📅 Today&apos;s Session</h2>
          {!startDate ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Set your start date in settings to see today&apos;s session.</p>
              <Link href="/settings" className="mt-2 inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                Go to Settings →
              </Link>
            </div>
          ) : todayData ? (
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{todayData.session.title}</h3>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[todayData.session.category] || CATEGORY_COLORS.review}`}>
                  {todayData.session.category}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Week {todayData.week.weekNumber} — {todayData.week.phaseName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{todayData.session.objective}</p>
              <Link
                href={`/session/${todayData.session.id}`}
                className="mt-3 inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Start Session →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">Curriculum complete or no session for today.</p>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">✅ Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No completed sessions yet. Let&apos;s get started!</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item, i) => item && (
                <Link
                  key={i}
                  href={`/session/${item.session.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-emerald-500 text-sm">✓</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.session.title}</p>
                    <p className="text-xs text-gray-400">W{item.week.weekNumber} · {item.completed_at?.split('T')[0]}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Phase overview */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Phase Overview</h2>
        <div className="space-y-3">
          {phaseStats.map(phase => {
            const phasePct = phase.total > 0 ? Math.round((phase.completed / phase.total) * 100) : 0;
            return (
              <Link key={phase.id} href={`/roadmap?phase=${phase.id}`} className="block group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    P{phase.id}: {phase.name}
                  </span>
                  <span className="text-gray-400">{phase.completed}/{phase.total}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${phasePct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
