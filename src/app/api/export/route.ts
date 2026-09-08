import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const userId = session.user.id;

  const progress = db.prepare('SELECT * FROM session_progress WHERE user_id = ?').all(userId);
  const notes = db.prepare('SELECT * FROM notes WHERE user_id = ?').all(userId);
  const settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(userId);
  const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(userId) as { email: string; name: string } | undefined;

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    user: { email: user?.email, name: user?.name },
    settings,
    progress,
    notes,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="study-dashboard-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!data.version || data.version !== 1) {
    return NextResponse.json({ error: 'Unsupported export version' }, { status: 400 });
  }

  const db = getDb();
  const userId = session.user.id;

  const importProgress = db.transaction(() => {
    let progressCount = 0;
    let notesCount = 0;

    if (Array.isArray(data.progress)) {
      for (const p of data.progress as Record<string, unknown>[]) {
        if (!p.session_id) continue;
        const existing = db.prepare('SELECT id FROM session_progress WHERE user_id = ? AND session_id = ?')
          .get(userId, p.session_id);
        if (!existing) {
          db.prepare(
            'INSERT INTO session_progress (user_id, session_id, status, timer_seconds, bookmarked, completed_at) VALUES (?, ?, ?, ?, ?, ?)'
          ).run(userId, p.session_id, p.status || 'not_started', p.timer_seconds || 0, p.bookmarked ? 1 : 0, p.completed_at || null);
          progressCount++;
        }
      }
    }

    if (Array.isArray(data.notes)) {
      for (const n of data.notes as Record<string, unknown>[]) {
        if (!n.content) continue;
        db.prepare(
          'INSERT INTO notes (user_id, session_id, content, tags) VALUES (?, ?, ?, ?)'
        ).run(userId, n.session_id || null, n.content, n.tags || null);
        notesCount++;
      }
    }

    return { progressCount, notesCount };
  });

  const result = importProgress();
  return NextResponse.json({ message: 'Import complete', ...result });
}
