'use client';

import React, { useState, useMemo } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { Client, CaseNote, Incident, ClientGoal, AttachedDocument } from '@/types';
import {
  FileText,
  AlertOctagon,
  Target,
  FolderOpen,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Eye,
  Plus
} from 'lucide-react';
import { GoogleDrivePreviewModal } from './GoogleDrivePreviewModal';

export type TimelineCategory = 'ALL' | 'CASE_NOTES' | 'GOALS' | 'INCIDENTS' | 'DOCUMENTS';

export interface TimelineEvent {
  id: string;
  category: 'CASE_NOTES' | 'GOALS' | 'INCIDENTS' | 'DOCUMENTS';
  timestamp: string; // ISO or YYYY-MM-DD
  displayDate: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  severity?: 'critical' | 'warning' | 'info' | 'success';
  rawItem: CaseNote | Incident | ClientGoal | AttachedDocument | any;
  details: {
    label: string;
    value: string | React.ReactNode;
  }[];
  expandableContent?: React.ReactNode;
  moduleTarget: 'case-notes' | 'incidents' | 'ndis-goals' | 'google-workspace';
}

interface ParticipantClinicalTimelineProps {
  client: Client;
  onOpenNewCaseNote?: () => void;
  onOpenNewGoal?: () => void;
  onOpenNewIncident?: () => void;
}

