'use client';

import React, { useState, useEffect } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import {
  QuickNoteDoc,
  subscribeToQuickNotes,
  saveQuickNote,
  deleteQuickNote,
  convertQuickNoteToBIRPCaseNote
} from '@/lib/firestoreService';
import { StickyNote, Plus, Check, ArrowRight, Trash2, Tag, FileText, CheckCircle2, X, RefreshCw } from 'lucide-react';

export const GoogleKeepModule: React.FC = () => {
  const { clients, currentUser, addCaseNote, setActiveTab, setSelectedClientId } = useManagementStore();

  const [notes, setNotes] = useState<QuickNoteDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedClientForNew, setSelectedClientForNew] = useState<string>(clients[0]?.id || '');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // BIRP Conversion Modal state
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [activeNoteToConvert, setActiveNoteToConvert] = useState<QuickNoteDoc | null>(null);
  const [convertClientId, setConvertClientId] = useState<string>(clients[0]?.id || '');
  const [interventionText, setInterventionText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [planText, setPlanText] = useState('');
  const [isSubmittingBIRP, setIsSubmittingBIRP] = useState(false);

  // Subscribe to real-time Firestore quickNotes collection
  useEffect(() => {
    const unsub = subscribeToQuickNotes(
      (docs) => {
        if (docs && docs.length > 0) {
          setNotes(docs);
        } else {
          // Provide default starter quick notes if empty
          const initialStarterNotes: QuickNoteDoc[] = [
            {
              id: 'kn-1',
              title: 'Liam O’Connor - Sensory Observation',
              content: 'Transition from park was smooth using the tactile countdown timer. Remember to share visual schedule with mum.',
              color: 'bg-teal-950/40 border-teal-500/30',
              tag: 'Clinical Field Note',
              date: 'Today, 11:20 AM',
              clientId: 'cli-001',
              clientName: 'Liam O’Connor',
              isConverted: false
            },
            {
              id: 'kn-2',
              title: 'NDIS Plan Review Meeting Prep',
              content: 'Extract latest WHODAS score (24/48) and compiled ABC logs to support increased CB Daily Activity hours.',
              color: 'bg-amber-950/40 border-amber-500/30',
              tag: 'Audit & Review',
              date: 'Yesterday',
              clientId: 'cli-002',
              clientName: 'Marcus Sterling',
              isConverted: false
            },
            {
              id: 'kn-3',
              title: 'Equipment check for Marcus Sterling',
              content: 'Check non-slip wheelchair footplate adjustment with OT before next Friday community access session.',
              color: 'bg-purple-950/40 border-purple-500/30',
              tag: 'Allied Health Followup',
              date: '2 days ago',
              clientId: 'cli-002',
              clientName: 'Marcus Sterling',
              isConverted: false
            }
          ];
          setNotes(initialStarterNotes);
          initialStarterNotes.forEach((n) => saveQuickNote(n).catch(() => {}));
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Could not subscribe to quickNotes:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const matchedClient = clients.find((c) => c.id === selectedClientForNew);

    const note: QuickNoteDoc = {
      id: `kn-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      color: 'bg-slate-800/40 border-slate-700/40',
      tag: 'Clinical Field Observation',
      date: 'Just now',
      clientId: matchedClient?.id || '',
      clientName: matchedClient?.name || '',
      isConverted: false,
      createdAt: new Date().toISOString()
    };

    setNotes((prev) => [note, ...prev]);
    await saveQuickNote(note).catch((err) => console.warn('Offline note save:', err));

    setNewTitle('');
    setNewContent('');
    setSuccessBanner('Mobile field observation saved to Firestore quickNotes collection.');
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handleDelete = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await deleteQuickNote(id).catch(() => {});
  };

  const openConvertModal = (note: QuickNoteDoc) => {
    setActiveNoteToConvert(note);
    setConvertClientId(note.clientId || clients[0]?.id || '');
    setInterventionText(
      `Direct positive reinforcement, tactile scheduling tool, and communication board prompt provided by practitioner.`
    );
    setResponseText(
      `Participant responded positively with calm affect, engaged within 2 minutes of de-escalation prompt.`
    );
    setPlanText(
      `Review proactive environmental modifications with primary carer. Continue PBS plan strategies.`
    );
    setConvertModalOpen(true);
  };

  const handleExecuteConvertBIRP = async () => {
    if (!activeNoteToConvert) return;
    setIsSubmittingBIRP(true);

    const targetClient = clients.find((c) => c.id === convertClientId) || clients[0];

    try {
      const createdNote = await convertQuickNoteToBIRPCaseNote({
        note: activeNoteToConvert,
        clientId: targetClient.id,
        clientName: targetClient.name,
        practitionerId: currentUser?.id || 'prac-1',
        practitionerName: currentUser?.name || 'Principal Clinician',
        interventionText,
        responseText,
        planText
      });

      // Update store
      addCaseNote(createdNote);

      // Update local state note as converted
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNoteToConvert.id
            ? { ...n, isConverted: true, convertedCaseNoteId: createdNote.id, clientName: targetClient.name }
            : n
        )
      );

      setSuccessBanner(
        `Field note converted to formal BIRP Case Note for ${targetClient.name} and attached to client record in Firestore.`
      );
      setConvertModalOpen(false);
      setActiveNoteToConvert(null);
    } catch (err: any) {
      console.error('Error converting quick note to BIRP:', err);
    } finally {
      setIsSubmittingBIRP(false);
      setTimeout(() => setSuccessBanner(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Google Keep Clinical Field Sync</h1>
          <p className="text-xs text-slate-400">
            Rapid voice memos & mobile observations in Firestore (<code className="text-teal-400">quickNotes</code>), ready to attach as formal BIRP case notes to participant profiles
          </p>
        </div>
      </div>

      {successBanner && (
        <div className="p-3.5 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-teal-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* New Note Form */}
      <form
        onSubmit={handleAdd}
        className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Observation Subject (e.g. Liam O’Connor - Sensory Transition)..."
            className="flex-1 bg-transparent text-sm font-bold text-white placeholder-slate-500 focus:outline-none"
          />
          <select
            value={selectedClientForNew}
            onChange={(e) => setSelectedClientForNew(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="">Select Participant (Optional)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          rows={2}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Take a clinical note or mobile observation in the field (Behavior / Trigger / Sensory cue)..."
          className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-500 focus:outline-none resize-none"
        />

        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-teal-400" /> Synced with Firestore quickNotes
          </span>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Save Observation
          </button>
        </div>
      </form>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`p-5 rounded-3xl border flex flex-col justify-between space-y-3 shadow-sm transition-all ${
              note.isConverted
                ? 'bg-slate-900/40 border-slate-800 opacity-75'
                : note.color || 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{note.title}</h3>
                  {note.clientName && (
                    <span className="text-[10px] text-teal-400 font-semibold block">
                      Participant: {note.clientName}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-wrap">{note.content}</p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/40">
              <span className="font-medium text-teal-400">{note.tag || 'Field Note'}</span>
              
              {note.isConverted ? (
                <span className="text-xs text-teal-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Attached as BIRP
                </span>
              ) : (
                <button
                  onClick={() => openConvertModal(note)}
                  className="px-2.5 py-1 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 border border-teal-500/30 hover:border-teal-500/60 font-bold flex items-center gap-1 transition-all"
                  title="Convert observation to formal BIRP Case Note attached to client file"
                >
                  <FileText className="w-3 h-3 text-teal-400" />
                  <span>Convert to BIRP Case Note</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* BIRP Conversion Modal */}
      {convertModalOpen && activeNoteToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <h2 className="text-base font-bold text-white">Convert Observation to BIRP Case Note</h2>
              </div>
              <button
                onClick={() => setConvertModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Target Participant File</label>
                <select
                  value={convertClientId}
                  onChange={(e) => setConvertClientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (NDIS: {c.ndisNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">B - Behavior (Observed Field Note)</label>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs">
                  {activeNoteToConvert.content}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">I - Intervention (Clinical Strategy)</label>
                <textarea
                  rows={2}
                  value={interventionText}
                  onChange={(e) => setInterventionText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">R - Response (Participant Outcome)</label>
                <textarea
                  rows={2}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">P - Plan (Next Actions & Review)</label>
                <textarea
                  rows={2}
                  value={planText}
                  onChange={(e) => setPlanText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConvertModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteConvertBIRP}
                disabled={isSubmittingBIRP}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-teal-900/30"
              >
                {isSubmittingBIRP ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Attach BIRP to Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
