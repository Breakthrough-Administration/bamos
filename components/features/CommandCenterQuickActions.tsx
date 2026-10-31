'use client';

import React, { useState } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { CaseNote, Incident, ClientGoal } from '@/types';
import {
  Zap,
  Plus,
  X,
  FileText,
  AlertOctagon,
  Target,
  FolderSync,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { GoogleDriveFolderIngestModal } from './GoogleDriveFolderIngestModal';

interface CommandCenterQuickActionsProps {
  onOpenDriveIngest?: () => void;
}

export const CommandCenterQuickActions: React.FC<CommandCenterQuickActionsProps> = ({
  onOpenDriveIngest
}) => {
  const {
    clients,
    selectedClientId,
    setSelectedClientId,
    setActiveTab,
    addCaseNote,
    addIncident,
    addClientGoal,
    addAuditLog,
    addNotification,
    currentUser
  } = useManagementStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'case-note' | 'incident' | 'goal' | 'drive' | null>(null);
  const [successToast, setSuccessToast] = useState<{ message: string; targetTab?: any } | null>(null);

  // Form states
  const defaultClientId = selectedClientId || clients[0]?.id || 'cli-001';

  // 1. Case Note Form State
  const [noteClientId, setNoteClientId] = useState(defaultClientId);
  const [noteFormat, setNoteFormat] = useState<'SOAP' | 'BIRP' | 'SIMPL'>('SOAP');
  const [noteDuration, setNoteDuration] = useState(60);
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [noteSubjective, setNoteSubjective] = useState('');
  const [noteObjective, setNoteObjective] = useState('');
  const [noteAssessment, setNoteAssessment] = useState('');
  const [notePlan, setNotePlan] = useState('');

  // 2. Incident Form State
  const [incidentClientId, setIncidentClientId] = useState(defaultClientId);
  const [incidentType, setIncidentType] = useState('Behaviour of Concern');
  const [incidentSeverity, setIncidentSeverity] = useState('Critical - 24h Commission Reportable');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentActionTaken, setIncidentActionTaken] = useState('');
  const [incidentReportedCommission, setIncidentReportedCommission] = useState(false);

  // 3. Goal Form State
  const [goalClientId, setGoalClientId] = useState(defaultClientId);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('Capacity Building');
  const [goalTargetDate, setGoalTargetDate] = useState(
    new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]
  );
  const [goalProgress, setGoalProgress] = useState(25);
  const [goalGasScore, setGoalGasScore] = useState<-2 | -1 | 0 | 1 | 2>(-1);
  const [goalDescription, setGoalDescription] = useState('');

  const triggerToast = (message: string, targetTab?: any) => {
    setSuccessToast({ message, targetTab });
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Submission Handlers
  const handleSaveCaseNote = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.id === noteClientId) || clients[0];
    const clientName = targetClient ? targetClient.name : 'NDIS Participant';

    const newNote: Partial<CaseNote> = {
      id: `note-${Date.now()}`,
      clientId: noteClientId,
      clientName: clientName,
      format: noteFormat,
      category: 'Therapy Session',
      date: noteDate,
      sessionDurationMinutes: Number(noteDuration) || 60,
      nonFaceToFaceMinutes: 15,
      subjective: noteSubjective || 'Session completed with participant. Review of weekly functional goals.',
      objective: noteObjective || 'Practitioner facilitated direct behavioral strategies and positive reinforcement.',
      assessment: noteAssessment || 'Participant exhibited positive response to skill acquisition protocols.',
      plan: notePlan || 'Continue current schedule; review behavioral intervention next session.',
      practitionerName: currentUser?.name || 'Principal Clinician',
      practitionerId: currentUser?.id || 'prac-1',
      supportItemCode: '15_056_0128_1_3',
      status: 'Submitted',
      flaggedForReview: false,
      linkedGoalIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addCaseNote(newNote);
    addAuditLog('CREATE', 'CaseNote', newNote.id!, `Logged quick ${noteFormat} case note for ${clientName}`);
    addNotification({
      title: 'Quick Case Note Created',
      message: `${noteFormat} note recorded for ${clientName} (${noteDuration} mins).`,
      type: 'clinical',
      severity: 'low'
    });

    triggerToast(`Created ${noteFormat} case note for ${clientName}`, 'case-notes');
    setActiveModal(null);
    setIsMenuOpen(false);
    // Reset note fields
    setNoteSubjective('');
    setNoteObjective('');
    setNoteAssessment('');
    setNotePlan('');
  };

  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find((c) => c.id === incidentClientId) || clients[0];
    const clientName = targetClient ? targetClient.name : 'NDIS Participant';

    const newIncident: Partial<Incident> = {
      id: `inc-${Date.now()}`,
      clientId: incidentClientId,
      clientName: clientName,
      type: incidentType,
      severity: incidentSeverity,
      date: incidentDate,
      description: incidentDescription || 'Incident documented via Quick Action launcher.',
      actionTaken: incidentActionTaken || 'Immediate calming and proactive de-escalation strategies implemented.',
      reportedToNDISCommission: incidentReportedCommission,
      status: 'Investigating',
      createdAt: new Date().toISOString()
    };

    addIncident(newIncident);
    addAuditLog(
      'CREATE',
      'Incident',
      newIncident.id!,
      `Logged quick incident (${incidentSeverity}) for ${clientName}`
    );
    addNotification({
      title: 'Reportable Incident Logged',
      message: `${incidentSeverity} logged for ${clientName}. 24h statutory compliance timer initiated.`,
      type: 'incident',
      severity: incidentSeverity.includes('Critical') ? 'critical' : 'high'
    });

    triggerToast(`Logged incident for ${clientName}`, 'incidents');
    setActiveModal(null);
    setIsMenuOpen(false);
    setIncidentDescription('');
    setIncidentActionTaken('');
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const targetClient = clients.find((c) => c.id === goalClientId) || clients[0];
    const clientName = targetClient ? targetClient.name : 'NDIS Participant';

    const newGoal: Partial<ClientGoal> = {
      id: `g-${Date.now()}`,
      title: goalTitle.trim(),
      category: goalCategory,
      targetDate: goalTargetDate,
      progressPercent: Number(goalProgress) || 0,
      progress: Number(goalProgress) || 0,
      status: 'In Progress',
      gasScore: goalGasScore,
      gasHistory: [
        {
          date: new Date().toISOString().split('T')[0],
          score: goalGasScore,
          note: 'Baseline goal registration via Quick Action'
        }
      ],
      description: goalDescription || 'Clinical goal established for participant capacity building.'
    };

    addClientGoal(goalClientId, newGoal);
    addAuditLog('CREATE', 'ClientGoal', newGoal.id!, `Added quick goal "${newGoal.title}" for ${clientName}`);
    addNotification({
      title: 'NDIS Goal Added',
      message: `Goal "${newGoal.title}" allocated to ${clientName}.`,
      type: 'goal',
      severity: 'low'
    });

    triggerToast(`Added goal "${newGoal.title}" for ${clientName}`, 'ndis-goals');
    setActiveModal(null);
    setIsMenuOpen(false);
    setGoalTitle('');
    setGoalDescription('');
  };

  const handleJumpToModule = (tab: any, clientId?: string) => {
    if (clientId) setSelectedClientId(clientId);
    setActiveTab(tab);
    setActiveModal(null);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-24 right-6 z-50 p-3.5 rounded-2xl bg-teal-950/90 border border-teal-500/40 text-teal-200 text-xs shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{successToast.message}</span>
          </div>
          {successToast.targetTab && (
            <button
              onClick={() => handleJumpToModule(successToast.targetTab)}
              className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Floating Speed-Dial Container (Fixed bottom-right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        {/* Expanded Speed-Dial Action Buttons */}
        {isMenuOpen && (
          <div className="flex flex-col items-end gap-2 mb-2 animate-fadeIn">
            {/* Action 1: New Case Note */}
            <div className="flex items-center gap-2 group">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold shadow-md whitespace-nowrap">
                New Case Note
              </span>
              <button
                onClick={() => {
                  setActiveModal('case-note');
                }}
                className="w-11 h-11 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 transition-transform active:scale-95 cursor-pointer"
                title="Create a SOAP, BIRP, or SIMPL clinical note"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>

            {/* Action 2: Log Incident */}
            <div className="flex items-center gap-2 group">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold shadow-md whitespace-nowrap">
                Log Incident
              </span>
              <button
                onClick={() => {
                  setActiveModal('incident');
                }}
                className="w-11 h-11 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform active:scale-95 cursor-pointer"
                title="Log a reportable incident & initiate 24h Commission countdown"
              >
                <AlertOctagon className="w-5 h-5" />
              </button>
            </div>

            {/* Action 3: Add Goal */}
            <div className="flex items-center gap-2 group">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold shadow-md whitespace-nowrap">
                Add NDIS Goal
              </span>
              <button
                onClick={() => {
                  setActiveModal('goal');
                }}
                className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
                title="Add a new clinical goal with GAS scale rating"
              >
                <Target className="w-5 h-5" />
              </button>
            </div>

            {/* Action 4: Ingest Drive Folder */}
            <div className="flex items-center gap-2 group">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold shadow-md whitespace-nowrap">
                Ingest Drive Folder (AI)
              </span>
              <button
                onClick={() => {
                  if (onOpenDriveIngest) {
                    onOpenDriveIngest();
                  } else {
                    setActiveModal('drive');
                  }
                  setIsMenuOpen(false);
                }}
                className="w-11 h-11 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
                title="AI extraction of NDIS folder from Google Drive"
              >
                <FolderSync className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Primary Floating Action Button (FAB) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`h-13 px-4 rounded-2xl flex items-center gap-2.5 shadow-2xl transition-all cursor-pointer font-bold text-sm ${
            isMenuOpen
              ? 'bg-slate-800 text-slate-300 border border-slate-700'
              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/30 ring-2 ring-teal-400/40'
          }`}
          title="Quick Actions launcher"
        >
          {isMenuOpen ? (
            <>
              <X className="w-5 h-5" />
              <span>Close</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>Quick Actions</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Modal: Quick Case Note */}
      {activeModal === 'case-note' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Quick Case Note</h3>
                  <p className="text-xs text-slate-400">Rapid clinical documentation & progress note capture</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCaseNote} className="space-y-4 text-xs">
              {/* Participant & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Participant</label>
                  <select
                    value={noteClientId}
                    onChange={(e) => setNoteClientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.ndisNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Format</label>
                  <div className="flex gap-1.5 p-1 bg-slate-800 rounded-xl">
                    {(['SOAP', 'BIRP', 'SIMPL'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setNoteFormat(fmt)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          noteFormat === fmt ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Date</label>
                  <input
                    type="date"
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Duration (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={noteDuration}
                    onChange={(e) => setNoteDuration(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Four Quadrants */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">
                    {noteFormat === 'BIRP' ? 'Behaviour (Baseline & Affect)' : noteFormat === 'SIMPL' ? 'Situation (Context)' : 'Subjective (Participant Report)'}
                  </label>
                  <textarea
                    rows={2}
                    value={noteSubjective}
                    onChange={(e) => setNoteSubjective(e.target.value)}
                    placeholder="Participant presentation, mood baseline, reported sensory/sleep state..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">
                    {noteFormat === 'BIRP' ? 'Intervention (PBS Applied)' : noteFormat === 'SIMPL' ? 'Intervention (Supports)' : 'Objective (Clinical Observations)'}
                  </label>
                  <textarea
                    rows={2}
                    value={noteObjective}
                    onChange={(e) => setNoteObjective(e.target.value)}
                    placeholder="Therapeutic interventions applied, tasks performed, observations..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">
                    {noteFormat === 'BIRP' ? 'Response (Reaction & De-escalation)' : noteFormat === 'SIMPL' ? 'Measurement (Autonomy Score)' : 'Assessment (Goal Progression)'}
                  </label>
                  <textarea
                    rows={2}
                    value={noteAssessment}
                    onChange={(e) => setNoteAssessment(e.target.value)}
                    placeholder="Synthesis of progress towards NDIS goals, clinical response..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Plan (Next Steps & Handover)</label>
                  <textarea
                    rows={2}
                    value={notePlan}
                    onChange={(e) => setNotePlan(e.target.value)}
                    placeholder="Next session targets, home practice, support worker handover..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleJumpToModule('case-notes', noteClientId)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Full Case Notes Module</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-white shadow-lg shadow-teal-600/20 cursor-pointer"
                  >
                    Save Case Note
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Quick Incident */}
      {activeModal === 'incident' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Log Reportable Incident</h3>
                  <p className="text-xs text-slate-400">Statutory NDIS Commission compliance & critical event logging</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIncident} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Participant</label>
                  <select
                    value={incidentClientId}
                    onChange={(e) => setIncidentClientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.ndisNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Incident Type</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Behaviour of Concern">Behaviour of Concern</option>
                    <option value="Injury / Medical Emergency">Injury / Medical Emergency</option>
                    <option value="Medication Error">Medication Error</option>
                    <option value="Unauthorized Restrictive Practice">Unauthorized Restrictive Practice</option>
                    <option value="Property Damage">Property Damage</option>
                    <option value="Absconding / Missing Person">Absconding / Missing Person</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Severity & Statutory Trigger</label>
                  <select
                    value={incidentSeverity}
                    onChange={(e) => setIncidentSeverity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Critical - 24h Commission Reportable">Critical (24h Statutory Notice)</option>
                    <option value="High - Internal Review Required">High (Internal 5-day review)</option>
                    <option value="Medium - Minor Impact">Medium (Minor impact)</option>
                    <option value="Low - Record Only">Low (Informational)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Incident Date</label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description of Occurrence</label>
                <textarea
                  required
                  rows={3}
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  placeholder="Detail exact antecedents, environmental triggers, participant behaviours, and injuries..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Immediate Action & First Aid Taken</label>
                <textarea
                  required
                  rows={2}
                  value={incidentActionTaken}
                  onChange={(e) => setIncidentActionTaken(e.target.value)}
                  placeholder="Steps taken immediately to ensure safety, first aid provided, emergency services called..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <input
                  type="checkbox"
                  id="reportedCommission"
                  checked={incidentReportedCommission}
                  onChange={(e) => setIncidentReportedCommission(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="reportedCommission" className="text-xs text-slate-300 cursor-pointer">
                  Lodged directly with NDIS Quality and Safeguards Commission (PRODA portal)
                </label>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleJumpToModule('incidents', incidentClientId)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Full Incidents Module</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white shadow-lg shadow-rose-600/20 cursor-pointer"
                  >
                    Log Incident
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Quick Goal */}
      {activeModal === 'goal' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add NDIS Goal</h3>
                  <p className="text-xs text-slate-400">Skill acquisition target & Goal Attainment Scaling (GAS)</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Participant</label>
                  <select
                    value={goalClientId}
                    onChange={(e) => setGoalClientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.ndisNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">NDIS Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Capacity Building">Capacity Building (PBS & Therapy)</option>
                    <option value="Social & Community">Social & Community Participation</option>
                    <option value="Core">Core - Daily Living Support</option>
                    <option value="Capital">Capital (Assistive Tech)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Goal Statement / Title</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Independent public transit navigation with visual route cards"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Target Completion Date</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">
                    Current Progress: <span className="font-mono text-teal-400">{goalProgress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={goalProgress}
                    onChange={(e) => setGoalProgress(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">
                  Baseline Goal Attainment Scale (GAS):{' '}
                  <span className="font-mono text-indigo-400 font-bold">
                    {goalGasScore > 0 ? `+${goalGasScore}` : goalGasScore}
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {([-2, -1, 0, 1, 2] as const).map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setGoalGasScore(score)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        goalGasScore === score
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {score > 0 ? `+${score}` : score}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  -2: Much less than expected · -1: Less than expected · 0: Expected outcome · +1: Greater than expected · +2: Much greater
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Clinical Success Criteria / Notes</label>
                <textarea
                  rows={2}
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Measurable milestones, prompting hierarchy fading, and caregiver instructions..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleJumpToModule('ndis-goals', goalClientId)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Full NDIS Goal Tracker</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    Add NDIS Goal
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Google Drive Ingest fallback */}
      {activeModal === 'drive' && (
        <GoogleDriveFolderIngestModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}
    </>
  );
};
