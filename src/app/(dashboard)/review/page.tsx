import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getSessionById } from '@/data/curriculum';
import Link from 'next/link';

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  const db = getDb();
  const userId = session!.user!.id as string;

  // Spaced repetition: sessions completed 1, 3, 7, 14, 30 days ago
  const intervals = [1, 3, 7, 14, 30];
  const today = new Date();

  const completedProgress = db.prepare(
    "SELECT session_id, completed_at FROM session_progress WHERE user_id = ? AND status = 'completed' AND completed_at IS NOT NULL"
  ).all(userId) as { session_id: string; completed_at: string }[];

  const dueForReview = completedProgress.filter(p => {
    const completedDate = new Date(p.completed_at);
    const daysSince = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
    return intervals.includes(daysSince);
  });

  const reviewItems = dueForReview.map(p => {
    const found = getSessionById(p.session_id);
    if (!found) return null;
    const daysSince = Math.floor((today.getTime() - new Date(p.completed_at).getTime()) / (1000 * 60 * 60 * 24));
    return { ...found, daysSince, completed_at: p.completed_at };
  }).filter(Boolean);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔄 Review Queue</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sessions due for spaced repetition review (1, 3, 7, 14, 30 days after completion)</p>
      </div>

      {reviewItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-medium text-gray-600 dark:text-gray-400">No reviews due today!</p>
          <p className="text-sm mt-1">Complete more sessions and they&apos;ll appear here for spaced review.</p>
        </div>
      ) : (
        <>
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200">
            📚 You have <strong>{reviewItems.length}</strong> session{reviewItems.length !== 1 ? 's' : ''} due for review today.
            Spend 10-15 minutes revisiting each one to reinforce retention.
          </div>
          <div className="space-y-3">
            {reviewItems.map((item, i) => item && (
              <Link
                key={i}
                href={`/session/${item.session.id}`}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-amber-200 dark:border-amber-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group"
              >
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {item.daysSince}d
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.session.title}
                  </p>
                  <p className="text-xs text-gray-400">Week {item.week.weekNumber} · Completed {new Date(item.completed_at).toLocaleDateString()}</p>
                </div>
                <span className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors">›</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
