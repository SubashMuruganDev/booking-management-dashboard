'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Note {
  id: number;
  session_id: string | null;
  content: string;
  tags: string | null;
  created_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/notes').then(r => r.json()).then(d => {
      setNotes(d.notes || []);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!noteInput.trim()) return;
    setSaving(true);
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: noteInput.trim() }),
    });
    if (res.ok) {
      const { note } = await res.json();
      setNotes(n => [note, ...n]);
      setNoteInput('');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
    setNotes(n => n.filter(note => note.id !== id));
  };

  const filtered = notes.filter(n => !search || n.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📝 Notes</h1>
        <span className="text-sm text-gray-500">{notes.length} total</span>
      </div>

      {/* Add note */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
        <textarea
          value={noteInput}
          onChange={e => setNoteInput(e.target.value)}
          placeholder="Write a general note… (session-specific notes can be added from the session page)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !noteInput.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : 'Add Note'}
        </button>
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search notes…"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
        ))}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📝</div>
          <p>{search ? 'No notes match your search.' : 'No notes yet. Start capturing your thoughts!'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(note => (
            <div key={note.id} className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {note.session_id && (
                    <Link href={`/session/${note.session_id}`} className="text-xs text-indigo-500 hover:underline">
                      View session →
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
