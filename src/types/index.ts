export type Sexe = 'M' | 'F';

export type Niveau = 
  | 'CI1' | 'CI2' | 'CP1' | 'CP2' 
  | 'CE1' | 'CE2' | 'CM1' | 'CM2' 
  | '6e' | '5e' | '4e' | '3e' 
  | '2nde' | '1ere' | 'Tle';

export type Groupe = 'A' | 'B' | 'C' | 'D' | 'E';

export type StatutPaiement = 'Soldé' | 'Partiel' | 'Impayé';

export type ModePaiement = 'Espèces' | 'MTN MoMo' | 'Moov Money' | 'Wave' | 'Virement Bancaire' | 'Chèque';

export type CategorieDepense = 
  | 'Loyer' 
  | 'Taxes' 
  | 'Salaire Enseignants' 
  | 'Fournitures' 
  | 'Électricité' 
  | 'Eau' 
  | 'Entretien & Travaux' 
  | 'Autre';

export type SessionType = 'primaire' | 'college' | 'lycee';
export type CycleId = 'primaire' | 'college' | 'lycee' | 'all';

export interface Classe {
  id: string;
  nom: string; // e.g. "CP1-A", "CE2-B", "Tle D"
  niveau: Niveau;
  groupe: Groupe;
  session?: SessionType;
  cycle_id?: CycleId;
  serie?: string; // e.g. "D", "C", "A1", "A2"
  salle: string;
  effectifMax: number;
  scolariteAnnuelle: number;
  enseignantPrincipal?: string;
  description?: string;
}

export interface Paiement {
  id: string;
  eleveId: string;
  numeroRecu: string;
  date: string;
  montant: number;
  session?: SessionType;
  cycle_id?: CycleId;
  motif: 'Inscription' | 'Tranche 1' | 'Tranche 2' | 'Tranche 3' | 'Solde' | 'Cantine' | 'Frais Annexe';
  mode: ModePaiement;
  reference?: string;
  recuPar: string;
  observations?: string;
}

export interface NoteMatiere {
  matiere: string;
  devoir1: number;
  devoir2: number;
  examen: number;
  coefficient: number;
  appreciation?: string;
}

export interface PresenceRecord {
  date: string;
  statut: 'Présent' | 'Absent' | 'Retard';
  motif?: string;
  justifie: boolean;
}

export interface Eleve {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: Sexe;
  classeId: string;
  session?: SessionType;
  cycle_id?: CycleId;
  photo?: string;
  parent1: {
    nom: string;
    telephone: string; // WhatsApp
    profession?: string;
    lienParente: 'Père' | 'Mère' | 'Tuteur';
  };
  parent2?: {
    nom: string;
    telephone?: string;
    profession?: string;
    lienParente: 'Père' | 'Mère' | 'Tutrice';
  };
  scolariteTotal: number;
  montantPaye: number;
  paiements: Paiement[];
  notes: NoteMatiere[];
  presences: PresenceRecord[];
  dateInscription: string;
}

export interface Depense {
  id: string;
  date: string;
  categorie: CategorieDepense;
  montant: number;
  session?: SessionType | 'generale';
  cycle_id?: CycleId;
  description: string;
  beneficiaire: string;
  pieceJointe?: string;
  modePaiement: 'Caisse' | 'Virement' | 'Chèque' | 'Mobile Money';
  reference?: string;
}

export interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
  session?: SessionType;
  cycle_id?: CycleId;
  matieres: string[];
  classesIds: string[];
  salaireMensuel: number;
  telephone: string;
  email: string;
  statut: 'Actif' | 'En congé';
  titre?: string;
}

export interface CahierTexteRecord {
  id: string;
  date: string;
  classeNom: string;
  matiere: string;
  professeurNom: string;
  cycle_id: CycleId;
  titreSeance: string;
  contenu: string;
  devoirs?: string;
  pourLeDate?: string;
  valideParCenseur: boolean;
  visaDate?: string;
}

export interface IncidentDisciplineRecord {
  id: string;
  date: string;
  eleveId: string;
  eleveNom: string;
  classeNom: string;
  cycle_id: CycleId;
  professeurNom: string;
  gravite: 'Mineur' | 'Moyen' | 'Grave' | 'Conseil de discipline';
  description: string;
  sanction?: string;
  valideParProviseur: boolean;
  decisionProviseur?: string;
}

export interface AbsenceProfRecord {
  id: string;
  dateDebut: string;
  dateFin: string;
  professeurNom: string;
  emailProf: string;
  motif: string;
  cycle_id: CycleId;
  statut: 'Signalée' | 'Remplacement assigné' | 'Justifiée';
  remplacantNom?: string;
}

export interface AppelRecordJour {
  id: string;
  date: string;
  heureEnvoi: string;
  classeId: string;
  classeNom: string;
  professeurNom: string;
  session: SessionType;
  totalEleves: number;
  totalPresents: number;
  totalAbsents: number;
  totalRetards: number;
  absents: {
    eleveId: string;
    nomComplet: string;
    matricule: string;
    statut: 'Absent' | 'Retard';
    motif?: string;
  }[];
}

export interface MessageWhatsApp {
  id: string;
  date: string;
  type: 'Rappel Écolage' | 'Absence' | 'Réunion Parents' | 'Bulletin' | 'Urgent' | 'Général';
  destinataireNom: string;
  eleveNom?: string;
  classeNom?: string;
  telephone: string;
  message: string;
  statut: 'Délivré' | 'Ouvert' | 'En attente';
}

export interface ParametresEcole {
  nom: string;
  slogan: string;
  directeur: string;
  promoteur: string;
  anneeScolaire: string;
  deviseMonetaire: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  pays: string;
  tauxRelanceAlerteJours: number;
}
