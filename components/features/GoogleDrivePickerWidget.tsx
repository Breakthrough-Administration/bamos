'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  HardDrive,
  FileText,
  FileSpreadsheet,
  FileCheck,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Trash2,
  Search,
  Filter,
  Eye,
  Link as LinkIcon,
  ShieldAlert,
  RotateCw,
  X,
  Database
} from 'lucide-react';
import {
  openGoogleDrivePicker,
  PickedGoogleDriveFile,
  PickerLoadingPhase,
  clearCachedGoogleToken
} from '@/lib/googlePicker';
import { useManagementStore } from '@/stores/useManagementStore';
import { AttachedDocument, DocumentCategory } from '@/types';
import { GoogleDrivePreviewModal } from './GoogleDrivePreviewModal';
import {
  storePickedDriveFileMetadata,
  unlinkDocumentFromClient,
  fetchDocuments
} from '@/lib/firestoreService';

interface LinkedDriveDocument extends AttachedDocument {
  clientId?: string;
  clientName?: string;
  driveFileId: string;
  category: DocumentCategory;
}

const INITIAL_LINKED_DOCS: LinkedDriveDocument[] = [
  {
    id: 'gdoc-1',
    driveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    name: 'Sarah Jenkins - NDIS Plan 2026-2027 (Official NDIA).pdf',
    url: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
    mimeType: 'application/pdf',
    sizeBytes: 1845200,
    uploadedBy: 'user-practitioner-1',
    uploadedByName: 'Marcus Vance',
    uploadedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    clientId: 'cli-001',
    clientName: 'Sarah Jenkins',
    category: 'NDIS Plan Document',
    tags: ['Clinical', 'Financial'],
    caseNoteId: 'note-001'
  },
  {
    id: 'gdoc-2',
    driveFileId: '1gJ_4s9jE24YfU8Qz7B0xP9aT1LmN3kRt',
    name: 'Michael Chang - Comprehensive Functional Behaviour Assessment (PBS Level 3).docx',
    url: 'https://drive.google.com/file/d/1gJ_4s9jE24YfU8Qz7B0xP9aT1LmN3kRt/view',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sizeBytes: 945000,
    uploadedBy: 'user-practitioner-1',
    uploadedByName: 'Marcus Vance',
    uploadedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    clientId: 'cli-002',
    clientName: 'Michael Chang',
    category: 'Assessment PDF',
    tags: ['Clinical', 'Behavioural'],
    caseNoteId: 'note-002'
  },
  {
    id: 'gdoc-3',
    driveFileId: '1zK_9v8wY32xM7aP5qL1nS8tR4cD2bF0',
    name: 'Chloe Tremblay - Royal Children Hospital OT Sensory Assessment.pdf',
    url: 'https://drive.google.com/file/d/1zK_9v8wY32xM7aP5qL1nS8tR4cD2bF0/view',
    mimeType: 'application/pdf',
    sizeBytes: 3120000,
    uploadedBy: 'user-admin-1',
    uploadedByName: 'Elena Rostova',
    uploadedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    clientId: 'cli-003',
    clientName: 'Chloe Tremblay',
    category: 'Clinical Report',
    tags: ['Clinical', 'Medical']
  },
  {
    id: 'gdoc-4',
    driveFileId: '1mQ_2k4nP89rT5uW3vX7yZ0aB1cD2eF3',
    name: 'Liam O\'Connor - Allied Health Consent and Service Agreement 2026.pdf',
    url: 'https://drive.google.com/file/d/1mQ_2k4nP89rT5uW3vX7yZ0aB1cD2eF3/view',
    mimeType: 'application/pdf',
    sizeBytes: 780000,
    uploadedBy: 'user-practitioner-1',
    uploadedByName: 'Marcus Vance',
    uploadedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    clientId: 'cli-004',
    clientName: 'Liam O\'Connor',
    category: 'Consent Form',
    tags: ['Legal', 'Compliance']
  },
  {
    id: 'gdoc-5',
    driveFileId: '1pL_5w8xY21aM9bC7dE3fG4hI6jK8mN0',
    name: 'Sarah Jenkins - Hydrotherapy & Physiotherapy Biomechanical Progress Report.pdf',
    url: 'https://drive.google.com/file/d/1pL_5w8xY21aM9bC7dE3fG4hI6jK8mN0/view',
    mimeType: 'application/pdf',
    sizeBytes: 2450000,
    uploadedBy: 'user-practitioner-1',
    uploadedByName: 'Marcus Vance',
    uploadedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    clientId: 'cli-001',
    clientName: 'Sarah Jenkins',
    category: 'Clinical Report',
    tags: ['Clinical', 'NDIS Plan']
  }
];

