import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getWeekByNumber } from '@/data/curriculum';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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

export default async function WeekPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const session = await getServerSession(authOptions);
  const weekNum = parseInt(number, 10);
  const week = getWeekByNumber(weekNum);
  if (!week) notFound();

  const db = getDb();
  const userId = session!.user!.id as string;
  const allProgress = db.prepare(
    "SELECT session_id, status FROM session_progress WHERE user_id = ? AND session_id IN (" +
    week.sessions.map(() => '?').join(',') + ")"
  ).all(userId, ...week.sessions.map(s => s.id)) as { session_id: string; status: string }[];

  const progressMap = Object.fromEntries(allProgress.map(p => [p.session_id, p.status]));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/roadmap" className="hover:text-indigo-600 dark:hover:text-indigo-400">Roadmap</Link>
        <span>›</span>
        <span>Week {week.weekNumber}</span>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
            Phase {week.phase}: {week.phaseName}
          </span>
          <span className="text-xs text-gray-400">Week {week.weekNumber}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{week.title}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{week.weeklyOutcome}</p>
      </div>

      {(week.portfolioMilestone || week.certificationMilestone) && (
        <div className="flex gap-3 flex-wrap">
          {week.portfolioMilestone && (
            <div className="text-sm bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-900">
              🏆 {week.portfolioMilestone}
            </div>
          )}
          {week.certificationMilestone && (
            <div className="text-sm bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-900">
              📜 {week.certificationMilestone}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {week.sessions.map((s, i) => {
          const status = progressMap[s.id] || 'not_started';
          return (
            <Link
              key={s.id}
              href={`/session/${s.id}`}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                status === 'in_progress' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' :
                'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}>
                {status === 'completed' ? '✓' : `D${i + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {s.title}
                  </span>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[s.category] || CATEGORY_COLORS.review}`}>
                    {s.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.objective}</p>
              </div>
              <span className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors">›</span>
            </Link>
          );
        })}
      </div>

      <div className="flex justify-between text-sm">
        {weekNum > 1 && (
          <Link href={`/week/${weekNum - 1}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Week {weekNum - 1}
          </Link>
        )}
        {weekNum < 52 && (
          <Link href={`/week/${weekNum + 1}`} className="ml-auto text-indigo-600 dark:text-indigo-400 hover:underline">
            Week {weekNum + 1} →
          </Link>
        )}
      </div>
    </div>
  );
}
