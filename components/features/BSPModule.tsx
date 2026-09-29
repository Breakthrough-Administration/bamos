'use client';

import React, { useState } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { FileCheck, Shield, AlertTriangle, CheckCircle2, Save, Printer } from 'lucide-react';

export const BSPModule: React.FC = () => {
  const { bsp, updateBSP, clients, selectedClientId, setSelectedClientId } =
    useManagementStore();

  const [activeSection, setActiveSection] = useState<'proactive' | 'active' | 'reactive'>('proactive');
  const [proactiveText, setProactiveText] = useState(
    Array.isArray(bsp?.proactiveStrategies)
      ? bsp.proactiveStrategies.join('\n')
      : '1. High predictability: Provide visual schedules prior to all community outings.\n2. Sensory diet: Integrate 15-minute low-stimulation breaks in quiet sensory corner.\n3. Functional communication: Prompt use of AAC board before demanding transitions.'
  );
  const [activeText, setActiveText] = useState(
    '1. Early warning sign recognition (fidgeting, vocal volume elevation).\n2. Reduce verbal instructions to single-step clear directives.\n3. Validate emotional state and offer choice of calming tools.'
  );
  const [reactiveText, setReactiveText] = useState(
    Array.isArray(bsp?.reactiveStrategies)
      ? bsp.reactiveStrategies.join('\n')
      : '1. Ensure immediate physical safety of participant and nearby individuals.\n2. Disengage attention and eliminate demands until baseline respiration resumes.\n3. Apply authorized environmental restraint ONLY if acute danger of self-harm exists.'
  );

  const [saved, setSaved] = useState(false);

  const handleSavePlan = () => {
    updateBSP({
      proactiveStrategies: proactiveText.split('\n').filter(Boolean),
      reactiveStrategies: reactiveText.split('\n').filter(Boolean),
      reviewDate: '2026-12-31'
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Behaviour Support Plan (BSP)</h1>
          <p className="text-xs text-slate-400">
            Comprehensive positive behaviour support framework compliant with NDIS Practice Standards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print BSP
          </button>
          <button
            onClick={handleSavePlan}
            className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-teal-600/20"
          >
            <Save className="w-4 h-4" /> Save BSP Changes
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> BSP Document revisions successfully saved to clinical record.
        </div>
      )}

      {/* Overview Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Participant</span>
          <p className="text-sm font-bold text-white">{bsp?.clientName || 'Liam O’Connor'}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Practitioner</span>
          <p className="text-sm font-bold text-white">Dr. Sarah Jenkins, BCBA</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
          <p className="text-sm font-bold text-teal-400">Commission Approved</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Next Mandatory Review</span>
          <p className="text-sm font-bold text-white">{bsp?.reviewDate || '2026-12-31'}</p>
        </div>
      </div>

      {/* Strategy Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSection('proactive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSection === 'proactive'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Proactive Strategies (Primary)
        </button>
        <button
          onClick={() => setActiveSection('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSection === 'active'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Active / Early Warning (Secondary)
        </button>
        <button
          onClick={() => setActiveSection('reactive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSection === 'reactive'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Reactive / Crisis Protocol (Tertiary)
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
        {activeSection === 'proactive' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Proactive Environmental & Skill Building Strategies</h3>
            <p className="text-xs text-slate-400">
              Modifications to the environment, schedule, and communicative opportunities designed to prevent distress before it emerges.
            </p>
            <textarea
              rows={8}
              value={proactiveText}
              onChange={(e) => setProactiveText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500"
            />
          </div>
        )}

        {activeSection === 'active' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Active De-escalation & Trigger Mitigation</h3>
            <p className="text-xs text-slate-400">
              Immediate interventions applied during rumbling phases to divert attention, validate affect, and restore equilibrium safely.
            </p>
            <textarea
              rows={8}
              value={activeText}
              onChange={(e) => setActiveText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500"
            />
          </div>
        )}

        {activeSection === 'reactive' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Crisis Management & Reactive Protocol</h3>
            <p className="text-xs text-slate-400">
              Least restrictive emergency actions to maintain physical safety during acute behavioural crises.
            </p>
            <textarea
              rows={8}
              value={reactiveText}
              onChange={(e) => setReactiveText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
