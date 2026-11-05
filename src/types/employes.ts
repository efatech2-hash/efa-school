import { CycleId } from './auth';

export type EmployeRole = 'fondateur' | 'directeur' | 'censeur' | 'caisse' | 'professeur';
export type EmployeStatut = 'actif' | 'bloque';

export interface Employe {
  id: string;
  nom: string;
  email: string;
  role: EmployeRole;
  cycle_id: CycleId;
  session?: 'primaire' | 'college' | 'lycee';
  pin: string; // 4 chiffres
  telephone: string;
  statut: EmployeStatut;
  classesAssignees: string[];
  matieres: string[];
  dateEmbauche: string;
  salaireBase?: number;
  noteDirecteur?: string;
}

export const INITIAL_EMPLOYES: Employe[] = [
  {
    id: 'emp-fondateur-1',
    nom: 'Fondateur EFA',
    email: 'fondateur@efa.com',
    role: 'fondateur',
    cycle_id: 'all',
    pin: '9999',
    telephone: '+228 90 00 00 01',
    statut: 'actif',
    classesAssignees: [],
    matieres: [],
    dateEmbauche: '2023-01-15',
    salaireBase: 1200000,
  },
  {
    id: 'emp-directeur-lycee',
    nom: 'Paul DOSSOU',
    email: 'directeur@efa.com',
    role: 'directeur',
    cycle_id: 'lycee',
    session: 'lycee',
    pin: '8888',
    telephone: '+228 91 12 34 56',
    statut: 'actif',
    classesAssignees: ['Terminale D', 'Terminale A4', '2nde C'],
    matieres: ['Supervision Pédagogique Lycée'],
    dateEmbauche: '2023-09-01',
    salaireBase: 450000,
  },
  {
    id: 'emp-directeur-college',
    nom: 'Marc KOUMAGNAN',
    email: 'principal@efa.com',
    role: 'directeur',
    cycle_id: 'college',
    session: 'college',
    pin: '8882',
    telephone: '+228 91 88 88 02',
    statut: 'actif',
    classesAssignees: ['6ème A', '5ème B', '4ème A', '3ème A'],
    matieres: ['Direction Pédagogique Collège'],
    dateEmbauche: '2023-09-01',
    salaireBase: 420000,
  },
  {
    id: 'emp-directeur-primaire',
    nom: 'Hélène AGBO',
    email: 'directeur.primaire@efa.com',
    role: 'directeur',
    cycle_id: 'primaire',
    session: 'primaire',
    pin: '8881',
    telephone: '+228 91 88 88 01',
    statut: 'actif',
    classesAssignees: ['CP1-A', 'CP2-A', 'CE1-A', 'CE2-A', 'CM1-A', 'CM2-A'],
    matieres: ['Direction Enseignement Primaire'],
    dateEmbauche: '2023-09-01',
    salaireBase: 380000,
  },
  {
    id: 'emp-censeur-college',
    nom: 'Éric MENSAH',
    email: 'censeur@efa.com',
    role: 'censeur',
    cycle_id: 'college',
    session: 'college',
    pin: '7777',
    telephone: '+228 92 77 77 01',
    statut: 'actif',
    classesAssignees: ['6ème A', '5ème B', '3ème A'],
    matieres: ['Emploi du temps & Discipline'],
    dateEmbauche: '2023-10-01',
    salaireBase: 360000,
  },
  {
    id: 'emp-censeur-lycee',
    nom: 'Blaise SOSSOU',
    email: 'censeur.lycee@efa.com',
    role: 'censeur',
    cycle_id: 'lycee',
    session: 'lycee',
    pin: '7772',
    telephone: '+228 92 77 77 02',
    statut: 'actif',
    classesAssignees: ['2nde C', '1ère D', 'Terminale D'],
    matieres: ['Surveillance Générale & Contrôle Notes'],
    dateEmbauche: '2023-10-01',
    salaireBase: 370000,
  },
  {
    id: 'emp-caisse-1',
    nom: 'Awa SOW',
    email: 'caisse@efa.com',
    role: 'caisse',
    cycle_id: 'all',
    pin: '1111',
    telephone: '+228 92 34 56 78',
    statut: 'actif',
    classesAssignees: [],
    matieres: [],
    dateEmbauche: '2024-02-01',
    salaireBase: 250000,
  },
  {
    id: 'emp-prof-koffi',
    nom: 'Koffi ADANGBE',
    email: 'prof@efa.com',
    role: 'professeur',
    cycle_id: 'primaire',
    session: 'primaire',
    pin: '1234',
    telephone: '+228 93 45 67 89',
    statut: 'actif',
    classesAssignees: ['CP1-A'],
    matieres: [],
    dateEmbauche: '2023-10-01',
    salaireBase: 280000,
  },
  {
    id: 'emp-prof-awa',
    nom: 'Awa TRAORE',
    email: 'prof2@efa.com',
    role: 'professeur',
    cycle_id: 'lycee',
    session: 'lycee',
    pin: '2222',
    telephone: '+228 94 56 78 90',
    statut: 'actif',
    classesAssignees: ['Terminale D'],
    matieres: ['SVT', 'Maths'],
    dateEmbauche: '2024-01-10',
    salaireBase: 260000,
  },
];

const EMPLOYES_STORAGE_KEY = 'efa_employes';

export function getStoredEmployes(): Employe[] {
  try {
    const saved = localStorage.getItem(EMPLOYES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_EMPLOYES;
}

export function saveStoredEmployes(employes: Employe[]): void {
  try {
    localStorage.setItem(EMPLOYES_STORAGE_KEY, JSON.stringify(employes));
  } catch (err) {
    console.error('Erreur sauvegarde employes', err);
  }
}
