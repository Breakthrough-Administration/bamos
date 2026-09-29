'use client';

import React from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { Lock, ShieldCheck, Key, Users, Eye, CheckCircle2 } from 'lucide-react';

export const SecurityAuditModule: React.FC = () => {
  const { users } = useManagementStore();

  const permissionsMatrix = [
    { role: 'ADMIN', viewNotes: true, signNotes: true, billing: true, exportAudit: true, manageStaff: true },
    { role: 'PRACTITIONER', viewNotes: true, signNotes: true, billing: true, exportAudit: false, manageStaff: false },
    { role: 'AUDITOR', viewNotes: true, signNotes: false, billing: true, exportAudit: true, manageStaff: false },
    { role: 'VIEWER', viewNotes: true, signNotes: false, billing: false, exportAudit: false, manageStaff: false },
    { role: 'PARTICIPANT', viewNotes: false, signNotes: false, billing: false, exportAudit: false, manageStaff: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Security & Access Governance</h1>
          <p className="text-xs text-slate-400">
            Role-Based Access Control (RBAC), HIPAA / Privacy Act 1988 health record security, and key management
          </p>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-teal-400">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Encryption Protocol</span>
          </div>
          <p className="text-xl font-extrabold text-white">AES-256 / TLS 1.3</p>
          <p className="text-[11px] text-slate-400">Encrypted at rest & in transit</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-teal-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Authentication</span>
          </div>
          <p className="text-xl font-extrabold text-white">Google SSO + MFA</p>
          <p className="text-[11px] text-slate-400">Firebase Auth verified session</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-teal-400">
            <Key className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Data Residency</span>
          </div>
          <p className="text-xl font-extrabold text-white">Australia (sydney-1)</p>
          <p className="text-[11px] text-slate-400">NDIS Australian data sovereignty</p>
        </div>
      </div>

      {/* RBAC Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Role-Based Access Control (RBAC) Permissions</h2>
          <span className="text-xs text-teal-400 font-semibold">NDIS Standard 4.1</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">View Clinical Notes</th>
                <th className="p-4 text-center">Sign Case Notes</th>
                <th className="p-4 text-center">NDIS PRODA Claims</th>
                <th className="p-4 text-center">Audit Dossier Export</th>
                <th className="p-4 text-center">Staff & Workforce HR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {permissionsMatrix.map((p) => (
                <tr key={p.role} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white">{p.role}</td>
                  <td className="p-4 text-center">{p.viewNotes ? <CheckCircle2 className="w-4 h-4 text-teal-400 mx-auto" /> : '—'}</td>
                  <td className="p-4 text-center">{p.signNotes ? <CheckCircle2 className="w-4 h-4 text-teal-400 mx-auto" /> : '—'}</td>
                  <td className="p-4 text-center">{p.billing ? <CheckCircle2 className="w-4 h-4 text-teal-400 mx-auto" /> : '—'}</td>
                  <td className="p-4 text-center">{p.exportAudit ? <CheckCircle2 className="w-4 h-4 text-teal-400 mx-auto" /> : '—'}</td>
                  <td className="p-4 text-center">{p.manageStaff ? <CheckCircle2 className="w-4 h-4 text-teal-400 mx-auto" /> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
