'use client';

import React, { useState } from 'react';
import { useManagementStore } from '@/stores/useManagementStore';
import { CaseNote, AttachedDocument } from '@/types';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  Download,
  Trash2,
  X,
  HardDrive,
  ExternalLink,
  Eye,
  Link as LinkIcon
} from 'lucide-react';
import { GoogleDrivePreviewModal } from './GoogleDrivePreviewModal';
import { openGoogleDrivePicker, PickedGoogleDriveFile } from '@/lib/googlePicker';
import { storePickedDriveFileMetadata } from '@/lib/firestoreService';

export const CaseNotesModule: React.FC = () => {
  const {
    caseNotes,
    clients,
    currentUser,
    addCaseNote,
    deleteCaseNote,
    selectedClientId,
    setSelectedClientId,
    addAuditLog,
    addNotification
  } = useManagementStore();

  const [search, setSearch] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'SOAP' | 'BIRP' | 'SIMPL'>('SOAP');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Preview Modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePreviewDoc, setActivePreviewDoc] = useState<any | null>(null);
  const [activePreviewClientId, setActivePreviewClientId] = useState<string>('');

  // New Note Form
  const [formData, setFormData] = useState<Partial<CaseNote>>({
    clientId: clients[0]?.id || 'cli-001',
    clientName: clients[0]?.name || '',
    format: 'SOAP',
    category: 'Therapy Session',
    date: new Date().toISOString().split('T')[0],
    sessionDurationMinutes: 60,
    nonFaceToFaceMinutes: 15,
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    practitionerName: currentUser?.name || 'Principal Clinician',
    supportItemCode: '15_056_0128_1_3',
    linkedDriveFiles: []
  });

  const [isAttachingDrive, setIsAttachingDrive] = useState(false);

  const filteredNotes = caseNotes.filter((n) => {
    const matchesSearch =
      n.clientName.toLowerCase().includes(search.toLowerCase()) ||
      n.subjective?.toLowerCase().includes(search.toLowerCase()) ||
      n.assessment?.toLowerCase().includes(search.toLowerCase()) ||
      n.linkedDriveFiles?.some((f) => f.name.toLowerCase().includes(search.toLowerCase()));
    const matchesClient = !selectedClientId || n.clientId === selectedClientId;
    return matchesSearch && matchesClient;
  });

  const handleAttachDriveFile = async () => {
    const targetClient = clients.find((c) => c.id === formData.clientId);
    setIsAttachingDrive(true);

    try {
      await openGoogleDrivePicker({
        title: `Attach Clinical File for ${targetClient?.name || 'Participant'}`,
        multiSelect: false,
        onPicked: async (pickedFiles: PickedGoogleDriveFile[]) => {
          setIsAttachingDrive(false);
          if (!pickedFiles || pickedFiles.length === 0) return;
          const file = pickedFiles[0];

          // Store in Firestore service layer
          const storedDoc = await storePickedDriveFileMetadata({
            file,
            clientId: targetClient?.id || '',
            clientName: targetClient?.name,
            category: 'Clinical Report',
            uploadedBy: currentUser?.id || 'practitioner-current',
            uploadedByName: currentUser?.name || 'Clinician'
          });

          const driveEntry = {
            id: storedDoc.id,
            driveFileId: file.id,
            name: file.name,
            mimeType: file.mimeType,
            url: file.url,
            sizeBytes: file.sizeBytes,
            category: 'Clinical Report',
            uploadedAt: new Date().toISOString()
          };

          setFormData((prev) => ({
            ...prev,
            linkedDriveFiles: [...(prev.linkedDriveFiles || []), driveEntry],
            linkedDocumentIds: [...(prev.linkedDocumentIds || []), storedDoc.id]
          }));

          addNotification({
            title: 'Drive File Attached to Draft',
            message: `"${file.name}" attached. Click "Preview & Verify" to check document contents.`,
            type: 'clinical',
            severity: 'low'
          });
        },
        onCancel: () => {
          setIsAttachingDrive(false);
        }
      });
    } catch (err) {
      console.warn('Error attaching file from Google Drive:', err);
      setIsAttachingDrive(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === formData.clientId);
    const clientName = client?.name || formData.clientName || 'Participant';
    addCaseNote({
      ...formData,
      clientName,
      practitionerName: currentUser?.name || 'Clinician'
    });
    setIsAddOpen(false);
    // Reset form
    setFormData({
      clientId: clients[0]?.id || 'cli-001',
      clientName: clients[0]?.name || '',
      format: 'SOAP',
      category: 'Therapy Session',
      date: new Date().toISOString().split('T')[0],
      sessionDurationMinutes: 60,
      nonFaceToFaceMinutes: 15,
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      practitionerName: currentUser?.name || 'Principal Clinician',
      supportItemCode: '15_056_0128_1_3',
      linkedDriveFiles: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Clinical Case Notes</h1>
          <p className="text-xs text-slate-400">
            SOAP, BIRP & SIMPL documentation meeting NDIS Practice Standards & AHPRA clinical requirements
          </p>
        </div>

        <button
          id="btn-new-case-note"
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" /> New Case Note
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes by keywords, clinical observations, or participant..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <select
          value={selectedClientId || ''}
          onChange={(e) => setSelectedClientId(e.target.value || null)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer"
        >
          <option value="">All Participants</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{note.clientName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-mono font-bold">
                      {note.format || 'SOAP'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    {note.category} • {note.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                    {note.sessionDurationMinutes}m face / {note.nonFaceToFaceMinutes || 0}m NF2F
                  </span>
                  <button
                    onClick={() => deleteCaseNote(note.id)}
                    aria-label="Delete note"
                    className="text-slate-500 hover:text-rose-400 p-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Clinical Content */}
              <div className="space-y-2 text-xs">
                {note.subjective && (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide block mb-1">
                      Subjective (Participant Report)
                    </span>
                    <p className="text-slate-200">{note.subjective}</p>
                  </div>
                )}

                {note.objective && (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide block mb-1">
                      Objective (Clinical Observations)
                    </span>
                    <p className="text-slate-200">{note.objective}</p>
                  </div>
                )}

                {note.assessment && (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide block mb-1">
                      Assessment & Clinical Analysis
                    </span>
                    <p className="text-slate-200">{note.assessment}</p>
                  </div>
                )}

                {note.plan && (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide block mb-1">
                      Plan & Next Steps
                    </span>
                    <p className="text-slate-200">{note.plan}</p>
                  </div>
                )}
              </div>

              {/* Linked Google Drive Documents Section */}
              {note.linkedDriveFiles && note.linkedDriveFiles.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-teal-400" />
                      Linked Google Drive Documents ({note.linkedDriveFiles.length})
                    </span>
                    <span className="text-[10px] text-slate-400">Verified Clinical Evidence</span>
                  </div>

                  <div className="space-y-1.5">
                    {note.linkedDriveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                          <span className="truncate font-medium text-slate-200">
                            {file.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePreviewDoc({
                                ...file,
                                driveFileId: file.driveFileId || file.id
                              });
                              setActivePreviewClientId(note.clientId);
                              setPreviewModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-[11px] font-semibold border border-teal-500/30 transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>

                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Note Footer: Sign-off & Billing Indicator */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 mt-2">
              <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Digitally Signed: {note.practitionerName}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Item: {note.supportItemCode || '15_056_0128_1_3'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Note Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Clinical Progress Note</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Participant</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white cursor-pointer"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Note Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white cursor-pointer"
                  >
                    <option value="SOAP">SOAP (Standard Allied Health)</option>
                    <option value="BIRP">BIRP (Behavioral Health)</option>
                    <option value="SIMPL">SIMPL (Brief Community)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Session Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Face-to-Face (Mins)</label>
                  <input
                    type="number"
                    value={formData.sessionDurationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, sessionDurationMinutes: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Non-Face-to-Face (Mins)</label>
                  <input
                    type="number"
                    value={formData.nonFaceToFaceMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, nonFaceToFaceMinutes: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Subjective Observation</label>
                <textarea
                  rows={2}
                  value={formData.subjective}
                  onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                  placeholder="Participant direct statements, mood, and presenting affect..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Objective Observation</label>
                <textarea
                  rows={2}
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="Objective measures, therapy interventions, exercises performed..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Assessment & Clinical Synthesis</label>
                <textarea
                  rows={2}
                  value={formData.assessment}
                  onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                  placeholder="Clinical evaluation of goal progression and functional capacity..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Plan</label>
                <textarea
                  rows={2}
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  placeholder="Upcoming therapy targets, homework, stakeholder consultation..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              {/* Attach Google Drive Files to Draft */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-teal-400" />
                      Attached Google Drive Documents
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Link NDIS assessments, behavioural logs, or medical reports directly from Google Drive
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAttachDriveFile}
                    disabled={isAttachingDrive}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30 transition cursor-pointer"
                  >
                    {isAttachingDrive ? (
                      <>
                        <div className="w-3 h-3 border-2 border-teal-300 border-t-transparent rounded-full animate-spin" />
                        <span>Opening Picker...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Select from Drive</span>
                      </>
                    )}
                  </button>
                </div>

                {formData.linkedDriveFiles && formData.linkedDriveFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {formData.linkedDriveFiles.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                          <span className="truncate font-medium text-slate-200">{f.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePreviewDoc(f);
                              setActivePreviewClientId(formData.clientId || '');
                              setPreviewModalOpen(true);
                            }}
                            className="text-teal-400 hover:text-teal-300 text-[11px] font-semibold underline"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                linkedDriveFiles: prev.linkedDriveFiles?.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-slate-400 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-white transition cursor-pointer shadow-lg shadow-teal-600/20"
                >
                  Sign & Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Preview Modal */}
      <GoogleDrivePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        document={activePreviewDoc}
        initialClientId={activePreviewClientId}
        onLinkedSuccess={(doc, linkedNoteId) => {
          addNotification({
            title: 'Note Link Confirmed',
            message: `Document "${doc.name}" successfully linked to case note #${linkedNoteId}.`,
            type: 'clinical',
            severity: 'low'
          });
        }}
      />
    </div>
  );
};
