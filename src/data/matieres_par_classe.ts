/**
 * Programme Scolaire Africain & Ouest-Africain (Bénin, Togo, Côte d'Ivoire, Sénégal, etc.)
 * Mapping officiel des matières et coefficients par niveau et série
 */

export interface MatiereOption {
  nom: string;
  code: string;
  coefficientDefaut: number;
  groupe: 'Scientifique' | 'Littéraire' | 'Générale' | 'Technique' | 'Sport' | 'Éveil';
}

// 1. COLLÈGE (6ème - 5ème)
export const MATIERES_COLLEGE_6E_5E: MatiereOption[] = [
  { nom: 'Français', code: 'FRAN', coefficientDefaut: 3, groupe: 'Littéraire' },
  { nom: 'Mathématiques', code: 'MATH', coefficientDefaut: 3, groupe: 'Scientifique' },
  { nom: 'Anglais', code: 'ANG', coefficientDefaut: 2, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficientDefaut: 2, groupe: 'Générale' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficientDefaut: 2, groupe: 'Scientifique' },
  { nom: 'Physique-Chimie-Technologie (PCT)', code: 'PCT', coefficientDefaut: 2, groupe: 'Scientifique' },
  { nom: 'Éducation Civique et Morale (ECM)', code: 'ECM', coefficientDefaut: 1, groupe: 'Générale' },
  { nom: 'Informatique & TIC', code: 'INFO', coefficientDefaut: 1, groupe: 'Scientifique' },
  { nom: 'Éducation Physique et Sportive (EPS)', code: 'EPS', coefficientDefaut: 1, groupe: 'Sport' },
  { nom: 'Dessin & Arts Plastiques', code: 'ARTS', coefficientDefaut: 1, groupe: 'Éveil' },
];

// 2. COLLÈGE (4ème - 3ème) - Préparation BEPC
export const MATIERES_COLLEGE_4E_3E: MatiereOption[] = [
  { nom: 'Français', code: 'FRAN', coefficientDefaut: 4, groupe: 'Littéraire' },
  { nom: 'Mathématiques', code: 'MATH', coefficientDefaut: 4, groupe: 'Scientifique' },
  { nom: 'Physique-Chimie-Technologie (PCT)', code: 'PCT', coefficientDefaut: 3, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficientDefaut: 3, groupe: 'Scientifique' },
  { nom: 'Anglais', code: 'ANG', coefficientDefaut: 3, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficientDefaut: 3, groupe: 'Générale' },
  { nom: 'Langue Vivante 2 (Espagnol / Allemand)', code: 'LV2', coefficientDefaut: 2, groupe: 'Littéraire' },
  { nom: 'Éducation Civique et Morale (ECM)', code: 'ECM', coefficientDefaut: 1, groupe: 'Générale' },
  { nom: 'Informatique & Numérique', code: 'INFO', coefficientDefaut: 1, groupe: 'Scientifique' },
  { nom: 'Éducation Physique et Sportive (EPS)', code: 'EPS', coefficientDefaut: 2, groupe: 'Sport' },
];

// 3. SECONDE LITTÉRAIRE (2nde A)
export const MATIERES_SECONDE_A: MatiereOption[] = [
  { nom: 'Français & Littérature', code: 'FRAN', coefficientDefaut: 5, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficientDefaut: 4, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficientDefaut: 3, groupe: 'Générale' },
  { nom: 'Langue Vivante 2 (Espagnol / Allemand)', code: 'LV2', coefficientDefaut: 3, groupe: 'Littéraire' },
  { nom: 'Mathématiques', code: 'MATH', coefficientDefaut: 2, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficientDefaut: 2, groupe: 'Scientifique' },
  { nom: 'Physique-Chimie (PCT)', code: 'PCT', coefficientDefaut: 2, groupe: 'Scientifique' },
  { nom: 'Initiation à la Philosophie', code: 'PHIL', coefficientDefaut: 2, groupe: 'Littéraire' },
  { nom: 'Éducation Physique et Sportive (EPS)', code: 'EPS', coefficientDefaut: 1, groupe: 'Sport' },
];

// 4. SECONDE SCIENTIFIQUE (2nde C / CD)
export const MATIERES_SECONDE_C: MatiereOption[] = [
  { nom: 'Mathématiques', code: 'MATH', coefficientDefaut: 5, groupe: 'Scientifique' },
  { nom: 'Physique-Chimie (PCT)', code: 'PCT', coefficientDefaut: 4, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficientDefaut: 3, groupe: 'Scientifique' },
  { nom: 'Français', code: 'FRAN', coefficientDefaut: 3, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficientDefaut: 2, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficientDefaut: 2, groupe: 'Générale' },
  { nom: 'Informatique', code: 'INFO', coefficientDefaut: 1, groupe: 'Scientifique' },
  { nom: 'Éducation Physique et Sportive (EPS)', code: 'EPS', coefficientDefaut: 1, groupe: 'Sport' },
];