export const ParticipantClinicalTimeline: React.FC<ParticipantClinicalTimelineProps> = ({
  client,
  onOpenNewCaseNote,
  onOpenNewGoal,
  onOpenNewIncident
}) => {
  const { caseNotes, incidents, setActiveTab, setSelectedClientId } = useManagementStore();

  const [activeCategory, setActiveCategory] = useState<TimelineCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(new Set());

  // Drive preview modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<AttachedDocument | null>(null);

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Compile timeline events from all streams
  const allEvents: TimelineEvent[] = useMemo(() => {
    const list: TimelineEvent[] = [];

    // 1. Clinical Case Notes
    const clientNotes = caseNotes.filter(
      (n) => n.clientId === client.id || (n.clientName && n.clientName.toLowerCase() === client.name.toLowerCase())
    );

    clientNotes.forEach((note) => {
      const dateStr = note.date || note.sessionDate || note.createdAt || '2026-01-01';
      list.push({
        id: `note-${note.id}`,
        category: 'CASE_NOTES',
        timestamp: dateStr,
        displayDate: dateStr,
        title: `${note.format || 'SOAP'} Case Note · ${note.category || 'Therapy Session'}`,
        subtitle: `Practitioner: ${note.practitionerName || 'Clinician'} · ${note.sessionDurationMinutes || 60} mins`,
        badgeLabel: note.format || 'SOAP',
        severity: note.riskLevel === 'Critical' ? 'critical' : note.riskLevel === 'High' ? 'warning' : 'info',
        rawItem: note,
        moduleTarget: 'case-notes',
        details: [
          { label: 'Session Duration', value: `${note.sessionDurationMinutes || 60} mins` },
          { label: 'Non-Face-to-Face', value: `${note.nonFaceToFaceMinutes || 0} mins` },
          { label: 'Support Item', value: note.supportItemCode || '15_056_0128_1_3' },
          { label: 'Status', value: note.status || 'Submitted' }
        ],
        expandableContent: (
          <div className="space-y-2.5 pt-2 text-xs">
            {note.subjective && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-teal-400 block mb-0.5">
                  {note.format === 'BIRP' ? 'Behaviour' : note.format === 'SIMPL' ? 'Situation' : 'Subjective'}
                </span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{note.subjective}</p>
              </div>
            )}
            {note.objective && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-teal-400 block mb-0.5">
                  {note.format === 'BIRP' ? 'Intervention' : note.format === 'SIMPL' ? 'Intervention' : 'Objective'}
                </span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{note.objective}</p>
              </div>
            )}
            {note.assessment && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-teal-400 block mb-0.5">
                  {note.format === 'BIRP' ? 'Response' : note.format === 'SIMPL' ? 'Measurement' : 'Assessment'}
                </span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{note.assessment}</p>
              </div>
            )}
            {note.plan && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-teal-400 block mb-0.5">Plan & Next Steps</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{note.plan}</p>
              </div>
            )}
            {note.linkedDriveFiles && note.linkedDriveFiles.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Attached Drive Documents:</span>
                <div className="flex flex-wrap gap-1.5">
                  {note.linkedDriveFiles.map((f, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px]"
                    >
                      <FileText className="w-3 h-3 text-indigo-400" />
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      });
    });

    // 2. Incidents
    const clientIncidents = incidents.filter(
      (i) => i.clientId === client.id || (i.clientName && i.clientName.toLowerCase() === client.name.toLowerCase())
    );

    clientIncidents.forEach((inc) => {
      const dateStr = inc.date || inc.createdAt || '2026-01-01';
      const isCritical = inc.severity?.includes('Critical');
      list.push({
        id: `incident-${inc.id}`,
        category: 'INCIDENTS',
        timestamp: dateStr,
        displayDate: dateStr,
        title: `Incident Logged · ${inc.type || 'Clinical / Behavioural'}`,
        subtitle: `Severity: ${inc.severity || 'Medium'} · Status: ${inc.status || 'Investigating'}`,
        badgeLabel: isCritical ? 'NDIS Commission 24h' : inc.severity || 'Incident',
        severity: isCritical ? 'critical' : 'warning',
        rawItem: inc,
        moduleTarget: 'incidents',
        details: [
          { label: 'Severity', value: inc.severity || 'Medium' },
          { label: 'Commission Notified', value: inc.reportedToNDISCommission ? 'Yes (Lodged)' : 'Pending / Not Required' },
          { label: 'Investigation Status', value: inc.status || 'Active' }
        ],
        expandableContent: (
          <div className="space-y-2.5 pt-2 text-xs">
            {inc.description && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-rose-400 block mb-0.5">Incident Description</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{inc.description}</p>
              </div>
            )}
            {inc.actionTaken && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-amber-400 block mb-0.5">Immediate De-escalation & Action</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{inc.actionTaken}</p>
              </div>
            )}
            {inc.preventativeMeasures && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-teal-400 block mb-0.5">Preventative Protocol</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{inc.preventativeMeasures}</p>
              </div>
            )}
          </div>
        )
      });
    });

    // 3. NDIS Goal Milestones & GAS Progression
    (client.goals || []).forEach((goal) => {
      // Goal creation / target milestone
      const goalDate = goal.targetDate || client.planStartDate || '2026-06-30';
      list.push({
        id: `goal-${goal.id}`,
        category: 'GOALS',
        timestamp: goalDate,
        displayDate: goalDate,
        title: `NDIS Goal Milestone · ${goal.title}`,
        subtitle: `Category: ${goal.category} · Target Completion: ${goal.targetDate}`,
        badgeLabel: `${goal.progressPercent || goal.progress || 0}% Progress`,
        severity: (goal.progressPercent || goal.progress || 0) >= 80 ? 'success' : 'info',
        rawItem: goal,
        moduleTarget: 'ndis-goals',
        details: [
          { label: 'NDIS Category', value: goal.category },
          { label: 'Progress Score', value: `${goal.progressPercent || goal.progress || 0}%` },
          { label: 'Status', value: goal.status },
          { label: 'GAS Score', value: goal.gasScore !== undefined ? `${goal.gasScore > 0 ? '+' : ''}${goal.gasScore}` : 'Baseline' }
        ],
        expandableContent: (
          <div className="space-y-2 pt-2 text-xs">
            {goal.description && (
              <p className="text-slate-300 leading-relaxed p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                {goal.description}
              </p>
            )}
            {goal.gasHistory && goal.gasHistory.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-semibold text-indigo-400 block">Goal Attainment Scaling (GAS) History:</span>
                <div className="space-y-1.5">
                  {goal.gasHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] border-b border-slate-800/60 pb-1 last:border-none">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">{h.date}</span>
                        <span className="text-slate-300">{h.note}</span>
                      </div>
                      <span className="font-mono font-bold text-teal-400">
                        {h.score > 0 ? `+${h.score}` : h.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      });

      // Individual GAS history entries as separate timeline milestones if present
      if (goal.gasHistory && goal.gasHistory.length > 0) {
        goal.gasHistory.forEach((gh, idx) => {
          list.push({
            id: `gas-${goal.id}-${idx}`,
            category: 'GOALS',
            timestamp: gh.date,
            displayDate: gh.date,
            title: `GAS Progress Score (${gh.score > 0 ? `+${gh.score}` : gh.score}) · ${goal.title}`,
            subtitle: gh.note || `Clinically measured progression toward NDIS goal criteria`,
            badgeLabel: `GAS: ${gh.score > 0 ? `+${gh.score}` : gh.score}`,
            severity: gh.score >= 0 ? 'success' : 'warning',
            rawItem: gh,
            moduleTarget: 'ndis-goals',
            details: [
              { label: 'Measured GAS Score', value: `${gh.score > 0 ? `+${gh.score}` : gh.score}` },
              { label: 'Evaluation Date', value: gh.date },
              { label: 'Target Goal', value: goal.title }
            ],
            expandableContent: (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="font-semibold text-teal-400 block mb-0.5">Clinical Evaluation Note</span>
                <p className="text-slate-300">{gh.note}</p>
              </div>
            )
          });
        });
      }
    });

    // 4. Clinical Document Uploads
    const clientDocs = client.attachedDocuments || client.documents || [];
    clientDocs.forEach((doc) => {
      const dateStr = doc.uploadedAt?.split('T')[0] || '2026-01-15';
      list.push({
        id: `doc-${doc.id}`,
        category: 'DOCUMENTS',
        timestamp: dateStr,
        displayDate: dateStr,
        title: `Document Upload · ${doc.name}`,
        subtitle: `Vault Folder: ${doc.metadata?.folderCategory || doc.category || 'Clinical'} · Added by ${doc.uploadedByName || 'Clinician'}`,
        badgeLabel: doc.metadata?.folderCategory || doc.category || 'Document',
        severity: 'info',
        rawItem: doc,
        moduleTarget: 'google-workspace',
        details: [
          { label: 'Folder Category', value: doc.metadata?.folderCategory || doc.category || 'Clinical' },
          { label: 'Uploader', value: doc.uploadedByName || 'Clinical Specialist' },
          { label: 'File Size', value: `${Math.round((doc.sizeBytes || 45000) / 1024)} KB` }
        ],
        expandableContent: (
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                setPreviewDoc(doc);
                setPreviewModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Preview Document
            </button>
            {doc.url && (
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in Google Drive
              </a>
            )}
          </div>
        )
      });
    });

    return list;
  }, [caseNotes, incidents, client]);

  // Filter and search
  const filteredEvents = useMemo(() => {
    let result = allEvents;

    if (activeCategory !== 'ALL') {
      result = result.filter((e) => e.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.subtitle.toLowerCase().includes(q) ||
          e.displayDate.includes(q) ||
          e.badgeLabel.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [allEvents, activeCategory, searchQuery, sortDirection]);

  // Jump to specific module
  const handleNavigateToModule = (target: TimelineEvent['moduleTarget']) => {
    setSelectedClientId(client.id);
    setActiveTab(target);
  };

  const countsByCategory = {
    ALL: allEvents.length,
    CASE_NOTES: allEvents.filter((e) => e.category === 'CASE_NOTES').length,
    GOALS: allEvents.filter((e) => e.category === 'GOALS').length,
    INCIDENTS: allEvents.filter((e) => e.category === 'INCIDENTS').length,
    DOCUMENTS: allEvents.filter((e) => e.category === 'DOCUMENTS').length
  };

  return (
    <div className="space-y-4">
      {/* Header Controls: Filters, Search, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Events', count: countsByCategory.ALL },
            { id: 'CASE_NOTES', label: 'Case Notes', count: countsByCategory.CASE_NOTES },
            { id: 'GOALS', label: 'NDIS Goals', count: countsByCategory.GOALS },
            { id: 'INCIDENTS', label: 'Incidents', count: countsByCategory.INCIDENTS },
            { id: 'DOCUMENTS', label: 'Documents', count: countsByCategory.DOCUMENTS }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as TimelineCategory)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] tabular-nums text-slate-500">
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort Direction */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            onClick={() => setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Toggle chronological sort order"
          >
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Vertical Timeline Container */}
      {filteredEvents.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-300">No Timeline Events Recorded</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              No clinical milestones, session notes, incidents, or document uploads match the current filter for {client.name}.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            {onOpenNewCaseNote && (
              <button
                onClick={onOpenNewCaseNote}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Log Session Note
              </button>
            )}
            {onOpenNewGoal && (
              <button
                onClick={onOpenNewGoal}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Goal
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {filteredEvents.map((evt) => {
            const isExpanded = expandedEventIds.has(evt.id);

            // Icon by category
            let IconComponent = FileText;
            let iconBgClass = 'bg-teal-500/20 text-teal-400 border-teal-500/30';
            if (evt.category === 'INCIDENTS') {
              IconComponent = AlertOctagon;
              iconBgClass = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            } else if (evt.category === 'GOALS') {
              IconComponent = Target;
              iconBgClass = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
            } else if (evt.category === 'DOCUMENTS') {
              IconComponent = FolderOpen;
              iconBgClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            }

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-3 w-6 h-6 rounded-full border flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${iconBgClass}`}
                >
                  <IconComponent className="w-3 h-3" />
                </div>

                {/* Event Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-white truncate">{evt.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono tabular-nums">
                          {evt.badgeLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{evt.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {evt.displayDate}
                      </span>
                      <button
                        onClick={() => toggleExpand(evt.id)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title={isExpanded ? 'Collapse event' : 'Expand full details'}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary key-values */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
                    {evt.details.map((d, i) => (
                      <div key={i} className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                          {d.label}
                        </span>
                        <span className="text-slate-200 font-medium truncate block font-mono">
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-800 space-y-3">
                      {evt.expandableContent}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleNavigateToModule(evt.moduleTarget)}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Open in Dedicated Module</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewModalOpen && previewDoc && (
        <GoogleDrivePreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewDoc(null);
          }}
          document={previewDoc}
          initialClientId={client.id}
        />
      )}
    </div>
  );
};
