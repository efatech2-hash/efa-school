export interface MatiereCoefficient {
  nom: string;
  code: string;
  coefficient: number;
  groupe: 'Scientifique' | 'Littéraire' | 'Générale' | 'Technique' | 'Éveil' | 'Sport';
  description?: string;
}

export interface ProgrammeClasse {
  niveauNom: string;
  isPrimaire?: boolean;
  matieres: MatiereCoefficient[];
  remarque?: string;
}

// 1. COLLÈGE (6ème, 5ème, 4ème, 3ème) - Programme officiel Francophone Ouest-Africain
export const MATIERES_COLLEGE_OBSERVATION: MatiereCoefficient[] = [
  // 6ème & 5ème
  { nom: 'Français', code: 'FRAN', coefficient: 3, groupe: 'Littéraire' },
  { nom: 'Mathématiques', code: 'MATH', coefficient: 3, groupe: 'Scientifique' },
  { nom: 'Anglais', code: 'ANG', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 2, groupe: 'Scientifique' },
  { nom: 'Physique-Chimie-Technologie (PCT)', code: 'PCT', coefficient: 2, groupe: 'Scientifique' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficient: 2, groupe: 'Générale' },
  { nom: 'Éducation Civique et Morale (ECM)', code: 'ECM', coefficient: 1, groupe: 'Générale' },
  { nom: 'Informatique & Numérique', code: 'INFO', coefficient: 1, groupe: 'Scientifique' },
  { nom: 'Éducation Physique & Sportive (EPS)', code: 'EPS', coefficient: 1, groupe: 'Sport' },
  { nom: 'Arts Plastiques & Dessin', code: 'ARTS', coefficient: 1, groupe: 'Éveil' },
];

