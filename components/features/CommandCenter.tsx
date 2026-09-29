'use client';

import React from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import {
  Users,
  DollarSign,
  AlertOctagon,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar,
  FilePlus,
  ArrowUpRight,
  TrendingUp,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const {
    clients,
    caseNotes,
    incidents,
    restrictivePractices,
    claims,
    currentUser,
    setActiveTab,
    setSelectedClientId
  } = useManagementStore();

  const activeClients = clients.filter((c) => c.status === 'Active');
  const criticalIncidents = incidents.filter((i) => i.severity?.includes('Critical'));
  const pendingClaims = claims.filter((c) => c.status === 'Pending');
  const totalBilled = claims.reduce((acc, c) => acc + (c.totalAmount || 0), 0);
  const dueRP = restrictivePractices.filter((r) => r.monthlyReportStatus === 'Due');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900/30 via-slate-900 to-slate-900 border border-teal-500/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>NDIS Clinical Operations Live</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            {currentUser?.position || 'Principal Specialist'} — {activeClients.length} active participants under direct practice supervision.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActiveTab('case-notes')}
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-lg shadow-teal-600/20 flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" /> Log Session Note
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700 flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-teal-400" /> PRODA Invoicing
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('clients')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Caseload</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-white">{activeClients.length}</p>
            <span className="text-xs text-teal-400 flex items-center gap-0.5 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> 100% NDIS
            </span>
          </div>
          <p className="text-xs text-slate-400">Total active participants</p>
        </div>

        <div
          onClick={() => setActiveTab('billing')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">NDIS Claims</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-white">${totalBilled.toLocaleString()}</p>
            <span className="text-xs text-amber-400 font-semibold">{pendingClaims.length} pending</span>
          </div>
          <p className="text-xs text-slate-400">Claims processed this cycle</p>
        </div>

        <div
          onClick={() => setActiveTab('incidents')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Reportable Incidents</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-colors">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-white">{criticalIncidents.length}</p>
            <span className="text-xs text-teal-400 font-semibold">24h Notices Lodged</span>
          </div>
          <p className="text-xs text-slate-400">Statutory Commission watch</p>
        </div>

        <div
          onClick={() => setActiveTab('restrictive-practices')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Restrictive Practices</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-white">{restrictivePractices.length}</p>
            <span className="text-xs text-amber-400 font-semibold">{dueRP.length} Due Soon</span>
          </div>
          <p className="text-xs text-slate-400">Authorised reduction plans</p>
        </div>
      </div>

      {/* Two-Column Section: Compliance Checklist & Recent Clinical Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Clinical Progress Notes */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Clinical Case Notes</h2>
              <p className="text-xs text-slate-400">SIMPL & BIRP progress notes signed by practitioners</p>
            </div>
            <button
              onClick={() => setActiveTab('case-notes')}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {caseNotes.slice(0, 4).map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  if (note.clientId) setSelectedClientId(note.clientId);
                  setActiveTab('case-notes');
                }}
                className="p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 transition-all cursor-pointer flex items-start justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{note.clientName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-mono">
                      {note.format || 'SOAP'}
                    </span>
                    <span className="text-[10px] text-slate-400">{note.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{note.subjective || note.assessment}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-teal-400 font-semibold">{note.practitionerName}</span>
                  <p className="text-[10px] text-slate-400">{note.sessionDurationMinutes} mins</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Operational Deadlines & Governance Alerts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Operational Checklist</h2>
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">PRODA PACE Sync</p>
                <p className="text-[11px] text-slate-400">2026 Price guide version active</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">NDIS Commission Report</p>
                <p className="text-[11px] text-slate-400">
                  {dueRP.length > 0 ? `${dueRP.length} restrictive practice monthly logs due` : 'All monthly logs current'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Worker Screening (WSC)</p>
                <p className="text-[11px] text-slate-400">All registered practitioners verified</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('audit')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              Open Audit & Quality Dashboard <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