export const GoogleDrivePickerWidget: React.FC = () => {
  const { clients, caseNotes, updateClient, addAuditLog, addNotification, currentUser } =
    useManagementStore();

  const [linkedDocs, setLinkedDocs] = useState<LinkedDriveDocument[]>(INITIAL_LINKED_DOCS);
  const [loadingPhase, setLoadingPhase] = useState<PickerLoadingPhase>('idle');
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [authExpiredNotice, setAuthExpiredNotice] = useState<string | null>(null);
  const [cancellationNotice, setCancellationNotice] = useState<string | null>(null);

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>('NDIS Plan Document');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Preview Modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<AttachedDocument | PickedGoogleDriveFile | null>(null);
  const [previewClientId, setPreviewClientId] = useState<string>(selectedClientId);

  // Sync with Firestore on mount to populate existing documents
  useEffect(() => {
    let isMounted = true;
    fetchDocuments()
      .then((firestoreDocs) => {
        if (!isMounted || !firestoreDocs || firestoreDocs.length === 0) return;
        setLinkedDocs((prev) => {
          const map = new Map<string, LinkedDriveDocument>();
          prev.forEach((d) => map.set(d.id, d));
          firestoreDocs.forEach((fd) => {
            map.set(fd.id, {
              ...fd,
              driveFileId: fd.driveFileId || (fd.metadata?.driveFileId as string) || fd.id,
              category: (fd.category as DocumentCategory) || 'NDIS Plan Document'
            });
          });
          return Array.from(map.values());
        });
      })
      .catch((err) => {
        console.warn('Could not fetch initial documents from Firestore:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenPicker = async (forceFreshAuth = false) => {
    setLoadingPhase('loading_api');
    setPickerError(null);
    setAuthExpiredNotice(null);
    setCancellationNotice(null);

    const targetClient = clients.find((c) => c.id === selectedClientId);

    try {
      await openGoogleDrivePicker({
        title: `Select Clinical Documents${targetClient ? ` for ${targetClient.name}` : ''}`,
        multiSelect: true,
        forceFreshAuth,
        onLoadingStateChange: (phase) => {
          setLoadingPhase(phase);
        },
        onPicked: async (pickedFiles: PickedGoogleDriveFile[]) => {
          setLoadingPhase('idle');
          if (!pickedFiles || pickedFiles.length === 0) return;

          try {
            const newlyStored: LinkedDriveDocument[] = [];

            // Securely store each picked file in Firestore service layer
            for (const file of pickedFiles) {
              const storedDoc = await storePickedDriveFileMetadata({
                file,
                clientId: targetClient?.id || '',
                clientName: targetClient?.name,
                category: documentCategory,
                uploadedBy: currentUser?.id || 'practitioner-current',
                uploadedByName: currentUser?.name || 'Practitioner'
              });

              const linkedEntry: LinkedDriveDocument = {
                ...storedDoc,
                driveFileId: file.id,
                category: documentCategory
              };

              newlyStored.push(linkedEntry);
            }

            // Update local widget list
            setLinkedDocs((prev) => [...newlyStored, ...prev]);

            // Update client in store
            if (targetClient) {
              const existingAttached = targetClient.attachedDocuments || targetClient.documents || [];
              const updatedDocs = [...newlyStored, ...existingAttached];
              updateClient(targetClient.id, {
                attachedDocuments: updatedDocs,
                documents: updatedDocs
              });
            }

            pickedFiles.forEach((file) => {
              addAuditLog(
                'GOOGLE_PICKER_IMPORT',
                'GoogleDriveFile',
                file.id,
                `Stored metadata in Firestore & attached Drive document "${file.name}" to ${
                  targetClient ? targetClient.name : 'Clinical Gateway'
                }`
              );
            });

            addNotification({
              title: 'Google Drive Files Secured in Firestore',
              message: `Successfully connected and stored ${pickedFiles.length} document(s) from Google Drive${
                targetClient ? ` for ${targetClient.name}` : ''
              }.`,
              type: 'clinical',
              severity: 'low'
            });

            // Automatically open preview modal on the first file for clinician verification
            if (newlyStored.length > 0) {
              setPreviewDocument(newlyStored[0]);
              setPreviewClientId(targetClient?.id || selectedClientId);
              setPreviewModalOpen(true);
            }
          } catch (storageErr: any) {
            console.error('Failed to store picked file in Firestore:', storageErr);
            setPickerError(storageErr?.message || 'Failed to save document metadata in Firestore.');
          }
        },
        onCancel: (reason) => {
          setLoadingPhase('idle');
          if (reason === 'user_cancelled_auth') {
            setCancellationNotice('Google sign-in was closed before authorization was granted.');
          } else {
            setCancellationNotice('Picker closed: No documents selected. Your workspace remains unchanged.');
          }
        },
        onError: (err, details) => {
          setLoadingPhase('idle');
          if (details.isUserCancelled) {
            setCancellationNotice('Google authorization popup was closed.');
            return;
          }

          if (details.isAuthExpired) {
            setAuthExpiredNotice(
              'Google Workspace authorization has expired or requires additional clinical Drive scopes. Please re-authenticate below.'
            );
          } else {
            setPickerError(err.message || 'An unexpected error occurred while launching Google Picker.');
          }
        }
      });
    } catch (err: any) {
      setLoadingPhase('idle');
      console.warn('Picker error caught:', err);
      setPickerError(err?.message || 'Could not launch Google Drive Picker.');
    }
  };

  const handleReauthorizeAndReopen = async () => {
    await clearCachedGoogleToken();
    setAuthExpiredNotice(null);
    handleOpenPicker(true);
  };

  const handleOpenPreview = (doc: LinkedDriveDocument) => {
    setPreviewDocument(doc);
    setPreviewClientId(doc.clientId || selectedClientId);
    setPreviewModalOpen(true);
  };

  const handleRemoveDoc = async (id: string, name: string, clientId?: string) => {
    try {
      if (clientId) {
        await unlinkDocumentFromClient(id, clientId);
      }
      setLinkedDocs((prev) => prev.filter((d) => d.id !== id));
      addAuditLog('UNLINK_DRIVE_DOC', 'GoogleDriveFile', id, `Unlinked Drive document "${name}"`);
      addNotification({
        title: 'Drive Document Detached',
        message: `Unlinked "${name}" from practice registry and Firestore.`,
        type: 'general',
        severity: 'low'
      });
    } catch (err) {
      console.warn('Error removing document:', err);
      setLinkedDocs((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const filteredDocs = useMemo(() => {
    return linkedDocs.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.clientName && doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = filterCategory === 'ALL' || doc.category === filterCategory;
      return matchesSearch && matchesCat;
    });
  }, [linkedDocs, searchQuery, filterCategory]);

  const getFileIcon = (mime: string) => {
    if (mime?.includes('pdf')) return <FileText className="w-5 h-5 text-rose-400" />;
    if (mime?.includes('sheet') || mime?.includes('excel'))
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (mime?.includes('document') || mime?.includes('word'))
      return <FileCheck className="w-5 h-5 text-blue-400" />;
    return <HardDrive className="w-5 h-5 text-teal-400" />;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const targetClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="space-y-6">
      {/* Top Action Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Google Drive Clinical Picker</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30 flex items-center gap-1">
                <Database className="w-3 h-3" /> Firestore Linked
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Directly select files from Google Drive, verify clinical content in the embedded preview, and securely store metadata in Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Participant selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <User className="w-4 h-4 text-teal-400" />
              <select
                aria-label="Assign to Participant"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                <option value="" className="bg-slate-900 text-slate-300">
                  Select Participant...
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                    {c.name} ({c.ndisNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Document category selector */}
            <select
              aria-label="Document Category"
              value={documentCategory}
              onChange={(e) => setDocumentCategory(e.target.value as DocumentCategory)}
              className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="NDIS Plan Document">NDIS Plan Document</option>
              <option value="Assessment PDF">Assessment Report</option>
              <option value="BSP Document">Behaviour Support Plan</option>
              <option value="Clinical Report">Allied Health Clinical Report</option>
              <option value="Consent Form">Consent & Service Agreement</option>
              <option value="Incident Photo Evidence">Incident Evidence / Photo</option>
            </select>

            {/* Launch Picker Button */}
            <button
              id="btn-launch-google-picker"
              type="button"
              onClick={() => handleOpenPicker(false)}
              disabled={loadingPhase !== 'idle'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loadingPhase !== 'idle' ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {loadingPhase === 'loading_api' && 'Loading API...'}
                    {loadingPhase === 'requesting_auth' && 'Authenticating...'}
                    {loadingPhase === 'opening_picker' && 'Opening Picker...'}
                  </span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Select from Google Drive</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Loading State Banner */}
        {loadingPhase !== 'idle' && (
          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center gap-3 text-xs text-teal-300 animate-pulse">
            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">
                {loadingPhase === 'loading_api' && 'Initializing Google Workspace Picker Gateway...'}
                {loadingPhase === 'requesting_auth' && 'Validating OAuth2 Drive Scopes (drive.file & drive.metadata.readonly)...'}
                {loadingPhase === 'opening_picker' && 'Opening secure Google Drive selection window...'}
              </span>
              <p className="text-[11px] text-teal-400/80">
                Please ensure pop-up blockers allow the Google account authentication dialog.
              </p>
            </div>
          </div>
        )}

        {/* Graceful Feedback on User Cancellation */}
        {cancellationNotice && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{cancellationNotice}</span>
            </div>
            <button
              onClick={() => setCancellationNotice(null)}
              className="p-1 text-amber-400 hover:text-amber-200 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Authorization Expiration UI Banner with 1-Click Re-Auth */}
        {authExpiredNotice && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-2 text-xs text-rose-300">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-rose-200">Google Workspace Authorization Expired</span>
                <p className="text-[11px] text-rose-300/90 mt-0.5">{authExpiredNotice}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleReauthorizeAndReopen}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Re-authenticate & Open Drive</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthExpiredNotice(null)}
                className="text-xs underline text-rose-300 hover:text-rose-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Generic Picker Error Banner */}
        {pickerError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{pickerError}</span>
            </div>
            <button
              onClick={() => setPickerError(null)}
              className="text-xs underline hover:text-rose-200 ml-3"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Linked Drive Documents Table & Filter Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Linked Drive Documents</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px]">
                {filteredDocs.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Synchronized Google Drive files stored in Firestore and linked across participant dossiers
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents or clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Filter category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Categories</option>
                <option value="NDIS Plan Document" className="bg-slate-900">NDIS Plans</option>
                <option value="Assessment PDF" className="bg-slate-900">Assessments</option>
                <option value="BSP Document" className="bg-slate-900">Behaviour Plans</option>
                <option value="Clinical Report" className="bg-slate-900">Clinical Reports</option>
                <option value="Consent Form" className="bg-slate-900">Consent Forms</option>
              </select>
            </div>
          </div>
        </div>

        {/* List of files */}
        {filteredDocs.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs space-y-2">
            <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No Google Drive documents match the current filter.</p>
            <p className="text-[11px] text-slate-600">
              Click &ldquo;Select from Google Drive&rdquo; above to attach documents directly.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 overflow-hidden rounded-2xl border border-slate-800">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-slate-900/50 hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 shrink-0 mt-0.5">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white truncate max-w-md">
                        {doc.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-semibold border border-teal-500/20">
                        {doc.category}
                      </span>
                      {doc.caseNoteId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/30 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> Linked to Note #{doc.caseNoteId}
                        </span>
                      )}
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {doc.tags.map((t) => (
                            <span
                              key={t}
                              className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                t === 'Clinical'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : t === 'Financial'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : t === 'Legal'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : t === 'Compliance'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                      {doc.clientName && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="w-3 h-3 text-teal-400" />
                          {doc.clientName}
                        </span>
                      )}
                      <span>{formatBytes(doc.sizeBytes)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(doc.uploadedAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-slate-500">By {doc.uploadedByName || 'Clinician'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {/* Preview & Verify Button */}
                  <button
                    id={`btn-preview-doc-${doc.id}`}
                    type="button"
                    onClick={() => handleOpenPreview(doc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold transition border border-teal-500/30 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview & Verify</span>
                  </button>

                  {/* Open in Drive Button */}
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
                  >
                    <span>Drive</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  {/* Unlink Button */}
                  <button
                    onClick={() => handleRemoveDoc(doc.id, doc.name, doc.clientId)}
                    aria-label="Unlink document"
                    className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview & Verification Modal */}
      <GoogleDrivePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        document={previewDocument}
        initialClientId={previewClientId}
        initialCategory={documentCategory}
        onLinkedSuccess={(updatedDoc, linkedNoteId) => {
          setLinkedDocs((prev) =>
            prev.map((d) =>
              d.id === updatedDoc.id
                ? {
                    ...d,
                    caseNoteId: linkedNoteId || d.caseNoteId,
                    clientId: updatedDoc.clientId || d.clientId,
                    clientName: updatedDoc.clientName || d.clientName
                  }
                : d
            )
          );
        }}
      />
    </div>
  );
};
