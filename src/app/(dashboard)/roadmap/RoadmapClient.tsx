'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Phase } from '@/data/types';

interface WeekSummary {
  id: string;
  weekNumber: number;
  phase: number;
  phaseName: string;
  title: string;
  weeklyOutcome: string;
  totalSessions: number;
  completed: number;
  inProgress: number;
  portfolioMilestone?: string;
  certificationMilestone?: string;
}

interface Props {
  weeks: WeekSummary[];
  phases: Phase[];
}

export function RoadmapClient({ weeks, phases }: Props) {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  const filtered = selectedPhase ? weeks.filter(w => w.phase === selectedPhase) : weeks;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🗺️ Roadmap</h1>
        <div className="text-sm text-gray-500">{weeks.filter(w => w.completed === w.totalSessions).length} / {weeks.length} weeks complete</div>
      </div>

      {/* Phase filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedPhase(null)}
          className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
            selectedPhase === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Phases
        </button>
        {phases.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPhase(p.id === selectedPhase ? null : p.id)}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
              selectedPhase === p.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            P{p.id}: {p.name}
          </button>
        ))}
      </div>

      {/* Week cards */}
      <div className="space-y-2">
        {filtered.map(week => {
          const pct = week.totalSessions > 0 ? Math.round((week.completed / week.totalSessions) * 100) : 0;
          const isComplete = week.completed === week.totalSessions;
          const isExpanded = expandedWeek === week.id;

          return (
            <div
              key={week.id}
              className={`bg-white dark:bg-gray-900 rounded-xl border transition-colors ${
                isComplete ? 'border-emerald-200 dark:border-emerald-900' : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <button
                onClick={() => setExpandedWeek(isExpanded ? null : week.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isComplete ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                    week.inProgress > 0 ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {isComplete ? '✓' : `W${week.weekNumber}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-gray-900 dark:text-white text-sm truncate">{week.title}</span>
                      {week.portfolioMilestone && (
                        <span className="shrink-0 text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full">Portfolio</span>
                      )}
                      {week.certificationMilestone && (
                        <span className="shrink-0 text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">Cert</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{week.completed}/{week.totalSessions}</span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phase {week.phase}: {week.phaseName}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{week.weeklyOutcome}</p>
                  {week.portfolioMilestone && (
                    <div className="text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-lg mb-2">
                      🏆 Portfolio: {week.portfolioMilestone}
                    </div>
                  )}
                  {week.certificationMilestone && (
                    <div className="text-xs bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg mb-3">
                      📜 Cert: {week.certificationMilestone}
                    </div>
                  )}
                  <Link
                    href={`/week/${week.weekNumber}`}
                    className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View all sessions →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
