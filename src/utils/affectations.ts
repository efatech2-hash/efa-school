import { AffectationProfesseur, NoteEnregistree, initialAffectationsProfesseurs } from '../types/affectations';

const STORAGE_KEY_AFFECTATIONS = 'efa_affectations_professeurs';
const STORAGE_KEY_NOTES = 'efa_table_notes';

export function getAffectations(): AffectationProfesseur[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AFFECTATIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse affectations from localStorage', e);
  }
  // Initialize with official defaults
  try {
    localStorage.setItem(STORAGE_KEY_AFFECTATIONS, JSON.stringify(initialAffectationsProfesseurs));
  } catch {}
  return initialAffectationsProfesseurs;
}

export function getProfAffectation(profEmail?: string): AffectationProfesseur | undefined {
  if (!profEmail) return undefined;
  const list = getAffectations();
  const normalized = profEmail.trim().toLowerCase();
  return list.find(a => a.prof_id.trim().toLowerCase() === normalized);
}

/**
 * Fonction officielle de filtrage de sécurité :
 * Retourne la liste des classes assignées au professeur connecté.
 */
export function getProfClasses(profEmail?: string): string[] {
  const aff = getProfAffectation(profEmail);
  return aff ? aff.classes : [];
}

/**
 * Retourne les matières enseignées par le professeur dans une classe spécifique
 */
export function getProfMatieresForClass(profEmail: string | undefined, classeNom: string): string[] {
  const aff = getProfAffectation(profEmail);
  if (!aff) return [];
  
  const specific = aff.classes_matieres
    .filter(cm => cm.classe.toLowerCase().trim() === classeNom.toLowerCase().trim())
    .map(cm => cm.matiere);

  if (specific.length > 0) {
    return specific;
  }
  return aff.matieres || [];
}

/**
 * Vérifie si une classe donnée est autorisée pour le professeur
 */
export function isClassAllowedForProf(profEmail: string | undefined, classeNom: string): boolean {
  if (!profEmail) return false;
  const classes = getProfClasses(profEmail);
  return classes.some(c => c.toLowerCase().trim() === classeNom.toLowerCase().trim());
}

/**
 * Lecture de la table 'notes' stockée
 */
export function getStoredNotesTable(): NoteEnregistree[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NOTES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse notes table', e);
  }
  return [];
}

/**
 * Sauvegarde d'un lot de notes saisies par un professeur
 */
export function saveNotesBatch(
  newNotes: Array<Omit<NoteEnregistree, 'id'> & { id?: string }>
): NoteEnregistree[] {
  const existing = getStoredNotesTable();
  const createdOrUpdated: NoteEnregistree[] = [];

  const existingMap = new Map<string, NoteEnregistree>();
  existing.forEach(n => {
    // Unique key: eleve_id + classe + matiere + eval
    const key = `${n.eleve_id}_${n.classe}_${n.matiere}_${n.eval}`;
    existingMap.set(key, n);
  });

  newNotes.forEach(item => {
    const key = `${item.eleve_id}_${item.classe}_${item.matiere}_${item.eval}`;
    const id = item.id || existingMap.get(key)?.id || `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const fullNote: NoteEnregistree = {
      ...item,
      id,
    };
    existingMap.set(key, fullNote);
    createdOrUpdated.push(fullNote);
  });

  const allNotes = Array.from(existingMap.values());
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(allNotes));
  } catch (e) {
    console.error('Failed to save notes table to localStorage', e);
  }

  return createdOrUpdated;
}
