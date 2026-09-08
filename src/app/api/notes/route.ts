import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  const db = getDb();
  const notes = sessionId
    ? db.prepare('SELECT * FROM notes WHERE user_id = ? AND session_id = ? ORDER BY created_at DESC').all(session.user.id, sessionId)
    : db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC').all(session.user.id);

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { session_id, content, tags } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 });

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO notes (user_id, session_id, content, tags) VALUES (?, ?, ?, ?)'
  ).run(session.user.id, session_id || null, content.trim(), tags ? JSON.stringify(tags) : null);

  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ note }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, content, tags } = await req.json();
  if (!id) return NextResponse.json({ error: 'Note id required' }, { status: 400 });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?').get(id, session.user.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.prepare('UPDATE notes SET content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?')
    .run(content, tags ? JSON.stringify(tags) : null, id, session.user.id);

  const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  return NextResponse.json({ note: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Note id required' }, { status: 400 });

  const db = getDb();
  const result = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(id, session.user.id);
  if (result.changes === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ message: 'Deleted' });
}