// 5. PREMIÈRE & TERMINALE A4 (Littéraire)
export const MATIERES_LYCEE_A4: MatiereOption[] = [
  { nom: 'Littérature & Français', code: 'FRAN', coefficientDefaut: 5, groupe: 'Littéraire' },
  { nom: 'Philosophie', code: 'PHIL', coefficientDefaut: 5, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficientDefaut: 4, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficientDefaut: 3, groupe: 'Générale' },
  { nom: 'Langue Vivante 2 (Espagnol / Allemand)', code: 'LV2', coefficientDefaut: 3, groupe: 'Littéraire' },
  { nom: 'Mathématiques', code: 'MATH', coefficientDefaut: 2, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficientDefaut: 2, groupe: 'Scientifique' },
  { nom: 'Éducation Physique et Sportive (EPS)', code: 'EPS', coefficientDefaut: 1, groupe: 'Sport' },
];

// 6. PREMIÈRE & TERMINALE C (Maths & Sciences Physiques)
export const MATIERES_LYCEE_C: MatiereOption[] = [
  { nom: 'Mathématiques', code: 'MATH', coefficientDefaut: 6, groupe: 'Scientifique' },
  { nom: 'Sciences Physiques & Chimie (PCT)', code: 'PCT', coefficientDefaut: 5, groupe: 'Scientifique' },
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficientDefaut: 3, groupe: 'Scientifique' },
  { nom: 'Français & Littérature', code: 'FRAN', coefficientDefaut: 3, groupe: 'Littéraire' },
  { nom: 'Philosophie', code: 'PHIL', coefficientDefaut: 2, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficientDefaut: 2, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficientDefaut: 2, groupe: 'Générale' },
  { nom: 'Éducation Physique et Sportive (EPS)', code: 'EPS', coefficientDefaut: 1, groupe: 'Sport' },
];

// 7. PREMIÈRE & TERMINALE D (Sciences de la Nature & Maths)
export const MATIERES_LYCEE_D: MatiereOption[] = [
  { nom: 'Sciences de la Vie et de la Terre (SVT)', code: 'SVT', coefficientDefaut: 5, groupe: 'Scientifique' },
  { nom: 'Sciences Physiques & Chimie (PCT)', code: 'PCT', coefficientDefaut: 4, groupe: 'Scientifique' },
  { nom: 'Mathématiques', code: 'MATH', coefficientDefaut: 4, groupe: 'Scientifique' },
  { nom: 'Français & Littérature', code: 'FRAN', coefficientDefaut: 3, groupe: 'Littéraire' },
  { nom: 'Philosophie', code: 'PHIL', coefficientDefaut: 2, groupe: 'Littéraire' },
  { nom: 'Anglais', code: 'ANG', coefficientDefaut: 2, groupe: 'Littéraire' },
  { nom: 'Histoire-Géographie', code: 'HG', coefficientDefaut: 2, groupe: 'Générale' },
  { nom: 'Éducation Physique et Sportive (EPS)', code: 'EPS', coefficientDefaut: 1, groupe: 'Sport' },
];

// 8. SÉRIES TECHNIQUES TERTIAIRES G (G1: Secrétariat, G2: Comptabilité & Gestion, G3: Commerce)
export const MATIERES_LYCEE_G: MatiereOption[] = [
  { nom: 'Comptabilité Générale & Gestion', code: 'COMPTA', coefficientDefaut: 5, groupe: 'Technique' },
  { nom: 'Économie Générale & Entreprise', code: 'ECO', coefficientDefaut: 4, groupe: 'Technique' },
  { nom: 'Droit (Civil & Commercial)', code: 'DROIT', coefficientDefaut: 3, groupe: 'Technique' },
  { nom: 'Mathématiques Appliquées & Financières', code: 'MATH', coefficientDefaut: 3, groupe: 'Scientifique' },
  { nom: 'Français & Communication Écrite', code: 'FRAN', coefficientDefaut: 4, groupe: 'Littéraire' },
  { nom: 'Anglais Commercial', code: 'ANG', coefficientDefaut: 3, groupe: 'Littéraire' },
  { nom: 'Techniques Quantitatives de Gestion', code: 'TQG', coefficientDefaut: 3, groupe: 'Technique' },
  { nom: 'Bureautique & Informatique', code: 'INFO', coefficientDefaut: 2, groupe: 'Technique' },
  { nom: 'Éducation Physique et Sportive (EPS)', code: 'EPS', coefficientDefaut: 1, groupe: 'Sport' },
];

