import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getTodaySession } from '@/data/curriculum';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function TodayPage() {
  const session = await getServerSession(authOptions);
  const db = getDb();
  const userId = session!.user!.id as string;
  const settings = db.prepare('SELECT start_date FROM settings WHERE user_id = ?').get(userId) as { start_date: string } | undefined;

  if (!settings?.start_date) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-20">
        <div className="text-4xl mb-4">📅</div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Set Your Start Date</h1>
        <p className="text-gray-500 mb-4">Configure your curriculum start date to see today&apos;s session.</p>
        <Link href="/settings" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Go to Settings →
        </Link>
      </div>
    );
  }

  const todayData = getTodaySession(settings.start_date);
  if (todayData) {
    redirect(`/session/${todayData.session.id}`);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto text-center py-20">
      <div className="text-4xl mb-4">🎉</div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Curriculum Complete!</h1>
      <p className="text-gray-500">You&apos;ve reached the end of the 52-week curriculum. Use the roadmap to revisit any session.</p>
      <Link href="/roadmap" className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
        Browse Roadmap →
      </Link>
    </div>
  );
}
