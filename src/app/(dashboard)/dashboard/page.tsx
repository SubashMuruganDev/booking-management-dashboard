import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { ALL_WEEKS, getTodaySession, PHASES } from '@/data/curriculum';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const db = getDb();
  const userId = session!.user!.id as string;

  const settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(userId) as
    { start_date: string; theme: string; daily_goal_minutes: number } | undefined;

  const allProgress = db.prepare(
    "SELECT session_id, status, completed_at FROM session_progress WHERE user_id = ?"
  ).all(userId) as { session_id: string; status: string; completed_at: string | null }[];

  const completedSet = new Set(allProgress.filter(p => p.status === 'completed').map(p => p.session_id));
  const totalSessions = ALL_WEEKS.reduce((s, w) => s + w.sessions.length, 0);
  const completedCount = completedSet.size;

  // Streak
  const completedDates = [...new Set(
    allProgress.filter(p => p.status === 'completed' && p.completed_at)
      .map(p => p.completed_at!.split('T')[0])
  )].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const getYesterday = (d: string) => {
    const dt = new Date(d); dt.setDate(dt.getDate() - 1); return dt.toISOString().split('T')[0];
  };
  if (completedDates.length > 0 && (completedDates[0] === today || completedDates[0] === getYesterday(today))) {
    streak = 1;
    for (let i = 1; i < completedDates.length; i++) {
      if (completedDates[i] === getYesterday(completedDates[i - 1])) streak++;
      else break;
    }
  }

  // Today's session
  const todayData = settings?.start_date ? getTodaySession(settings.start_date) : undefined;

  // Phase stats
  const phaseStats = PHASES.map(phase => {
    const phaseWeeks = ALL_WEEKS.filter(w => w.phase === phase.id);
    const phaseSessions = phaseWeeks.flatMap(w => w.sessions.map(s => s.id));
    const phaseCompleted = phaseSessions.filter(id => completedSet.has(id)).length;
    return { ...phase, total: phaseSessions.length, completed: phaseCompleted };
  });

  // Recent activity (last 5 completed)
  const recentActivity = allProgress
    .filter(p => p.status === 'completed' && p.completed_at)
    .sort((a, b) => (b.completed_at! > a.completed_at! ? 1 : -1))
    .slice(0, 5)
    .map(p => {
      for (const week of ALL_WEEKS) {
        const s = week.sessions.find(s => s.id === p.session_id);
        if (s) return { session: s, week, completed_at: p.completed_at };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <DashboardClient
      userName={session?.user?.name || 'there'}
      totalSessions={totalSessions}
      completedCount={completedCount}
      streak={streak}
      startDate={settings?.start_date || null}
      todayData={todayData || null}
      phaseStats={phaseStats}
      recentActivity={recentActivity}
    />
  );
}
