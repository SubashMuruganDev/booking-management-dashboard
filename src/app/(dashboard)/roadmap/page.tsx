import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { ALL_WEEKS, PHASES } from '@/data/curriculum';
import { RoadmapClient } from './RoadmapClient';

export default async function RoadmapPage() {
  const session = await getServerSession(authOptions);
  const db = getDb();
  const userId = session!.user!.id as string;

  const allProgress = db.prepare(
    "SELECT session_id, status FROM session_progress WHERE user_id = ?"
  ).all(userId) as { session_id: string; status: string }[];

  const progressMap = Object.fromEntries(allProgress.map(p => [p.session_id, p.status]));

  const weeksSummary = ALL_WEEKS.map(week => {
    const sessionStatuses = week.sessions.map(s => progressMap[s.id] || 'not_started');
    const completed = sessionStatuses.filter(s => s === 'completed').length;
    const inProgress = sessionStatuses.filter(s => s === 'in_progress').length;
    return {
      id: week.id,
      weekNumber: week.weekNumber,
      phase: week.phase,
      phaseName: week.phaseName,
      title: week.title,
      weeklyOutcome: week.weeklyOutcome,
      totalSessions: week.sessions.length,
      completed,
      inProgress,
      portfolioMilestone: week.portfolioMilestone,
      certificationMilestone: week.certificationMilestone,
    };
  });

  return <RoadmapClient weeks={weeksSummary} phases={PHASES} />;
}
