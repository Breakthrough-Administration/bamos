'use client';

import React, { useState } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { StickyNote, Plus, Check, ArrowRight, Trash2, Tag } from 'lucide-react';

interface QuickNote {
  id: string;
  title: string;
  content: string;
  color: string;
  tag: string;
  date: string;
}

export const GoogleKeepModule: React.FC = () => {
  const { setActiveTab } = useManagementStore();
  const [notes, setNotes] = useState<QuickNote[]>([
    {
      id: 'kn-1',
      title: 'Liam O’Connor - Sensory Observation',
      content: 'Transition from park was smooth using the tactile countdown timer. Remember to share visual schedule with mum.',
      color: 'bg-teal-950/40 border-teal-500/30',
      tag: 'Clinical Field Note',
      date: 'Today, 11:20 AM'
    },
    {
      id: 'kn-2',
      title: 'NDIS Plan Review Meeting Prep',
      content: 'Extract latest WHODAS score (24/48) and compiled ABC logs to support increased CB Daily Activity hours.',
      color: 'bg-amber-950/40 border-amber-500/30',
      tag: 'Audit & Review',
      date: 'Yesterday'
    },
    {
      id: 'kn-3',
      title: 'Equipment check for Marcus Sterling',
      content: 'Check non-slip wheelchair footplate adjustment with OT before next Friday community access session.',
      color: 'bg-purple-950/40 border-purple-500/30',
      tag: 'Allied Health Followup',
      date: '2 days ago'
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const note: QuickNote = {
      id: `kn-${Date.now()}`,
      title: newTitle,
      content: newContent,
      color: 'bg-slate-800/40 border-slate-700/40',
      tag: 'Mobile Note',
      date: 'Just now'
    };

    setNotes([note, ...notes]);
    setNewTitle('');
    setNewContent('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Google Keep Clinical Field Sync</h1>
          <p className="text-xs text-slate-400">
            Rapid voice memos & mobile observations captured in the field, ready for promotion into formal SOAP case notes
          </p>
        </div>
      </div>

      {/* New Note Form */}
      <form
        onSubmit={handleAdd}
        className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3"
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Note title / Participant..."
          className="w-full bg-transparent text-sm font-bold text-white placeholder-slate-500 focus:outline-none"
        />
        <textarea
          rows={2}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Take a clinical note or mobile observation..."
          className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-500 focus:outline-none resize-none"
        />
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-teal-400" /> Synced with Keep account
          </span>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
          >
            Add Note
          </button>
        </div>
      </form>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`p-5 rounded-3xl border flex flex-col justify-between space-y-3 shadow-sm ${note.color}`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-white leading-snug">{note.title}</h3>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-wrap">{note.content}</p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/40">
              <span className="font-medium text-teal-400">{note.tag}</span>
              <button
                onClick={() => setActiveTab('case-notes')}
                className="text-slate-300 hover:text-white font-semibold flex items-center gap-1"
              >
                Promote to SOAP <ArrowRight className="w-3 h-3 text-teal-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
