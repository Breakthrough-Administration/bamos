import {
  NDISSupportItem,
  UserProfile,
  Client,
  Practitioner,
  RestrictivePractice,
  Incident,
  CaseNote,
  Lead,
  ABCLog,
  BillingClaim,
  BSPDocument,
  AppNotification,
  CRMTask,
  AuditLog
} from '@/types';

export const OFFICIAL_2026_NDIS_PRICE_GUIDE: NDISSupportItem[] = [
  {
    code: '07_002_0115_8_3',
    name: 'Specialist Behavioural Intervention Support',
    category: 'Capacity Building - Relationships',
    pricePerUnit: 214.41,
    unitOfMeasure: 'Hour',
  },
  {
    code: '07_004_0115_8_3',
    name: 'Individual Behaviour Support Plan Development & Training',
    category: 'Capacity Building - Relationships',
    pricePerUnit: 214.41,
    unitOfMeasure: 'Hour',
  },
  {
    code: '15_056_0128_1_3',
    name: 'Assessment Recommendation Therapy Support - Allied Health',
    category: 'Capacity Building - Improved Daily Living',
    pricePerUnit: 193.99,
    unitOfMeasure: 'Hour',
  },
  {
    code: '15_043_0128_1_3',
    name: 'Dietitian Consultation & Meal Planning Supports',
    category: 'Capacity Building - Improved Daily Living',
    pricePerUnit: 193.99,
    unitOfMeasure: 'Hour',
  },
  {
    code: '15_054_0128_1_3',
    name: 'Speech Pathology Assessment & Augmentative Communication',
    category: 'Capacity Building - Improved Daily Living',
    pricePerUnit: 193.99,
    unitOfMeasure: 'Hour',
  },
  {
    code: '15_055_0128_1_3',
    name: 'Occupational Therapy Sensory Profiling & Environmental Audit',
    category: 'Capacity Building - Improved Daily Living',
    pricePerUnit: 193.99,
    unitOfMeasure: 'Hour',
  },
  {
    code: '07_001_0106_8_3',
    name: 'Support Coordination - Level 2: Coordination of Supports',
    category: 'Capacity Building - Support Coordination',
    pricePerUnit: 100.14,
    unitOfMeasure: 'Hour',
  },
  {
    code: '07_002_0132_8_3',
    name: 'Specialist Support Coordination - Level 3: High Complex Needs',
    category: 'Capacity Building - Support Coordination',
    pricePerUnit: 190.54,
    unitOfMeasure: 'Hour',
  },
  {
    code: '01_011_0107_1_1',
    name: 'Assistance With Self-Care Activities - Standard Weekday Daytime',
    category: 'Core - Assistance with Daily Life',
    pricePerUnit: 67.56,
    unitOfMeasure: 'Hour',
  },
  {
    code: '01_015_0107_1_1',
    name: 'Assistance With Self-Care Activities - Weekday Evening',
    category: 'Core - Assistance with Daily Life',
    pricePerUnit: 74.44,
    unitOfMeasure: 'Hour',
  },
  {
    code: '01_013_0107_1_1',
    name: 'Assistance With Self-Care Activities - Saturday Support',
    category: 'Core - Assistance with Daily Life',
    pricePerUnit: 95.07,
    unitOfMeasure: 'Hour',
  },
  {
    code: '01_014_0107_1_1',
    name: 'Assistance With Self-Care Activities - Sunday Support',
    category: 'Core - Assistance with Daily Life',
    pricePerUnit: 122.59,
    unitOfMeasure: 'Hour',
  },
  {
    code: '04_104_0125_6_1',
    name: 'Access Community, Social and Rec Activities - Standard Weekday',
    category: 'Core - Social & Community Participation',
    pricePerUnit: 67.56,
    unitOfMeasure: 'Hour',
  },
  {
    code: '05_220600111_0105_1_2',
    name: 'Low Cost Assistive Technology for Sensory & Communication Support',
    category: 'Capital - Assistive Technology',
    pricePerUnit: 495.00,
    unitOfMeasure: 'Each',
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-director',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@breakthrough.org.au',
    role: 'ADMIN',
    position: 'Clinical Director & Principal PBS Specialist',
    practitionerId: 'prac-201',
    workerScreeningStatus: 'Active',
    workerScreeningExpiry: '2028-09-30',
    policeCheckExpiry: '2027-11-15',
    ndisOrientationDone: true,
    activeCaseload: 0,
  },
  {
    id: 'user-specialist',
    name: 'Marcus Vance',
    email: 'marcus.vance@breakthrough.org.au',
    role: 'PRACTITIONER',
    position: 'Senior Behaviour Support Practitioner',
    practitionerId: 'prac-202',
    workerScreeningStatus: 'Active',
    workerScreeningExpiry: '2027-05-12',
    policeCheckExpiry: '2026-10-20',
    ndisOrientationDone: true,
    activeCaseload: 0,
  },
  {
    id: 'user-auditor',
    name: 'Elena Rostova',
    email: 'elena.rostova@breakthrough.org.au',
    role: 'VIEWER',
    position: 'Compliance & Quality Safeguards Officer',
    practitionerId: 'prac-203',
    workerScreeningStatus: 'Active',
    workerScreeningExpiry: '2028-01-14',
    policeCheckExpiry: '2027-06-30',
    ndisOrientationDone: true,
    activeCaseload: 0,
  },
  {
    id: 'user-coordinator',
    name: 'Sarah Davies',
    email: 'sarah.davies@breakthrough.org.au',
    role: 'SUPPORT_COORDINATOR',
    position: 'Lead Support Coordinator & Intake Specialist',
    practitionerId: 'prac-204',
    workerScreeningStatus: 'Active',
    workerScreeningExpiry: '2027-11-20',
    policeCheckExpiry: '2026-12-15',
    ndisOrientationDone: true,
    activeCaseload: 0,
  },
];

export const STANDARD_DRIVE_SUBFOLDERS = [
  'Goals Statement',
  'Emergency and Disaster Plan',
  'BSP',
  'Invoices',
  'FBA',
  'NDIS Plan',
  'Letters/ Correspondence',
  'Consent Form',
  'Assessments/ Reports',
  'Referral Form',
  'Progress Notes',
  'Service Agreement'
];

// Zero mock data: initial collections start empty and populate exclusively from real user inputs and Firestore
export const COMPANY_DRIVE_PARTICIPANTS: Client[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_PRACTITIONERS: Practitioner[] = [];
export const INITIAL_RESTRICTIVE_PRACTICES: RestrictivePractice[] = [];
export const INITIAL_INCIDENTS: Incident[] = [];
export const INITIAL_CASE_NOTES: CaseNote[] = [];
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_ABC_LOGS: ABCLog[] = [];
export const INITIAL_CLAIMS: BillingClaim[] = [];
export const INITIAL_BSP: BSPDocument = {
  id: "bsp-template",
  clientId: "",
  clientName: "",
  version: "1.0",
  status: "Draft",
  summary: "",
  primaryBehaviorsOfConcern: [],
  proactiveStrategies: [],
  reactiveStrategies: [],
  restrictivePractices: [],
  reviewDate: "",
  authorName: "",
  lastUpdated: new Date().toISOString()
};
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_CRM_TASKS: CRMTask[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
