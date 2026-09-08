'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { Week, DailySession } from '@/data/types';

const CATEGORY_COLORS: Record<string, string> = {
  backend: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  frontend: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  python: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  azure: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  ai: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  rag: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  agents: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  data: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  fde: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  interview: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  review: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  certification: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  security: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

interface Note { id: number; content: string; tags: string | null; created_at: string }

interface Props {
  week: Week;
  session: DailySession;
  initialStatus: string;
  initialTimer: number;
  initialBookmarked: boolean;
  initialNotes: Note[];
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function SessionClient({ week, session, initialStatus, initialTimer, initialBookmarked, initialNotes }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [timer, setTimer] = useState(initialTimer);
  const [running, setRunning] = useState(false);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'task' | 'notes' | 'interview'>('overview');
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveProgress = useCallback(async (updates: Record<string, unknown>) => {
    await fetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, [session.id]);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Auto-save timer every 30s
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (timer > 0) saveProgress({ timer_seconds: timer });
    }, 30000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [timer, saveProgress]);

  const handleToggleTimer = () => {
    if (!running && status === 'not_started') {
      setStatus('in_progress');
      saveProgress({ status: 'in_progress' });
    }
    setRunning(r => !r);
  };

  const handleMarkComplete = async () => {
    setSaving(true);
    setRunning(false);
    setStatus('completed');
    await saveProgress({ status: 'completed', timer_seconds: timer });
    setSaving(false);
  };

  const handleBookmark = async () => {
    const next = !bookmarked;
    setBookmarked(next);
    await saveProgress({ bookmarked: next });
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setSavingNote(true);
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, content: noteInput.trim() }),
    });
    if (res.ok) {
      const { note } = await res.json();
      setNotes(n => [note, ...n]);
      setNoteInput('');
    }
    setSavingNote(false);
  };

  const handleDeleteNote = async (id: number) => {
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
    setNotes(n => n.filter(note => note.id !== id));
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'breakdown', label: '60-Min Plan' },
    { id: 'task', label: 'Practical Task' },
    { id: 'notes', label: `Notes${notes.length > 0 ? ` (${notes.length})` : ''}` },
    ...(session.interviewQuestion ? [{ id: 'interview', label: 'Interview' }] : []),
  ] as { id: typeof activeTab; label: string }[];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/roadmap" className="hover:text-indigo-600 dark:hover:text-indigo-400">Roadmap</Link>
        <span>›</span>
        <Link href={`/week/${week.weekNumber}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">Week {week.weekNumber}</Link>
        <span>›</span>
        <span className="text-gray-700 dark:text-gray-300">Day {session.day}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[session.category] || CATEGORY_COLORS.review}`}>
                {session.category}
              </span>
              <span className="text-xs text-gray-400">Phase {week.phase} · W{week.weekNumber} · D{session.day}</span>
              {status === 'completed' && <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">Completed ✓</span>}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{session.title}</h1>
          </div>
          <button
            onClick={handleBookmark}
            className={`text-xl transition-colors ${bookmarked ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700 hover:text-amber-400'}`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {bookmarked ? '🔖' : '☆'}
          </button>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="font-mono text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatTime(timer)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggleTimer}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                running
                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            {status !== 'completed' && (
              <button
                onClick={handleMarkComplete}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors"
              >
                {saving ? 'Saving…' : '✓ Complete'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Objective</h3>
              <p className="text-gray-800 dark:text-gray-200">{session.objective}</p>
            </div>
            {session.prerequisites && session.prerequisites.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Prerequisites</h3>
                <ul className="space-y-1">
                  {session.prerequisites.map((p, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                      <span className="text-gray-300 dark:text-gray-600">•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {session.concepts && session.concepts.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Key Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {session.concepts.map((c, i) => (
                    <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {session.completionCriteria && session.completionCriteria.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Completion Criteria</h3>
                <ul className="space-y-1.5">
                  {session.completionCriteria.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-emerald-500 shrink-0">✓</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {session.resources && session.resources.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Resources</h3>
                <ul className="space-y-1.5">
                  {session.resources.map((r, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                      <span className="text-blue-400">📖</span>
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                          {r.title} {r.type && `(${r.type})`}
                        </a>
                      ) : (
                        <span>{r.title} {r.type && `(${r.type})`}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {session.healthosConnection && (
              <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-1">🏥 HealthOS Connection</h3>
                <p className="text-sm text-indigo-800 dark:text-indigo-200">{session.healthosConnection}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">60-Minute Breakdown</h3>
            {session.breakdown && session.breakdown.length > 0 ? (
              <div className="space-y-2">
                {session.breakdown.map((block, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-16 shrink-0 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">{block.minutes}min</div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800 dark:text-gray-200">{block.activity}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No breakdown available for this session.</p>
            )}
          </div>
        )}

        {activeTab === 'task' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Practical Task</h3>
              <p className="text-gray-800 dark:text-gray-200">{session.practicalTask}</p>
            </div>
            {session.expectedOutput && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Expected Output</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{session.expectedOutput}</p>
              </div>
            )}
            {session.stretchTask && (
              <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-1">⭐ Stretch Task</h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">{session.stretchTask}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Add a note for this session…"
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <button
              onClick={handleAddNote}
              disabled={savingNote || !noteInput.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
            >
              {savingNote ? 'Saving…' : 'Add Note'}
            </button>
            <div className="space-y-3 mt-2">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No notes yet for this session.</p>
              ) : notes.map(note => (
                <div key={note.id} className="group p-3 bg-gray-50 dark:bg-gray-800 rounded-lg relative">
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{new Date(note.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'interview' && session.interviewQuestion && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Interview Question</h3>
              <p className="text-gray-800 dark:text-gray-200 font-medium">{session.interviewQuestion}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Practice answering this out loud using the STAR method. Aim for 2-3 minutes. Record yourself to review clarity and confidence.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
