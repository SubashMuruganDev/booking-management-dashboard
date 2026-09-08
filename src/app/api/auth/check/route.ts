import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users LIMIT 1').get();
  return NextResponse.json({ needsSetup: !existing });
}
