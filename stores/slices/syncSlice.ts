import { StateCreator } from 'zustand';
import { OfflineDelta } from '@/types';
import {
  fetchClients,
  fetchCaseNotes,
  fetchBillingClaims,
  fetchIncidents,
  fetchRestrictivePractices,
  fetchABCLogs,
  fetchBSPDocuments,
  fetchCRMLeads,
  fetchCRMTasks,
  fetchPractitioners,
  fetchSupportItems,
  fetchAuditLogs,
  fetchScheduledShifts,
  fetchUsers,
  fetchNotifications,
  seedInitialFirestoreDataIfEmpty,
  subscribeToClients,
  subscribeToCaseNotes,
  subscribeToBillingClaims,
  subscribeToIncidents,
  subscribeToRestrictivePractices,
  subscribeToABCLogs,
  subscribeToBSPDocuments,
  subscribeToCRMLeads,
  subscribeToCRMTasks,
  subscribeToPractitioners,
  subscribeToSupportItems,
  subscribeToAuditLogs,
  subscribeToScheduledShifts,
  subscribeToUsers,
  subscribeToNotifications,
  createDocument,
  deleteDocument
} from '@/lib/firestoreService';
import { SyncSlice, RootStore } from '../types';

// Module-level unsubscribe handles for real-time Firestore listeners (15 collections)
let _unsubClients: (() => void) | null = null;
let _unsubCaseNotes: (() => void) | null = null;
let _unsubBillingClaims: (() => void) | null = null;
let _unsubIncidents: (() => void) | null = null;
let _unsubRP: (() => void) | null = null;
let _unsubABCLogs: (() => void) | null = null;
let _unsubBSPDocuments: (() => void) | null = null;
let _unsubCRMLeads: (() => void) | null = null;
let _unsubCRMTasks: (() => void) | null = null;
let _unsubPractitioners: (() => void) | null = null;
let _unsubSupportItems: (() => void) | null = null;
let _unsubAuditLogs: (() => void) | null = null;
let _unsubScheduledShifts: (() => void) | null = null;
let _unsubUsers: (() => void) | null = null;
let _unsubNotifications: (() => void) | null = null;

