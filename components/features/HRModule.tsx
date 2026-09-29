'use client';

import React, { useState } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { ScheduledShift } from '@/types';
import {
  FileSpreadsheet,
  Plus,
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export const HRModule: React.FC = () => {
  const { practitioners, scheduledShifts, clients, addScheduledShift } = useManagementStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [shiftForm, setShiftForm] = useState<Partial<ScheduledShift>>({
    practitionerId: practitioners[0]?.id || 'prac-1',
    practitionerName: practitioners[0]?.name || '',
    clientId: clients[0]?.id || 'client-1',
    clientName: clients[0]?.name || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    status: 'Scheduled',
    schadsClassification: 'SCHADS Level 4.1'
  });

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    const prac = practitioners.find((p) => p.id === shiftForm.practitionerId);
    const client = clients.find((c) => c.id === shiftForm.clientId);

    addScheduledShift({
      ...shiftForm,
      practitionerName: prac?.name || shiftForm.practitionerName,
      clientName: client?.name || shiftForm.clientName
    });
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">SCHADS Award Roster & HR Credentials</h1>
          <p className="text-xs text-slate-400">
            Workforce screening verification, AHPRA credentials, and SCHADS award compliance
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule Roster Shift
        </button>
      </div>

      {/* SCHADS Award Compliance Banner */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-bold text-white">SCHADS Award 2010 Automated Rules Engine Active</p>
          <p className="text-slate-400">
            Enforcing minimum 2-hour engagements, broken shift allowances, 10-hour rest breaks between shifts, and overtime penalties.
          </p>
        </div>
      </div>

      {/* Practitioners List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white">Clinical & Support Workforce</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {practitioners.map((prac) => (
            <div
              key={prac.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{prac.name}</h3>
                  <p className="text-xs text-teal-400 font-semibold">{prac.role}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">
                  {prac.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between text-slate-400">
                  <span>AHPRA / Professional Reg:</span>
                  <span className="font-mono text-white">{prac.registrationNumber || 'MED00021482'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>NDIS Worker Screening Check:</span>
                  <span className="text-teal-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Valid (2028)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Working with Children (WWCC):</span>
                  <span className="text-teal-400 font-semibold">Current (VIC)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Shifts Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Upcoming SCHADS Roster Schedule</h2>
          <span className="text-xs text-slate-400">{scheduledShifts.length} shifts confirmed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Practitioner</th>
                <th className="p-4">Participant</th>
                <th className="p-4">Date</th>
                <th className="p-4">Time Span</th>
                <th className="p-4">SCHADS Award Classification</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {scheduledShifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No active shifts scheduled today. Click &quot;Schedule Roster Shift&quot; above.
                  </td>
                </tr>
              ) : (
                scheduledShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">{shift.practitionerName}</td>
                    <td className="p-4 text-slate-300">{shift.clientName}</td>
                    <td className="p-4 whitespace-nowrap">{shift.date}</td>
                    <td className="p-4 whitespace-nowrap font-mono">{shift.startTime} - {shift.endTime}</td>
                    <td className="p-4 font-mono text-teal-400">{shift.schadsClassification}</td>
                    <td className="p-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-semibold">
                        {shift.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Shift Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Schedule Roster Shift</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Practitioner</label>
                <select
                  value={shiftForm.practitionerId}
                  onChange={(e) => setShiftForm({ ...shiftForm, practitionerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  {practitioners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Participant</label>
                <select
                  value={shiftForm.clientId}
                  onChange={(e) => setShiftForm({ ...shiftForm, clientId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Date</label>
                  <input
                    type="date"
                    value={shiftForm.date}
                    onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Start</label>
                  <input
                    type="time"
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">End</label>
                  <input
                    type="time"
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">SCHADS Classification</label>
                <select
                  value={shiftForm.schadsClassification}
                  onChange={(e) => setShiftForm({ ...shiftForm, schadsClassification: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option>SCHADS Level 4.1 (Therapy Assistant)</option>
                  <option>SCHADS Level 5.1 (Allied Health Practitioner)</option>
                  <option>SCHADS Level 6.2 (Senior Clinician / Supervisor)</option>
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
                  Schedule Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
