import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(session.user.id);
  const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(session.user.id) as { email: string; name: string } | undefined;

  return NextResponse.json({ settings, user });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { start_date, theme, daily_goal_minutes, notification_enabled, name } = body;

  const db = getDb();
  const updates: string[] = [];
  const values: unknown[] = [];

  if (start_date !== undefined) { updates.push('start_date = ?'); values.push(start_date); }
  if (theme !== undefined) { updates.push('theme = ?'); values.push(theme); }
  if (daily_goal_minutes !== undefined) { updates.push('daily_goal_minutes = ?'); values.push(daily_goal_minutes); }
  if (notification_enabled !== undefined) { updates.push('notification_enabled = ?'); values.push(notification_enabled ? 1 : 0); }

  if (updates.length > 0) {
    values.push(session.user.id);
    db.prepare(`UPDATE settings SET ${updates.join(', ')} WHERE user_id = ?`).run(...values);
  }

  if (name !== undefined) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, session.user.id);
  }

  const updated = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(session.user.id);
  const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(session.user.id);
  return NextResponse.json({ settings: updated, user });
}
