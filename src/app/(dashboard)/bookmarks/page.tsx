import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getSessionById } from '@/data/curriculum';
import Link from 'next/link';

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  const db = getDb();
  const userId = session!.user!.id as string;

  const bookmarked = db.prepare(
    "SELECT session_id, updated_at FROM session_progress WHERE user_id = ? AND bookmarked = 1 ORDER BY updated_at DESC"
  ).all(userId) as { session_id: string; updated_at: string }[];

  const items = bookmarked.map(b => {
    const found = getSessionById(b.session_id);
    return found ? { ...found, bookmarked_at: b.updated_at } : null;
  }).filter(Boolean);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔖 Bookmarks</h1>
        <span className="text-sm text-gray-500">{items.length} saved</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔖</div>
          <p>No bookmarks yet. Bookmark sessions to find them here quickly.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => item && (
            <Link
              key={i}
              href={`/session/${item.session.id}`}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group"
            >
              <span className="text-amber-400 text-xl">🔖</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {item.session.title}
                </p>
                <p className="text-xs text-gray-400">Week {item.week.weekNumber} · {item.week.phaseName}</p>
              </div>
              <span className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
