import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getSessionById } from '@/data/curriculum';
import { notFound } from 'next/navigation';
import { SessionClient } from './SessionClient';

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authSession = await getServerSession(authOptions);
  const found = getSessionById(id);
  if (!found) notFound();

  const db = getDb();
  const userId = authSession!.user!.id as string;
  const progress = db.prepare('SELECT * FROM session_progress WHERE user_id = ? AND session_id = ?')
    .get(userId, id) as { status: string; timer_seconds: number; bookmarked: number } | undefined;

  const notes = db.prepare('SELECT * FROM notes WHERE user_id = ? AND session_id = ? ORDER BY created_at DESC')
    .all(userId, id) as { id: number; content: string; tags: string | null; created_at: string }[];

  return (
    <SessionClient
      week={found.week}
      session={found.session}
      initialStatus={progress?.status || 'not_started'}
      initialTimer={progress?.timer_seconds || 0}
      initialBookmarked={progress?.bookmarked === 1}
      initialNotes={notes}
    />
  );
}
