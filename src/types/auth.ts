export type UserRole = 'fondateur' | 'directeur' | 'censeur' | 'caisse' | 'professeur';

export type CycleId = 'primaire' | 'college' | 'lycee' | 'all';

export interface UserSession {
  role: UserRole;
  nom: string;
  email: string;
  titre: string;
  badge: string;
  cycle_id: CycleId; // 'all' pour Fondateur, ou 'primaire' | 'college' | 'lycee'
  username?: string;
  telephone?: string;
  pin?: string;
  subscription_tier?: string;
  matieres?: string[];
  classesAssignees?: string[];
}

export const DEMO_ACCOUNTS: Record<UserRole, UserSession & { password: string; pin: string }> = {
  fondateur: {
    role: 'fondateur',
    cycle_id: 'all',
    nom: 'Fondateur EFA',
    email: 'fondateur@efa.com',
    username: 'fondateur',
    telephone: '+228 90 00 00 01',
    password: 'admin123',
    pin: '9999',
    titre: 'Fondateur & Promoteur Général',
    badge: '👑 Fondateur',
  },
  directeur: {
    role: 'directeur',
    cycle_id: 'lycee', // Proviseur Lycée par défaut (peut aussi être Principal collège ou Dir primaire)
    nom: 'Paul DOSSOU',
    email: 'directeur@efa.com',
    username: 'directeur',
    telephone: '+228 90 00 00 02',
    password: 'admin123',
    pin: '8888',
    titre: 'Proviseur du Lycée (Direction)',
    badge: '👔 Proviseur',
    classesAssignees: ['Terminale D', 'Terminale A4', '2nde C'],
  },
  censeur: {
    role: 'censeur',
    cycle_id: 'college',
    nom: 'Éric MENSAH',
    email: 'censeur@efa.com',
    username: 'censeur',
    telephone: '+228 90 00 00 03',
    password: 'admin123',
    pin: '7777',
    titre: 'Censeur des Études & Discipline (Collège)',
    badge: '⚖️ Censeur',
    classesAssignees: ['6ème A', '5ème B', '3ème A'],
  },
  caisse: {
    role: 'caisse',
    cycle_id: 'all',
    nom: 'Awa SOW',
    email: 'caisse@efa.com',
    username: 'caisse',
    telephone: '+228 90 00 00 04',
    password: 'admin123',
    pin: '1111',
    titre: 'Responsable Caisse & Recouvrement',
    badge: '💰 Caisse',
  },
  professeur: {
    role: 'professeur',
    cycle_id: 'primaire',
    nom: 'Koffi ADANGBE',
    email: 'prof@efa.com',
    username: 'koffi',
    telephone: '+228 90 00 00 05',
    password: 'admin123',
    pin: '1234',
    titre: 'Maître Titulaire CP1-A (Cours Primaire)',
    badge: '🎒 Maître Primaire',
    matieres: [],
    classesAssignees: ['CP1-A'],
  },
};

export const DEMO_DIRECTEURS_PAR_CYCLE = {
  primaire: {
    role: 'directeur' as UserRole,
    cycle_id: 'primaire' as CycleId,
    nom: 'Hélène AGBO',
    email: 'directeur.primaire@efa.com',
    pin: '8881',
    titre: 'Directrice du Cours Primaire',
    badge: '🎒 Directrice Primaire',
    classesAssignees: ['CP1-A', 'CP2-A', 'CE1-A', 'CE2-A', 'CM1-A', 'CM2-A'],
  },
  college: {
    role: 'directeur' as UserRole,
    cycle_id: 'college' as CycleId,
    nom: 'Marc KOUMAGNAN',
    email: 'principal@efa.com',
    pin: '8882',
    titre: 'Principal du Collège',
    badge: '📘 Principal Collège',
    classesAssignees: ['6ème A', '5ème B', '4ème A', '3ème A'],
  },
  lycee: {
    role: 'directeur' as UserRole,
    cycle_id: 'lycee' as CycleId,
    nom: 'Paul DOSSOU',
    email: 'proviseur@efa.com',
    pin: '8888',
    titre: 'Proviseur du Lycée',
    badge: '🎓 Proviseur Lycée',
    classesAssignees: ['2nde C', '1ère D', 'Terminale D'],
  },
};

export const DEMO_CENSEURS_PAR_CYCLE = {
  college: {
    role: 'censeur' as UserRole,
    cycle_id: 'college' as CycleId,
    nom: 'Éric MENSAH',
    email: 'censeur.college@efa.com',
    pin: '7777',
    titre: 'Censeur du Collège',
    badge: '⚖️ Censeur Collège',
  },
  lycee: {
    role: 'censeur' as UserRole,
    cycle_id: 'lycee' as CycleId,
    nom: 'Blaise SOSSOU',
    email: 'censeur.lycee@efa.com',
    pin: '7772',
    titre: 'Censeur du Lycée',
    badge: '⚖️ Censeur Lycée',
  },
};

export const DEMO_PROF_AWA: UserSession & { password: string; pin: string } = {
  role: 'professeur',
  cycle_id: 'lycee',
  nom: 'Awa TRAORE',
  email: 'prof2@efa.com',
  password: '2222',
  pin: '2222',
  titre: 'Professeur de SVT (Terminale D · Lycée)',
  badge: '🎓 Professeur Lycée',
  matieres: ['SVT', 'Maths'],
  classesAssignees: ['Terminale D'],
};

export type AppTab =
  | 'dashboard-fondateur'
  | 'dashboard-caisse'
  | 'dashboard-professeur'
  | 'dashboard-censeur'
  | 'session-view'
  | 'onboarding'
  | 'eleves'
  | 'inscriptions'
  | 'classes'
  | 'emploi-du-temps'
  | 'cahier-de-texte'
  | 'presences'
  | 'absences-profs'
  | 'discipline'
  | 'notes'
  | 'bulletins'
  | 'professeurs'
  | 'employes'
  | 'paiements'
  | 'journal-caisse'
  | 'depenses'
  | 'salaires'
  | 'rapports'
  | 'parents'
  | 'parametres'
  | 'abonnements'
  | '403';