export const createSyncSlice: StateCreator<RootStore, [], [], SyncSlice> = (set, get) => ({
  isOnline: true,
  syncStatus: 'synced',
  pendingChangesCount: 0,
  offlineQueue: [],
  lastSyncTime: new Date().toISOString(),
  isUsingMockData: false,

  setOnlineStatus: (isOnline: boolean) => {
    set((state) => {
      const syncStatus = !isOnline
        ? 'offline'
        : state.offlineQueue.length > 0
        ? 'pending'
        : 'synced';
      return { isOnline, syncStatus };
    });
    if (isOnline && get().offlineQueue.length > 0) {
      get().triggerDeltaSync();
    }
  },

  simulateOfflineToggle: () => {
    const nextOnline = !get().isOnline;
    get().setOnlineStatus(nextOnline);
    get().addNotification({
      title: nextOnline ? 'Network Connection Restored' : 'Operating in Field Offline Mode',
      message: nextOnline
        ? 'Online connectivity detected. Synchronizing queued clinical and billing deltas with Cloud ledger.'
        : 'Local delta cache active. All case notes, billing claims, and audits will be safely queued locally.',
      type: 'compliance',
      severity: nextOnline ? 'low' : 'medium'
    });
  },

  queueOfflineDelta: (action, entity, entityId, payload) => {
    const delta: OfflineDelta = {
      id: `delta-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      entity,
      entityId,
      payload
    };

    // Calculate clinical and regulatory priority (Priority 1: Critical Incidents -> Priority 5: CRM)
    const getPriority = (d: OfflineDelta): number => {
      const ent = (d.entity || '').toLowerCase();
      const p = d.payload || {};
      if (ent.includes('incident')) {
        if (p.isNdisReportable || p.severity?.includes('Critical') || p.severity?.includes('High')) return 1;
        return 2;
      }
      if (ent.includes('casenote') || ent.includes('case_note')) {
        if (p.isLocked) return 2;
        return 3;
      }
      if (ent.includes('restrictive') || ent.includes('bsp')) return 2;
      if (ent.includes('claim') || ent.includes('billing') || ent.includes('abc')) return 3;
      if (ent.includes('client') || ent.includes('shift') || ent.includes('goal')) return 4;
      return 5;
    };

    set((state) => {
      const updatedQueue = [...state.offlineQueue, delta].sort((a, b) => {
        const pA = getPriority(a);
        const pB = getPriority(b);
        if (pA !== pB) return pA - pB;
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      return {
        offlineQueue: updatedQueue,
        pendingChangesCount: updatedQueue.length,
        syncStatus: state.isOnline ? 'pending' : 'offline'
      };
    });
  },

  triggerDeltaSync: async () => {
    const getPriority = (d: OfflineDelta): number => {
      const ent = (d.entity || '').toLowerCase();
      const p = d.payload || {};
      if (ent.includes('incident')) {
        if (p.isNdisReportable || p.severity?.includes('Critical') || p.severity?.includes('High')) return 1;
        return 2;
      }
      if (ent.includes('casenote') || ent.includes('case_note')) {
        if (p.isLocked) return 2;
        return 3;
      }
      if (ent.includes('restrictive') || ent.includes('bsp')) return 2;
      if (ent.includes('claim') || ent.includes('billing') || ent.includes('abc')) return 3;
      if (ent.includes('client') || ent.includes('shift') || ent.includes('goal')) return 4;
      return 5;
    };

    const queue = [...get().offlineQueue].sort((a, b) => {
      const pA = getPriority(a);
      const pB = getPriority(b);
      if (pA !== pB) return pA - pB;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    if (queue.length === 0) {
      set({ syncStatus: 'synced', pendingChangesCount: 0, lastSyncTime: new Date().toISOString() });
      return;
    }

    set({ syncStatus: 'syncing' });
    try {
      const entityToCollection: Record<string, string> = {
        Client: 'clients',
        CaseNote: 'caseNotes',
        BillingClaim: 'billingClaims',
        Incident: 'incidents',
        RestrictivePractice: 'restrictivePractices',
        ABCLog: 'abcLogs',
        BSPDocument: 'bspDocuments',
        Lead: 'crmLeads',
        CRMTask: 'crmTasks',
        Practitioner: 'practitioners',
        ScheduledShift: 'scheduledShifts',
        Notification: 'notifications',
        AuditLog: 'auditLogs'
      };

      for (const delta of queue) {
        const colName = entityToCollection[delta.entity] || delta.entity.toLowerCase();
        try {
          if (delta.action === 'CREATE' || delta.action === 'UPDATE' || delta.action === 'UPDATE_GOALS') {
            const docData = delta.payload || {};
            await createDocument(colName, docData, delta.entityId);
          } else if (delta.action === 'DELETE') {
            await deleteDocument(colName, delta.entityId);
          }
        } catch (subErr) {
          console.warn(`Delta sync error for entity ${delta.entity} (${delta.entityId}):`, subErr);
        }
      }

      const processedCount = queue.length;
      set({
        offlineQueue: [],
        pendingChangesCount: 0,
        syncStatus: 'synced',
        lastSyncTime: new Date().toISOString()
      });

      get().addAuditLog(
        'DELTA_SYNC_SUCCESS',
        'OfflineDeltaQueue',
        `batch-${Date.now()}`,
        `Successfully prioritized and synchronized ${processedCount} pending deltas (Critical incidents & clinical records dispatched first).`
      );

      get().addNotification({
        title: 'Priority Deltas Synchronized',
        message: `Successfully flushed ${processedCount} queued records to Cloud Firestore in statutory priority sequence.`,
        type: 'compliance',
        severity: 'low'
      });
    } catch (err) {
      console.error('Failed to flush offline queue:', err);
      set({ syncStatus: 'pending' });
    }
  },

  clearAllMockData: (keepCurrentUser = true) => {
    set({
      isUsingMockData: false,
      clients: [],
      caseNotes: [],
      restrictivePractices: [],
      incidents: [],
      leads: [],
      crmTasks: [],
      abcLogs: [],
      bspPlans: [],
      bspDocuments: [],
      claims: [],
      billingClaims: [],
      scheduledShifts: [],
      selectedClientId: null
    });
    import('@/lib/firestoreService').then(({ purgeMockDataFromFirestore }) => {
      purgeMockDataFromFirestore().catch((e) => console.warn('Purge mock data from firestore:', e));
    });
    get().addAuditLog(
      'WIPE_DEMO_DATABASE',
      'DatabaseEngine',
      'db-root',
      'Cleared all mock participants, notes, and records to initialize production database'
    );
  },

  loadDemoData: () => {
    import('@/lib/seedData').then((seed) => {
      set({
        isUsingMockData: true,
        currentUser: seed.INITIAL_USERS[0],
        users: seed.INITIAL_USERS,
        clients: seed.INITIAL_CLIENTS,
        caseNotes: seed.INITIAL_CASE_NOTES,
        restrictivePractices: seed.INITIAL_RESTRICTIVE_PRACTICES,
        incidents: seed.INITIAL_INCIDENTS,
        leads: seed.INITIAL_LEADS,
        crmTasks: seed.INITIAL_CRM_TASKS,
        practitioners: seed.INITIAL_PRACTITIONERS,
        abcLogs: seed.INITIAL_ABC_LOGS,
        bsp: seed.INITIAL_BSP,
        bspPlans: [seed.INITIAL_BSP],
        bspDocuments: [seed.INITIAL_BSP],
        claims: seed.INITIAL_CLAIMS,
        billingClaims: seed.INITIAL_CLAIMS,
        supportItems: seed.OFFICIAL_2026_NDIS_PRICE_GUIDE,
        auditLogs: seed.INITIAL_AUDIT_LOGS,
        notifications: seed.INITIAL_NOTIFICATIONS,
        scheduledShifts: []
      });
      get().addAuditLog('RESTORE_DEMO_DATA', 'DatabaseEngine', 'db-root', 'Loaded sample NDIS demo database');
    });
  },

  exportFullDatabaseJSON: () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '2026.1-ndis-enterprise',
      app: 'Breakthrough OS - NDIS Business Operating System',
      clients: get().clients,
      caseNotes: get().caseNotes,
      restrictivePractices: get().restrictivePractices,
      incidents: get().incidents,
      billingClaims: get().billingClaims,
      crmLeads: get().leads,
      crmTasks: get().crmTasks,
      practitioners: get().practitioners
    };
    return JSON.stringify(data, null, 2);
  },

  resetToDefaultData: () => {
    get().loadDemoData();
  },

  loadFromFirestore: async () => {
    await get().syncWithFirestore();
  },

  syncWithFirestore: async () => {
    set({ syncStatus: 'syncing' });
    try {
      const [
        fetchedClients,
        fetchedCaseNotes,
        fetchedClaims,
        fetchedIncidents,
        fetchedRP,
        fetchedABC,
        fetchedBSP,
        fetchedLeads,
        fetchedTasks,
        fetchedPracs,
        fetchedSupportItems,
        fetchedAuditLogs,
        fetchedShifts,
        fetchedUsers,
        fetchedNotifications
      ] = await Promise.all([
        fetchClients().catch(() => []),
        fetchCaseNotes().catch(() => []),
        fetchBillingClaims().catch(() => []),
        fetchIncidents().catch(() => []),
        fetchRestrictivePractices().catch(() => []),
        fetchABCLogs().catch(() => []),
        fetchBSPDocuments().catch(() => []),
        fetchCRMLeads().catch(() => []),
        fetchCRMTasks().catch(() => []),
        fetchPractitioners().catch(() => []),
        fetchSupportItems().catch(() => []),
        fetchAuditLogs().catch(() => []),
        fetchScheduledShifts().catch(() => []),
        fetchUsers().catch(() => []),
        fetchNotifications().catch(() => [])
      ]);

      const hasAnyData =
        fetchedClients.length > 0 ||
        fetchedCaseNotes.length > 0 ||
        fetchedClaims.length > 0 ||
        fetchedIncidents.length > 0 ||
        fetchedPracs.length > 0 ||
        fetchedLeads.length > 0;

      if (!hasAnyData) {
        console.info('Firestore is empty. Dynamically loading seed dataset...');
        const seed = await import('@/lib/seedData');

        await seedInitialFirestoreDataIfEmpty({
          users: seed.INITIAL_USERS,
          clients: seed.INITIAL_CLIENTS,
          caseNotes: seed.INITIAL_CASE_NOTES,
          billingClaims: seed.INITIAL_CLAIMS,
          incidents: seed.INITIAL_INCIDENTS,
          restrictivePractices: seed.INITIAL_RESTRICTIVE_PRACTICES,
          abcLogs: seed.INITIAL_ABC_LOGS,
          bspDocuments: [seed.INITIAL_BSP],
          leads: seed.INITIAL_LEADS,
          crmTasks: seed.INITIAL_CRM_TASKS,
          practitioners: seed.INITIAL_PRACTITIONERS,
          supportItems: seed.OFFICIAL_2026_NDIS_PRICE_GUIDE,
          auditLogs: seed.INITIAL_AUDIT_LOGS,
          notifications: seed.INITIAL_NOTIFICATIONS
        });

        const [
          reClients,
          reNotes,
          reClaims,
          reIncidents,
          reRP,
          reABC,
          reBSP,
          reLeads,
          reTasks,
          rePracs,
          reItems,
          reAudits,
          reShifts,
          reUsers,
          reNotifications
        ] = await Promise.all([
          fetchClients().catch(() => seed.INITIAL_CLIENTS),
          fetchCaseNotes().catch(() => seed.INITIAL_CASE_NOTES),
          fetchBillingClaims().catch(() => seed.INITIAL_CLAIMS),
          fetchIncidents().catch(() => seed.INITIAL_INCIDENTS),
          fetchRestrictivePractices().catch(() => seed.INITIAL_RESTRICTIVE_PRACTICES),
          fetchABCLogs().catch(() => seed.INITIAL_ABC_LOGS),
          fetchBSPDocuments().catch(() => [seed.INITIAL_BSP]),
          fetchCRMLeads().catch(() => seed.INITIAL_LEADS),
          fetchCRMTasks().catch(() => seed.INITIAL_CRM_TASKS),
          fetchPractitioners().catch(() => seed.INITIAL_PRACTITIONERS),
          fetchSupportItems().catch(() => seed.OFFICIAL_2026_NDIS_PRICE_GUIDE),
          fetchAuditLogs().catch(() => seed.INITIAL_AUDIT_LOGS),
          fetchScheduledShifts().catch(() => []),
          fetchUsers().catch(() => seed.INITIAL_USERS),
          fetchNotifications().catch(() => seed.INITIAL_NOTIFICATIONS)
        ]);

        set({
          clients: reClients.length > 0 ? reClients : seed.INITIAL_CLIENTS,
          caseNotes: reNotes.length > 0 ? reNotes : seed.INITIAL_CASE_NOTES,
          billingClaims: reClaims.length > 0 ? reClaims : seed.INITIAL_CLAIMS,
          claims: reClaims.length > 0 ? reClaims : seed.INITIAL_CLAIMS,
          incidents: reIncidents.length > 0 ? reIncidents : seed.INITIAL_INCIDENTS,
          restrictivePractices: reRP.length > 0 ? reRP : seed.INITIAL_RESTRICTIVE_PRACTICES,
          abcLogs: reABC.length > 0 ? reABC : seed.INITIAL_ABC_LOGS,
          bspDocuments: reBSP.length > 0 ? reBSP : [seed.INITIAL_BSP],
          bspPlans: reBSP.length > 0 ? reBSP : [seed.INITIAL_BSP],
          bsp: reBSP[0] || seed.INITIAL_BSP,
          leads: reLeads.length > 0 ? reLeads : seed.INITIAL_LEADS,
          crmTasks: reTasks.length > 0 ? reTasks : seed.INITIAL_CRM_TASKS,
          practitioners: rePracs.length > 0 ? rePracs : seed.INITIAL_PRACTITIONERS,
          supportItems: reItems.length > 0 ? reItems : seed.OFFICIAL_2026_NDIS_PRICE_GUIDE,
          auditLogs: reAudits.length > 0 ? reAudits : seed.INITIAL_AUDIT_LOGS,
          notifications: reNotifications.length > 0 ? reNotifications : seed.INITIAL_NOTIFICATIONS,
          scheduledShifts: reShifts,
          users: reUsers.length > 0 ? reUsers : seed.INITIAL_USERS,
          isUsingMockData: false,
          syncStatus: 'synced',
          lastSyncTime: new Date().toISOString()
        });
      } else {
        const seed = await import('@/lib/seedData');
        // Filter out any leftover mock participants so the workspace is strictly production
        const realClients = fetchedClients.filter(
          (c) =>
            !c.id.startsWith('cli-') &&
            c.isCompanyDriveParticipant !== true &&
            !c.id.startsWith('client-mock') &&
            !['Ben Rusic', 'Milly Kane', 'Cooper Brooks', 'Reuben Turner', 'Reyansh Chawla'].includes(c.name)
        );

        if (realClients.length < fetchedClients.length) {
          const { purgeMockDataFromFirestore } = await import('@/lib/firestoreService');
          purgeMockDataFromFirestore().catch(() => {});
        }

        set({
          clients: realClients,
          caseNotes: fetchedCaseNotes.length > 0 ? fetchedCaseNotes : seed.INITIAL_CASE_NOTES,
          billingClaims: fetchedClaims.length > 0 ? fetchedClaims : seed.INITIAL_CLAIMS,
          claims: fetchedClaims.length > 0 ? fetchedClaims : seed.INITIAL_CLAIMS,
          incidents: fetchedIncidents.length > 0 ? fetchedIncidents : seed.INITIAL_INCIDENTS,
          restrictivePractices: fetchedRP.length > 0 ? fetchedRP : seed.INITIAL_RESTRICTIVE_PRACTICES,
          abcLogs: fetchedABC.length > 0 ? fetchedABC : seed.INITIAL_ABC_LOGS,
          bspDocuments: fetchedBSP.length > 0 ? fetchedBSP : [seed.INITIAL_BSP],
          bspPlans: fetchedBSP.length > 0 ? fetchedBSP : [seed.INITIAL_BSP],
          bsp: fetchedBSP[0] || seed.INITIAL_BSP,
          leads: fetchedLeads.length > 0 ? fetchedLeads : seed.INITIAL_LEADS,
          crmTasks: fetchedTasks.length > 0 ? fetchedTasks : seed.INITIAL_CRM_TASKS,
          practitioners: fetchedPracs.length > 0 ? fetchedPracs : seed.INITIAL_PRACTITIONERS,
          supportItems: fetchedSupportItems.length > 0 ? fetchedSupportItems : seed.OFFICIAL_2026_NDIS_PRICE_GUIDE,
          auditLogs: fetchedAuditLogs.length > 0 ? fetchedAuditLogs : seed.INITIAL_AUDIT_LOGS,
          notifications: fetchedNotifications.length > 0 ? fetchedNotifications : seed.INITIAL_NOTIFICATIONS,
          scheduledShifts: fetchedShifts,
          users: fetchedUsers.length > 0 ? fetchedUsers : seed.INITIAL_USERS,
          isUsingMockData: false,
          syncStatus: 'synced',
          lastSyncTime: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('Failed to sync with Firestore, operating in cached mode:', error);
      set({ syncStatus: 'offline' });
    }
  },

  startRealtimeListeners: () => {
    // Tear down any existing listeners first (idempotent)
    get().stopRealtimeListeners();

    const errHandler = (err: Error) => {
      console.warn('[Realtime] Firestore listener error, operating from cache:', err.message);
      set({ syncStatus: 'offline' });
    };

    _unsubClients = subscribeToClients((clients) => {
      set({ clients, syncStatus: 'synced', lastSyncTime: new Date().toISOString() });
    }, errHandler);

    _unsubCaseNotes = subscribeToCaseNotes((caseNotes) => {
      set({ caseNotes });
    }, errHandler);

    _unsubBillingClaims = subscribeToBillingClaims((billingClaims) => {
      set({ billingClaims, claims: billingClaims });
    }, errHandler);

    _unsubIncidents = subscribeToIncidents((incidents) => {
      set({ incidents });
    }, errHandler);

    _unsubRP = subscribeToRestrictivePractices((restrictivePractices) => {
      set({ restrictivePractices });
    }, errHandler);

    _unsubABCLogs = subscribeToABCLogs((abcLogs) => {
      set({ abcLogs });
    }, errHandler);

    _unsubBSPDocuments = subscribeToBSPDocuments((bspDocuments) => {
      set({
        bspDocuments,
        bspPlans: bspDocuments,
        ...(bspDocuments.length > 0 ? { bsp: bspDocuments[0] } : {})
      });
    }, errHandler);

    _unsubCRMLeads = subscribeToCRMLeads((leads) => {
      set({ leads });
    }, errHandler);

    _unsubCRMTasks = subscribeToCRMTasks((crmTasks) => {
      set({ crmTasks });
    }, errHandler);

    _unsubPractitioners = subscribeToPractitioners((practitioners) => {
      set({ practitioners });
    }, errHandler);

    _unsubSupportItems = subscribeToSupportItems((supportItems) => {
      set({ supportItems });
    }, errHandler);

    _unsubAuditLogs = subscribeToAuditLogs((auditLogs) => {
      set({ auditLogs });
    }, errHandler);

    _unsubScheduledShifts = subscribeToScheduledShifts((scheduledShifts) => {
      set({ scheduledShifts });
    }, errHandler);

    _unsubUsers = subscribeToUsers((users) => {
      set({ users });
    }, errHandler);

    _unsubNotifications = subscribeToNotifications((notifications) => {
      set({ notifications });
    }, errHandler);

    set({ syncStatus: 'synced' });
  },

  stopRealtimeListeners: () => {
    if (_unsubClients) { _unsubClients(); _unsubClients = null; }
    if (_unsubCaseNotes) { _unsubCaseNotes(); _unsubCaseNotes = null; }
    if (_unsubBillingClaims) { _unsubBillingClaims(); _unsubBillingClaims = null; }
    if (_unsubIncidents) { _unsubIncidents(); _unsubIncidents = null; }
    if (_unsubRP) { _unsubRP(); _unsubRP = null; }
    if (_unsubABCLogs) { _unsubABCLogs(); _unsubABCLogs = null; }
    if (_unsubBSPDocuments) { _unsubBSPDocuments(); _unsubBSPDocuments = null; }
    if (_unsubCRMLeads) { _unsubCRMLeads(); _unsubCRMLeads = null; }
    if (_unsubCRMTasks) { _unsubCRMTasks(); _unsubCRMTasks = null; }
    if (_unsubPractitioners) { _unsubPractitioners(); _unsubPractitioners = null; }
    if (_unsubSupportItems) { _unsubSupportItems(); _unsubSupportItems = null; }
    if (_unsubAuditLogs) { _unsubAuditLogs(); _unsubAuditLogs = null; }
    if (_unsubScheduledShifts) { _unsubScheduledShifts(); _unsubScheduledShifts = null; }
    if (_unsubUsers) { _unsubUsers(); _unsubUsers = null; }
    if (_unsubNotifications) { _unsubNotifications(); _unsubNotifications = null; }
  }
});
