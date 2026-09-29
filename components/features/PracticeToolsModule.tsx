'use client';

import React, { useState } from 'react';
import { Wrench, CheckCircle2, ShieldAlert, FileText, Calculator } from 'lucide-react';

export const PracticeToolsModule: React.FC = () => {
  // WHODAS 2.0 12-item quick screener
  const [whodasScores, setWhodasScores] = useState<number[]>([1, 2, 2, 3, 1, 2, 3, 2, 1, 2, 3, 2]);

  // Section 34 Checklist
  const [s34Checks, setS34Checks] = useState<Record<string, boolean>>({
    goals: true,
    socialEconomic: true,
    valueForMoney: true,
    effectiveAndBeneficial: true,
    familyExpectations: true,
    mostAppropriateNdis: true
  });

  const totalWhodas = whodasScores.reduce((a, b) => a + b, 0);
  const whodasPercentage = Math.round((totalWhodas / 48) * 100);

  const toggleS34 = (key: string) => {
    setS34Checks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isS34Compliant = Object.values(s34Checks).every(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Clinical Assessment & Diagnostic Tools</h1>
          <p className="text-xs text-slate-400">
            Validated assessment scales, WHODAS 2.0 functional impairment index, and Section 34 NDIS compliance evaluators
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool 1: WHODAS 2.0 Screener */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal-400" /> WHODAS 2.0 Functional Score
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 font-bold">
              Impairment: {whodasPercentage}%
            </span>
          </div>

          <p className="text-xs text-slate-400">
            12-item clinical screener measuring functional difficulty across cognition, mobility, self-care, and community participation.
          </p>

          <div className="space-y-2.5">
            {[
              'Standing for long periods (e.g. 30 mins)',
              'Taking care of household responsibilities',
              'Learning a new task or processing instructions',
              'Joining in community activities / social events',
              'Concentrating on tasks for 10+ minutes',
              'Walking a long distance (1 km)'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <span className="text-slate-200 truncate pr-2">{item}</span>
                <select
                  value={whodasScores[idx]}
                  onChange={(e) => {
                    const next = [...whodasScores];
                    next[idx] = Number(e.target.value);
                    setWhodasScores(next);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px]"
                >
                  <option value={0}>0 - None</option>
                  <option value={1}>1 - Mild</option>
                  <option value={2}>2 - Moderate</option>
                  <option value={3}>3 - Severe</option>
                  <option value={4}>4 - Extreme</option>
                </select>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-300">
            Total Raw Score: <strong className="text-white">{totalWhodas} / 48</strong> — Provides robust clinical objective justification for NDIS plan funding reviews.
          </div>
        </div>

        {/* Tool 2: NDIS Act 2013 Section 34 Criteria Audit */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Section 34 Reasonable & Necessary Audit
            </h2>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                isS34Compliant ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {isS34Compliant ? 'NDIS Audit Ready' : 'Criteria Gap'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Mandatory criteria from the National Disability Insurance Scheme Act 2013 for justifying therapeutic support hours.
          </p>

          <div className="space-y-2">
            {[
              { id: 'goals', label: 'Assists the participant to pursue goals, objectives, and aspirations' },
              { id: 'socialEconomic', label: 'Facilitates social, economic, and community participation' },
              { id: 'valueForMoney', label: 'Represents value for money relative to benefits achieved' },
              { id: 'effectiveAndBeneficial', label: 'Effective and beneficial for the participant (evidence-based PBS)' },
              { id: 'familyExpectations', label: 'Takes into account reasonable expectations of informal carers & family' },
              { id: 'mostAppropriateNdis', label: 'Support is most appropriately funded by the NDIS rather than Medicare/PBS' },
            ].map((rule) => (
              <label
                key={rule.id}
                onClick={() => toggleS34(rule.id)}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-200 cursor-pointer hover:bg-slate-800/70 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={s34Checks[rule.id]}
                  readOnly
                  className="mt-0.5 rounded text-teal-500 focus:ring-0"
                />
                <span>{rule.label}</span>
              </label>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            Allied health progress notes cross-reference these six criteria automatically during audit export.
          </div>
        </div>
      </div>
    </div>
  );
};
