import { SubscriptionTier } from './subscription';
export type { SubscriptionTier } from './subscription';

export type SessionKey = 'primaire' | 'college' | 'lycee';

export interface LyceeNiveauConfig {
  niveau: string; // '2nde' | '1ère' | 'Tle'
  series: string[]; // e.g. ['A4', 'C', 'D']
}

export interface EfaConfig {
  ecole: string;
  ville: string;
  sessions: SessionKey[];
  classesPrimaire: string[];
  classesCollege: string[];
  niveauxLycee: LyceeNiveauConfig[];
  etablissements: string[];
  currentEtablissement?: string;
  dateConfigured?: string;
  logoEcole?: string; // Data URL Base64 ou URL de logo personnalisé
  subscription_tier?: SubscriptionTier; // 'starter' | 'pro' | 'premium' | 'etat' | 'special'
}

export const ALL_SESSIONS: { key: SessionKey; label: string; icon: string; description: string }[] = [
  { key: 'primaire', label: 'Cours Primaire', icon: '🎒', description: 'Maternelle, CI, CP1, CP2, CE1, CE2, CM1, CM2' },
  { key: 'college', label: 'Collège', icon: '📘', description: 'De la 6ème à la 3ème (Préparation BEPC)' },
  { key: 'lycee', label: 'Lycée', icon: '🎓', description: 'De la 2nde à la Terminale (Enseignement Général & Technique)' },
];

export const DEFAULT_CLASSES_PRIMAIRE = [
  'Maternelle 1', 'Maternelle 2', 'CI', 'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'
];

export const DEFAULT_CLASSES_COLLEGE = [
  '6ème', '5ème', '4ème', '3ème'
];

export const ALL_SERIES_LYCEE = [
  'A4', 'C', 'D', 'G1', 'G2', 'G3', 'F1', 'F2', 'F3', 'F4'
];

export const DEFAULT_EFA_CONFIG: EfaConfig = {
  ecole: "Complexe Scolaire EFA Excellence",
  ville: "Lomé",
  sessions: ['primaire', 'college', 'lycee'],
  classesPrimaire: ['CP1-A', 'CE2-B'],
  classesCollege: ['6ème A', '5ème B'],
  niveauxLycee: [
    { niveau: '2nde', series: ['A4', 'C'] },
    { niveau: '1ère', series: ['A4', 'D'] },
    { niveau: 'Tle', series: ['D'] },
  ],
  etablissements: [
    "Complexe Scolaire EFA Excellence - Siège (Lomé)",
    "Campus EFA Excellence - Annexe B (Adidogomé)",
  ],
  currentEtablissement: "Complexe Scolaire EFA Excellence - Siège (Lomé)",
  dateConfigured: new Date().toISOString(),
  subscription_tier: 'pro',
};

export const CONFIG_STORAGE_KEY = 'efa_config';

export function getStoredConfig(): EfaConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
        return {
          ...DEFAULT_EFA_CONFIG,
          ...parsed,
          subscription_tier: parsed.subscription_tier || 'pro',
          logoEcole: parsed.logoEcole || undefined,
          etablissements: parsed.etablissements || DEFAULT_EFA_CONFIG.etablissements,
          currentEtablissement: parsed.currentEtablissement || parsed.etablissements?.[0] || DEFAULT_EFA_CONFIG.currentEtablissement,
        };
      }
    }
  } catch {}
  return DEFAULT_EFA_CONFIG;
}

export function saveStoredConfig(config: EfaConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Erreur sauvegarde config efa:', e);
  }
}
