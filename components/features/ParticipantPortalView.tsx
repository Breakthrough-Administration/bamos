'use client';

import React from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { UserCheck, Target, Calendar, Phone, CheckCircle2, Award } from 'lucide-react';

export const ParticipantPortalView: React.FC = () => {
  const { clients, selectedClientId } = useManagementStore();
  const currentParticipant = clients.find((c) => c.id === selectedClientId) || clients[0];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-900/30 via-slate-900 to-slate-900 border border-teal-500/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" /> Participant & Nominee Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hello, {currentParticipant?.name || 'Participant'}
          </h1>
          <p className="text-xs text-slate-400">
            NDIS Number: {currentParticipant?.ndisNumber} • Managed by Breakthrough Allied Health
          </p>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contact Clinician
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Scheduled Appointment */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" /> Upcoming Therapy Session
            </h2>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 font-bold">
              Confirmed
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2">
            <p className="text-lg font-bold text-white">Community Capacity Building Session</p>
            <p className="text-xs text-slate-300">With Dr. Sarah Jenkins, Behaviour Support Practitioner</p>
            <p className="text-xs text-teal-400 font-mono">Friday at 10:00 AM — 11:30 AM</p>
            <p className="text-[11px] text-slate-400">
              Location: Participant Residence ({typeof currentParticipant?.address === 'string' ? currentParticipant.address : currentParticipant?.address?.suburb || 'Metro'})
            </p>
          </div>
        </div>

        {/* Goals Summary */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-400" /> My Goals Progress
            </h2>
            <span className="text-[10px] text-teal-400 font-semibold">2026 NDIS Plan</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white">Emotional Regulation & Sensory Routine</span>
                <span className="text-teal-400">75%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white">Independent Public Transport Navigation</span>
                <span className="text-teal-400">45%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
