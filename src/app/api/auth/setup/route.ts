import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';

// One-time setup endpoint to create the owner account
// Returns 409 if account already exists
export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users LIMIT 1').get();
  if (existing) return NextResponse.json({ error: 'Account already exists' }, { status: 409 });

  const hash = await bcrypt.hash(password, 12);
  const result = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(email, hash, name || email);
  db.prepare('INSERT INTO settings (user_id, start_date) VALUES (?, ?)').run(result.lastInsertRowid, new Date().toISOString().split('T')[0]);

  return NextResponse.json({ message: 'Account created' }, { status: 201 });
}
