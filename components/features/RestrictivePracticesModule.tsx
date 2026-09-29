'use client';

import React, { useState } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { RestrictivePractice } from '@/types';
import { ShieldAlert, Plus, CheckCircle2, Clock, FileCheck, X } from 'lucide-react';

export const RestrictivePracticesModule: React.FC = () => {
  const { restrictivePractices, clients, addRestrictivePractice, updateRestrictivePractice } =
    useManagementStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<RestrictivePractice>>({
    clientId: clients[0]?.id || 'client-1',
    clientName: clients[0]?.name || '',
    type: 'Environmental',
    description: '',
    authorizedBy: 'State Authorisation Authority / VCAT',
    authorizationDate: new Date().toISOString().split('T')[0],
    expiryDate: '2026-12-31',
    status: 'Authorised',
    monthlyReportStatus: 'Due',
    reductionStrategy: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === formData.clientId);
    addRestrictivePractice({
      ...formData,
      clientName: client?.name || formData.clientName
    });
    setIsAddOpen(false);
  };

  const markReportSubmitted = (id: string) => {
    updateRestrictivePractice(id, { monthlyReportStatus: 'Submitted' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Regulated Restrictive Practices</h1>
          <p className="text-xs text-slate-400">
            Mandatory reduction plans, state panel authorisations, and NDIS Commission monthly portal logs
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Regulated Practice
        </button>
      </div>

      {/* Regulated Practice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {restrictivePractices.map((rp) => (
          <div
            key={rp.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 uppercase tracking-wide">
                  {rp.type} Restraint
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{rp.clientName}</h3>
                <p className="text-[11px] text-slate-400 font-medium">Authorised: {rp.authorizedBy}</p>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    rp.monthlyReportStatus === 'Due'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-teal-500/10 text-teal-400'
                  }`}
                >
                  Monthly Log: {rp.monthlyReportStatus}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Expires: {rp.expiryDate}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Protocol & Description
              </span>
              <p className="text-slate-200">{rp.description}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide">
                Mandatory Reduction Strategy
              </span>
              <p className="text-slate-200">{rp.reductionStrategy || 'Gradual desensitisation and environmental modification.'}</p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
              <span className="text-slate-400 font-mono text-[11px]">Panel Ref: {rp.authorizationDate}</span>
              {rp.monthlyReportStatus === 'Due' && (
                <button
                  onClick={() => markReportSubmitted(rp.id)}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Submit Monthly Log to Commission
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Record Regulated Practice</h3>
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
                  <label className="text-slate-300 font-semibold">Restraint Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option>Environmental</option>
                    <option>Chemical</option>
                    <option>Mechanical</option>
                    <option>Physical</option>
                    <option>Seclusion</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Authorisation Expiry</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Clinical Protocol & Circumstances</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specify exact condition, rationale, duration, and safety protocols..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Reduction & Elimination Strategy</label>
                <textarea
                  rows={2}
                  required
                  value={formData.reductionStrategy}
                  onChange={(e) => setFormData({ ...formData, reductionStrategy: e.target.value })}
                  placeholder="PBS positive replacement skills and steps to fade the practice..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
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
                  Save Practice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
