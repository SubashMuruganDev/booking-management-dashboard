'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: authSession } = useSession();
  const [settings, setSettings] = useState({ start_date: '', theme: 'system', daily_goal_minutes: 60, name: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.settings) {
        setSettings({
          start_date: d.settings.start_date || '',
          theme: d.settings.theme || 'system',
          daily_goal_minutes: d.settings.daily_goal_minutes || 60,
          name: d.user?.name || '',
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    setExporting(true);
    const res = await fetch('/api/export');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    alert(`Import complete: ${result.progressCount} progress records, ${result.notesCount} notes imported.`);
  };

  if (loading) return <div className="p-6"><div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-800 rounded w-48" /></div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Settings</h1>

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">Profile</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
          <input
            type="text"
            value={settings.name}
            onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" value={authSession?.user?.email || ''} disabled
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-400 cursor-not-allowed" />
        </div>

        <hr className="border-gray-200 dark:border-gray-800" />
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">Study Settings</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Curriculum Start Date</label>
          <input
            type="date"
            value={settings.start_date}
            onChange={e => setSettings(s => ({ ...s, start_date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-400 mt-1">This determines which session appears as &quot;Today&quot; on your dashboard.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Goal (minutes)</label>
          <input
            type="number"
            min="15"
            max="480"
            step="15"
            value={settings.daily_goal_minutes}
            onChange={e => setSettings(s => ({ ...s, daily_goal_minutes: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
          <div className="flex gap-2">
            {(['light', 'system', 'dark'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSettings(s => ({ ...s, theme: t }))}
                className={`flex-1 py-2 text-sm rounded-lg capitalize font-medium transition-colors ${
                  settings.theme === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t === 'system' ? 'Auto' : t}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </form>

      {/* Backup */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">Backup & Restore</h2>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors font-medium"
          >
            {exporting ? 'Exporting…' : '⬇ Export JSON'}
          </button>
          <label className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors font-medium cursor-pointer">
            ⬆ Import JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
        <p className="text-xs text-gray-400">Export your progress and notes as JSON. Import only adds missing records — it won&apos;t overwrite existing progress.</p>
      </div>
    </div>
  );
}