// 9. SÉRIES TECHNIQUES INDUSTRIELLES F (F1: Mécanique, F2: Électronique, F3: Électrotechnique, F4: Génie Civil)
export const MATIERES_LYCEE_F: MatiereOption[] = [
  { nom: 'Technologie de Spécialité (Mécanique/Électronique/Génie Civil)', code: 'TECH_SPEC', coefficientDefaut: 6, groupe: 'Technique' },
  { nom: 'Dessin Technique & Schémas Industriels', code: 'DESSIN', coefficientDefaut: 4, groupe: 'Technique' },
  { nom: 'Sciences Physiques & Électricité Industrielle', code: 'PCT', coefficientDefaut: 4, groupe: 'Scientifique' },
  { nom: 'Mathématiques', code: 'MATH', coefficientDefaut: 4, groupe: 'Scientifique' },
  { nom: 'Travaux Pratiques en Atelier (TP)', code: 'TP_ATELIER', coefficientDefaut: 4, groupe: 'Technique' },
  { nom: 'Français & Expression', code: 'FRAN', coefficientDefaut: 2, groupe: 'Littéraire' },
  { nom: 'Anglais Technique', code: 'ANG', coefficientDefaut: 2, groupe: 'Littéraire' },
  { nom: 'Éducation Physique et Sportive (EPS)', code: 'EPS', coefficientDefaut: 1, groupe: 'Sport' },
];

/**
 * Détecte si une classe appartient au primaire
 */
export function isClassePrimaire(classeNom: string): boolean {
  if (!classeNom) return false;
  const upper = classeNom.toUpperCase();
  const primaryKeys = [
    'MATERNELLE', 'CI', 'CP1', 'CP2', 'CP', 'CE1', 'CE2', 'CE', 'CM1', 'CM2', 'CM'
  ];
  return primaryKeys.some(k => upper.startsWith(k) || upper.includes(` ${k}`) || upper.includes(`-${k}`));
}

/**
 * Détecte la session d'une classe ('primaire' | 'college' | 'lycee')
 */
export function getSessionFromClasseNom(classeNom: string): 'primaire' | 'college' | 'lycee' {
  if (!classeNom) return 'college';
  if (isClassePrimaire(classeNom)) return 'primaire';
  
  const upper = classeNom.toUpperCase();
  if (
    upper.includes('6E') || upper.includes('6È') || upper.includes('6EME') || upper.includes('6ÈME') ||
    upper.includes('5E') || upper.includes('5È') || upper.includes('5EME') || upper.includes('5ÈME') ||
    upper.includes('4E') || upper.includes('4È') || upper.includes('4EME') || upper.includes('4ÈME') ||
    upper.includes('3E') || upper.includes('3È') || upper.includes('3EME') || upper.includes('3ÈME')
  ) {
    return 'college';
  }

  return 'lycee';
}

/**
 * Récupère les matières pour une classe donnée.
 * RÈGLE FONDAMENTALE : Les classes de Primaire renvoient un tableau vide [] !
 */
export function getMatieresPourClasse(classeNom: string): MatiereOption[] {
  if (!classeNom) return [];

  // PRIMAIRE = AUCUNE MATIÈRE / NOTES FORMELLES DANS CE MODULE PROF
  if (isClassePrimaire(classeNom)) {
    return [];
  }

  const upper = classeNom.toUpperCase();

  // Séries G (G1, G2, G3)
  if (upper.includes('G1') || upper.includes('G2') || upper.includes('G3') || upper.includes('COMMERCE') || upper.includes('GESTION')) {
    return MATIERES_LYCEE_G;
  }

  // Séries F (F1, F2, F3, F4)
  if (upper.includes('F1') || upper.includes('F2') || upper.includes('F3') || upper.includes('F4') || upper.includes('INDUSTRIEL')) {
    return MATIERES_LYCEE_F;
  }

  // Terminale
  if (upper.includes('TLE') || upper.includes('TERMINALE')) {
    if (upper.includes('C')) return MATIERES_LYCEE_C;
    if (upper.includes('D')) return MATIERES_LYCEE_D;
    return MATIERES_LYCEE_A4;
  }

  // Première
  if (upper.includes('1ERE') || upper.includes('1È') || upper.includes('PREMIERE')) {
    if (upper.includes('C')) return MATIERES_LYCEE_C;
    if (upper.includes('D')) return MATIERES_LYCEE_D;
    return MATIERES_LYCEE_A4;
  }

  // Seconde
  if (upper.includes('2NDE') || upper.includes('SECONDE') || upper.includes('2DE')) {
    if (upper.includes('C') || upper.includes('S')) return MATIERES_SECONDE_C;
    return MATIERES_SECONDE_A;
  }

  // Collège 4e / 3e
  if (upper.includes('4E') || upper.includes('4È') || upper.includes('4EME') || upper.includes('3E') || upper.includes('3È') || upper.includes('3EME')) {
    return MATIERES_COLLEGE_4E_3E;
  }

  // Collège 6e / 5e
  return MATIERES_COLLEGE_6E_5E;
}