export const MATIERES_COLLEGE_ORIENTATION: MatiereCoefficient[] = [
  // 4ème & 3ème (Préparation BEPC)
  { nom: 'Français', code: 'FRAN', coefficient: 4, groupe: 'Littéraire' },
  { nom: 'Mathématiques', code: 'MATH', coefficient: 4, groupe: 'Scientifique' },
  { nom: 'Anglais', code: 'ANG', coefficient: 3, groupe: 'Littéraire' },
  { nom: 'Physique-Chimie-Technologie (PCT)', code: 'PCT', coefficient: 3, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 3, groupe: 'Scientifique' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficient: 3, groupe: 'Générale' },
  { nom: 'Éducation Civique et Morale (ECM)', code: 'ECM', coefficient: 1, groupe: 'Générale' },
  { nom: 'Langue Vivante 2 (Espagnol / Allemand)', code: 'LV2', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Informatique & TIC', code: 'INFO', coefficient: 1, groupe: 'Scientifique' },
  { nom: 'Éducation Physique & Sportive (EPS)', code: 'EPS', coefficient: 2, groupe: 'Sport' },
];

// 2. SECONDE
export const MATIERES_SECONDE_A: MatiereCoefficient[] = [
  { nom: 'Français & Littérature', code: 'FRAN', coefficient: 5, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficient: 4, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficient: 3, groupe: 'Générale' },
  { nom: 'Langue Vivante 2 (Allemand/Espagnol)', code: 'LV2', coefficient: 3, groupe: 'Littéraire' },
  { nom: 'Initiation à la Philosophie', code: 'PHIL', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Mathématiques', code: 'MATH', coefficient: 2, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 2, groupe: 'Scientifique' },
  { nom: 'Physique-Chimie-Technologie (PCT)', code: 'PCT', coefficient: 2, groupe: 'Scientifique' },
  { nom: 'Éducation Civique & Citoyenneté', code: 'ECM', coefficient: 1, groupe: 'Générale' },
  { nom: 'Informatique', code: 'INFO', coefficient: 1, groupe: 'Scientifique' },
  { nom: 'Éducation Physique & Sportive (EPS)', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

export const MATIERES_SECONDE_CD: MatiereCoefficient[] = [
  { nom: 'Mathématiques', code: 'MATH', coefficient: 5, groupe: 'Scientifique' },
  { nom: 'Sciences Physiques & Chimie (PCT)', code: 'PCT', coefficient: 4, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 3, groupe: 'Scientifique' },
  { nom: 'Français', code: 'FRAN', coefficient: 3, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficient: 2, groupe: 'Générale' },
  { nom: 'Informatique & Algorithmique', code: 'INFO', coefficient: 1, groupe: 'Scientifique' },
  { nom: 'Éducation Physique & Sportive (EPS)', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

// 3. PREMIÈRE
export const MATIERES_PREMIERE_A4: MatiereCoefficient[] = [
  { nom: 'Littérature & Français', code: 'FRAN', coefficient: 5, groupe: 'Littéraire' },
  { nom: 'Philosophie', code: 'PHIL', coefficient: 4, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficient: 4, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficient: 3, groupe: 'Générale' },
  { nom: 'Langue Vivante 2 (Espagnol / Allemand)', code: 'LV2', coefficient: 3, groupe: 'Littéraire' },
  { nom: 'Mathématiques', code: 'MATH', coefficient: 2, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 2, groupe: 'Scientifique' },
  { nom: 'Informatique', code: 'INFO', coefficient: 1, groupe: 'Scientifique' },
  { nom: 'EPS', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

export const MATIERES_PREMIERE_D: MatiereCoefficient[] = [
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 5, groupe: 'Scientifique' },
  { nom: 'Physique-Chimie (PCT)', code: 'PCT', coefficient: 4, groupe: 'Scientifique' },
  { nom: 'Mathématiques', code: 'MATH', coefficient: 4, groupe: 'Scientifique' },
  { nom: 'Français', code: 'FRAN', coefficient: 3, groupe: 'Littéraire' },
  { nom: 'Philosophie', code: 'PHIL', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficient: 2, groupe: 'Générale' },
  { nom: 'Informatique', code: 'INFO', coefficient: 1, groupe: 'Scientifique' },
  { nom: 'EPS', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

export const MATIERES_PREMIERE_C: MatiereCoefficient[] = [
  { nom: 'Mathématiques', code: 'MATH', coefficient: 6, groupe: 'Scientifique' },
  { nom: 'Physique-Chimie (PCT)', code: 'PCT', coefficient: 5, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 3, groupe: 'Scientifique' },
  { nom: 'Français', code: 'FRAN', coefficient: 3, groupe: 'Littéraire' },
  { nom: 'Philosophie', code: 'PHIL', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficient: 2, groupe: 'Générale' },
  { nom: 'Informatique & Algorithmique', code: 'INFO', coefficient: 1, groupe: 'Scientifique' },
  { nom: 'EPS', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

// 4. TERMINALE
export const MATIERES_TERMINALE_A4: MatiereCoefficient[] = [
  { nom: 'Philosophie', code: 'PHIL', coefficient: 5, groupe: 'Littéraire' },
  { nom: 'Littérature & Culture Générale', code: 'FRAN', coefficient: 4, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficient: 4, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficient: 4, groupe: 'Générale' },
  { nom: 'Langue Vivante 2 (Espagnol / Allemand)', code: 'LV2', coefficient: 3, groupe: 'Littéraire' },
  { nom: 'Mathématiques', code: 'MATH', coefficient: 2, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 2, groupe: 'Scientifique' },
  { nom: 'EPS', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

export const MATIERES_TERMINALE_D: MatiereCoefficient[] = [
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 5, groupe: 'Scientifique' },
  { nom: 'Mathématiques', code: 'MATH', coefficient: 4, groupe: 'Scientifique' },
  { nom: 'Sciences Physiques & Chimie (PCT)', code: 'PCT', coefficient: 4, groupe: 'Scientifique' },
  { nom: 'Philosophie', code: 'PHIL', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Français', code: 'FRAN', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficient: 2, groupe: 'Générale' },
  { nom: 'Informatique', code: 'INFO', coefficient: 1, groupe: 'Scientifique' },
  { nom: 'EPS', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

export const MATIERES_TERMINALE_C: MatiereCoefficient[] = [
  { nom: 'Mathématiques', code: 'MATH', coefficient: 6, groupe: 'Scientifique' },
  { nom: 'Sciences Physiques & Chimie (PCT)', code: 'PCT', coefficient: 5, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficient: 3, groupe: 'Scientifique' },
  { nom: 'Philosophie', code: 'PHIL', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Français', code: 'FRAN', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficient: 2, groupe: 'Générale' },
  { nom: 'Informatique', code: 'INFO', coefficient: 1, groupe: 'Scientifique' },
  { nom: 'EPS', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

// Séries Techniques G (Gestion / Comptabilité / Secrétariat)
export const MATIERES_TECHNIQUES_G: MatiereCoefficient[] = [
  { nom: 'Comptabilité Générale & Analytique', code: 'COMPTA', coefficient: 6, groupe: 'Technique' },
  { nom: 'Économie Générale & d\'Entreprise', code: 'ECO', coefficient: 4, groupe: 'Technique' },
  { nom: 'Droit Commercial & du Travail', code: 'DROIT', coefficient: 3, groupe: 'Technique' },
  { nom: 'Mathématiques Financières', code: 'MATH_FIN', coefficient: 4, groupe: 'Scientifique' },
  { nom: 'Français & Correspondance Pro', code: 'FRAN', coefficient: 3, groupe: 'Littéraire' },
  { nom: 'Anglais Commercial', code: 'ANG', coefficient: 3, groupe: 'Littéraire' },
  { nom: 'Informatique de Gestion (Bureautique)', code: 'INFO', coefficient: 2, groupe: 'Technique' },
  { nom: 'Philosophie', code: 'PHIL', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'EPS', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

// Séries Industrielles F (F1, F2, F3, F4)
export const MATIERES_INDUSTRIELLES_F: MatiereCoefficient[] = [
  { nom: 'Épreuve Professionnelle de Spécialité', code: 'PRO_SPEC', coefficient: 7, groupe: 'Technique' },
  { nom: 'Mathématiques Appliquées', code: 'MATH', coefficient: 5, groupe: 'Scientifique' },
  { nom: 'Sciences Physiques Appliquées', code: 'PCT', coefficient: 4, groupe: 'Scientifique' },
  { nom: 'Dessin Industriel & Conception', code: 'DESSIN', coefficient: 4, groupe: 'Technique' },
  { nom: 'Mécanique / Électrotechnique', code: 'MECA_ELEC', coefficient: 4, groupe: 'Technique' },
  { nom: 'Français', code: 'FRAN', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Anglais Technique', code: 'ANG', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'Philosophie', code: 'PHIL', coefficient: 2, groupe: 'Littéraire' },
  { nom: 'EPS', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

// Primaire (CI1, CI2, CP1, CP2, CE1, CE2, CM1, CM2)
export const MATIERES_PRIMAIRE: MatiereCoefficient[] = [
  { nom: 'Lecture & Compréhension', code: 'LECT', coefficient: 3, groupe: 'Éveil' },
  { nom: 'Expression Écrite & Grammaire', code: 'ECRIT', coefficient: 3, groupe: 'Éveil' },
  { nom: 'Calcul & Numération', code: 'CALC', coefficient: 3, groupe: 'Scientifique' },
  { nom: 'Éveil au Milieu (Sciences & Société)', code: 'EVEIL', coefficient: 2, groupe: 'Éveil' },
  { nom: 'Récitation & Poésie', code: 'RECITE', coefficient: 1, groupe: 'Éveil' },
  { nom: 'Éducation Civique & Morale', code: 'MORALE', coefficient: 1, groupe: 'Générale' },
  { nom: 'Éducation Physique', code: 'EPS', coefficient: 1, groupe: 'Sport' },
];

/**
 * Détecte si la classe est de niveau Primaire
 */
export function isClassePrimaire(classeNom: string): boolean {
  const normalized = classeNom.toUpperCase();
  const prefixes = ['CI', 'CP1', 'CP2', 'CP', 'CE1', 'CE2', 'CE', 'CM1', 'CM2', 'CM', 'MATERNELLE'];
  return prefixes.some(p => normalized.startsWith(p) || normalized.includes(` ${p}`));
}

/**
 * Retourne la liste complète des matières et leurs coefficients selon la classe.
 */
export function getMatieresPourClasse(classeNom: string): MatiereCoefficient[] {
  if (!classeNom) return MATIERES_COLLEGE_OBSERVATION;
  const name = classeNom.toUpperCase();

  // Primaire
  if (isClassePrimaire(classeNom)) {
    return MATIERES_PRIMAIRE;
  }

  // Séries Techniques & Industrielles
  if (name.includes('G1') || name.includes('G2') || name.includes('G3') || name.includes('TECH') || name.includes('COMPTA')) {
    return MATIERES_TECHNIQUES_G;
  }
  if (name.includes('F1') || name.includes('F2') || name.includes('F3') || name.includes('F4') || name.includes('INDUS')) {
    return MATIERES_INDUSTRIELLES_F;
  }

  // Terminale
  if (name.includes('TERMINALE') || name.includes('TLE')) {
    if (name.includes('C')) return MATIERES_TERMINALE_C;
    if (name.includes('D')) return MATIERES_TERMINALE_D;
    return MATIERES_TERMINALE_A4;
  }

  // 1ère
  if (name.includes('1ERE') || name.includes('1ÈRE') || name.includes('PREMIERE')) {
    if (name.includes('C')) return MATIERES_PREMIERE_C;
    if (name.includes('D')) return MATIERES_PREMIERE_D;
    return MATIERES_PREMIERE_A4;
  }

  // 2nde
  if (name.includes('2NDE') || name.includes('SECONDE') || name.includes('2DE')) {
    if (name.includes('C') || name.includes('S') || name.includes('SCIENT')) return MATIERES_SECONDE_CD;
    return MATIERES_SECONDE_A;
  }

  // Collège 4e / 3e
  if (name.includes('4') || name.includes('3')) {
    return MATIERES_COLLEGE_ORIENTATION;
  }

  // Collège 6e / 5e (default collège)
  return MATIERES_COLLEGE_OBSERVATION;
}

/**
 * Calcul de la somme des coefficients
 */
export function getTotalCoefficients(matieres: MatiereCoefficient[]): number {
  return matieres.reduce((sum, m) => sum + m.coefficient, 0);
}
