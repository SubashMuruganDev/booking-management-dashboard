import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getSessionById } from '@/data/curriculum';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const curriculumSession = getSessionById(id);
  if (!curriculumSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const db = getDb();
  const progress = db.prepare('SELECT * FROM session_progress WHERE user_id = ? AND session_id = ?')
    .get(session.user.id, id);

  return NextResponse.json({ session: curriculumSession, progress: progress || null });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const curriculumSession = getSessionById(id);
  if (!curriculumSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const body = await req.json();
  const { status, timer_seconds, bookmarked } = body;

  const db = getDb();
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT id FROM session_progress WHERE user_id = ? AND session_id = ?')
    .get(session.user.id, id);

  if (existing) {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (timer_seconds !== undefined) { updates.push('timer_seconds = ?'); values.push(timer_seconds); }
    if (bookmarked !== undefined) { updates.push('bookmarked = ?'); values.push(bookmarked ? 1 : 0); }
    if (status === 'completed') { updates.push('completed_at = ?'); values.push(now); }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(session.user.id, id);

    db.prepare(`UPDATE session_progress SET ${updates.join(', ')} WHERE user_id = ? AND session_id = ?`).run(...values);
  } else {
    db.prepare(
      'INSERT INTO session_progress (user_id, session_id, status, timer_seconds, bookmarked, completed_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      session.user.id,
      id,
      status || 'in_progress',
      timer_seconds || 0,
      bookmarked ? 1 : 0,
      status === 'completed' ? now : null
    );
  }

  const updated = db.prepare('SELECT * FROM session_progress WHERE user_id = ? AND session_id = ?')
    .get(session.user.id, id);

  return NextResponse.json({ progress: updated });
}
