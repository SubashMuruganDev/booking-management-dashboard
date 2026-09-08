import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { ALL_WEEKS } from '@/data/curriculum';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const userId = session.user.id;

  const allProgress = db.prepare(
    "SELECT session_id, status, completed_at FROM session_progress WHERE user_id = ?"
  ).all(userId) as { session_id: string; status: string; completed_at: string | null }[];

  const completedSet = new Set(allProgress.filter(p => p.status === 'completed').map(p => p.session_id));

  const totalSessions = ALL_WEEKS.reduce((s, w) => s + w.sessions.length, 0);
  const completedCount = completedSet.size;
  const inProgressCount = allProgress.filter(p => p.status === 'in_progress').length;

  // Phase breakdown
  const phaseStats = Array.from({ length: 13 }, (_, i) => i + 1).map(phaseId => {
    const phaseWeeks = ALL_WEEKS.filter(w => w.phase === phaseId);
    const phaseSessions = phaseWeeks.flatMap(w => w.sessions.map(s => s.id));
    const phaseCompleted = phaseSessions.filter(id => completedSet.has(id)).length;
    return { phaseId, total: phaseSessions.length, completed: phaseCompleted };
  });

  // Streak calculation
  const completedDates = allProgress
    .filter(p => p.status === 'completed' && p.completed_at)
    .map(p => p.completed_at!.split('T')[0])
    .sort();
  const uniqueDates = [...new Set(completedDates)].sort().reverse();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  const today = new Date().toISOString().split('T')[0];

  if (uniqueDates.length > 0 && (uniqueDates[0] === today || uniqueDates[0] === getPrevDay(today))) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === getPrevDay(uniqueDates[i - 1])) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  for (let i = 1; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === getPrevDay(uniqueDates[i - 1])) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }
  if (uniqueDates.length > 0 && longestStreak === 0) longestStreak = 1;

  const settings = db.prepare('SELECT start_date FROM settings WHERE user_id = ?').get(userId) as { start_date: string } | undefined;

  return NextResponse.json({
    totalSessions,
    completedCount,
    inProgressCount,
    completionRate: totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0,
    currentStreak,
    longestStreak,
    phaseStats,
    startDate: settings?.start_date || null,
  });
}

function getPrevDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
