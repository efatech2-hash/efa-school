export interface ClasseMatiere {
  classe: string;
  matiere: string;
}

export interface AffectationProfesseur {
  prof_id: string; // email or unique id
  nom: string;
  classes: string[]; // e.g. ['6ème A', '5ème B']
  matieres: string[]; // e.g. ['Maths']
  classes_matieres: ClasseMatiere[];
}

export interface NoteEnregistree {
  id: string;
  classe: string;
  matiere: string;
  eval: 'Devoir 1' | 'Devoir 2' | 'Composition';
  eleve_id: string;
  eleve_nom?: string;
  eleve_prenom?: string;
  eleve_matricule?: string;
  note: number;
  appreciation: string;
  prof_id: string;
  date: string;
}

export const initialAffectationsProfesseurs: AffectationProfesseur[] = [
  {
    prof_id: 'prof@efa.com',
    nom: 'Koffi ADANGBE',
    classes: ['CP1-A'],
    matieres: [],
    classes_matieres: [],
  },
  {
    prof_id: 'prof2@efa.com',
    nom: 'Awa TRAORE',
    classes: ['Terminale D', '6ème A'],
    matieres: ['SVT', 'Maths'],
    classes_matieres: [
      { classe: 'Terminale D', matiere: 'SVT' },
      { classe: '6ème A', matiere: 'SVT' },
    ],
  },
];
