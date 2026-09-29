'use client';

import React, { useState } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { ABCLog } from '@/types';
import { Activity, Plus, BarChart2, CheckCircle2, TrendingUp, X } from 'lucide-react';

export const ABCAnalyserModule: React.FC = () => {
  const { abcLogs, clients, addABCLog } = useManagementStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<ABCLog>>({
    clientId: clients[0]?.id || 'client-1',
    clientName: clients[0]?.name || '',
    timestamp: new Date().toISOString(),
    timeOfDay: '14:30',
    dayOfWeek: 'Monday',
    location: 'Community Setting',
    antecedent: '',
    behavior: '',
    consequence: '',
    intensity: 3,
    durationMinutes: 10,
    perceivedFunction: 'Escape/Avoidance',
    recordedBy: 'Support Practitioner'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === formData.clientId);
    const clientName = client?.name || formData.clientName || 'Participant';
    addABCLog({
      clientId: formData.clientId || 'client-1',
      clientName,
      timestamp: formData.timestamp || new Date().toISOString(),
      timeOfDay: formData.timeOfDay || '14:30',
      dayOfWeek: formData.dayOfWeek || 'Monday',
      location: formData.location || 'Community Setting',
      antecedent: formData.antecedent || 'General demand',
      behavior: formData.behavior || 'Target behaviour observed',
      consequence: formData.consequence || 'Redirection provided',
      intensity: formData.intensity || 3,
      durationMinutes: formData.durationMinutes || 10,
      perceivedFunction: formData.perceivedFunction || 'Escape/Avoidance',
      recordedBy: formData.recordedBy || 'Support Practitioner'
    });
    setIsAddOpen(false);
  };

  // Hypothesized function distribution
  const functionCounts: Record<string, number> = {};
  abcLogs.forEach((log) => {
    const fn = log.perceivedFunction || 'Sensory/Automatic';
    functionCounts[fn] = (functionCounts[fn] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">ABC Behaviour Analyser (PBS)</h1>
          <p className="text-xs text-slate-400">
            Antecedent-Behaviour-Consequence tracking and functional behaviour assessment (FBA)
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Log ABC Episode
        </button>
      </div>

      {/* Function of Behaviour Synthesis */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-teal-400" /> Functional Behaviour Assessment (FBA) Synthesis
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Escape / Avoidance', 'Tangible Access', 'Social Attention', 'Sensory / Automatic'].map((fn) => {
            const count = functionCounts[fn] || 0;
            const percentage = abcLogs.length > 0 ? Math.round((count / abcLogs.length) * 100) : 0;
            return (
              <div key={fn} className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 truncate block">{fn}</span>
                <p className="text-xl font-extrabold text-white">{count} <span className="text-xs font-normal text-slate-400">({percentage}%)</span></p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ABC Records Timeline */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white">Recent Clinical Observations</h2>
        <div className="space-y-3">
          {abcLogs.map((log) => (
            <div
              key={log.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{log.clientName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-mono">
                    {log.timestamp?.slice(0, 10) || '2026-03-08'} @ {log.timeOfDay || '14:30'}
                  </span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 font-semibold">
                  Function: {log.perceivedFunction || 'Sensory/Automatic'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide">
                    A — Antecedent (Trigger)
                  </span>
                  <p className="text-slate-200">{log.antecedent}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">
                    B — Behaviour (Topography)
                  </span>
                  <p className="text-slate-200">{log.behavior}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Intensity: {log.intensity} • Duration: {log.durationMinutes}m
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                    C — Consequence (Response)
                  </span>
                  <p className="text-slate-200">{log.consequence}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add ABC Log Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Record ABC Observation</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Participant</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Date</label>
                  <input
                    type="date"
                    value={formData.timestamp?.slice(0, 10) || '2026-03-08'}
                    onChange={(e) => setFormData({ ...formData, timestamp: new Date(e.target.value).toISOString() })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Time</label>
                  <input
                    type="time"
                    value={formData.timeOfDay || '14:30'}
                    onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Antecedent (Setting event / trigger)</label>
                <textarea
                  rows={2}
                  required
                  value={formData.antecedent}
                  onChange={(e) => setFormData({ ...formData, antecedent: e.target.value })}
                  placeholder="Transition demand, loud environment, denied request..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Behaviour (Specific observable action)</label>
                <textarea
                  rows={2}
                  required
                  value={formData.behavior}
                  onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}
                  placeholder="Property destruction, physical aggression, vocal protest..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Consequence (Staff / environment response)</label>
                <textarea
                  rows={2}
                  required
                  value={formData.consequence}
                  onChange={(e) => setFormData({ ...formData, consequence: e.target.value })}
                  placeholder="Task removed, verbal reassurance provided, quiet space offered..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Perceived Function</label>
                <select
                  value={formData.perceivedFunction}
                  onChange={(e) => setFormData({ ...formData, perceivedFunction: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="Escape/Avoidance">Escape / Avoidance</option>
                  <option value="Tangible/Access">Tangible Access</option>
                  <option value="Attention/Social">Attention / Social</option>
                  <option value="Sensory/Automatic">Sensory / Automatic</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-white"
                >
                  Save Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
