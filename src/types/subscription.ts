export type SubscriptionTier = 'starter' | 'pro' | 'premium' | 'etat' | 'special';

export type SubscriptionFeature = 
  | 'compta'              // Finances, paiements, journal de caisse, dépenses, salaires
  | 'realtime'            // Synchronisation instantanée Supabase realtime
  | 'multi_etablissements'// Multi-campus / multi-sites (jusqu'à 3 établissements)
  | 'logo_hd'             // Logo officiel personnalisé sur reçus & bulletins
  | 'export_avance'       // Exports comptables avancés (Excel / CSV détaillés)
  | 'classes_illimitees'; // Plus de 7 classes

export interface SubscriptionPlan {
  id: SubscriptionTier;
  nom: string;
  badge: string;
  prixMensuel: string;
  prixNumeric: number;
  periode: string;
  tagline: string;
  description: string;
  colorScheme: 'slate' | 'amber' | 'purple' | 'emerald' | 'blue';
  isPopular?: boolean;
  isSpecial5Years?: boolean;
  pointsForts: string[];
  features: {
    label: string;
    included: boolean;
    note?: string;
  }[];
  limits: {
    maxClasses: number; // 7 pour Starter, 15 pour Pro, 9999 pour Premium/Special/Etat
    allowCompta: boolean;
    allowRealtime: boolean;
    allowMultiEtablissements: boolean;
    allowLogoHD: boolean;
    allowExportAvance: boolean;
    isUnlimited: boolean;
    is5Years?: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  starter: {
    id: 'starter',
    nom: 'PACK STARTER',
    badge: '🚀 Démarrage',
    prixMensuel: '19 900 FCFA',
    prixNumeric: 19900,
    periode: '/ mois',
    tagline: 'Idéal pour petites écoles maternelles ou primaires locales',
    description: 'Pédagogie de base, pointage des présences et gestion simple des effectifs.',
    colorScheme: 'slate',
    pointsForts: [
      'Jusqu’à 7 classes maximum',
      'Gestion complète des élèves & matricules',
      'Bulletins de notes officiels',
      'Appel journalier & absences',
    ],
    features: [
      { label: 'Effectif & Classes (Max 7)', included: true, note: '7 classes max' },
      { label: 'Bulletins trimestriels officiels', included: true },
      { label: 'Appel journalier & discipline', included: true },
      { label: 'Emploi du temps & cahier de texte', included: true },
      { label: 'Comptabilité, Caisse & Dépenses', included: false, note: 'Bloqué en Starter' },
      { label: 'Synchronisation Realtime Live', included: false, note: 'Bloqué en Starter' },
      { label: 'Multi-établissements', included: false, note: '1 campus max' },
      { label: 'Logo HD Personnalisé sur reçus', included: false, note: 'Watermark standard' },
    ],
    limits: {
      maxClasses: 7,
      allowCompta: false,
      allowRealtime: false,
      allowMultiEtablissements: false,
      allowLogoHD: false,
      allowExportAvance: false,
      isUnlimited: false,
    },
  },
  pro: {
    id: 'pro',
    nom: 'PACK PRO',
    badge: '⭐ Le Plus Populaire',
    prixMensuel: '49 900 FCFA',
    prixNumeric: 49900,
    periode: '/ mois',
    tagline: 'La référence des collèges et lycées privés en Afrique',
    description: 'Comptabilité intégrée, journal de caisse, realtime et gestion pédagogique sans faille.',
    colorScheme: 'amber',
    isPopular: true,
    pointsForts: [
      'Comptabilité complète & Journal de Caisse',
      'Logo école officiel sur tous les reçus & bulletins',
      'Synchro temps réel alertes Proviseur / Censeur',
      'Gestion des salaires et reçus de scolarité',
    ],
    features: [
      { label: 'Gestion pédagogique complète', included: true },
      { label: 'Comptabilité complète & Caisse', included: true },
      { label: 'Logo Officiel HD sur Bulletins & Reçus', included: true },
      { label: 'Synchronisation Realtime Push', included: true },
      { label: 'Gestion des Salaires & Dépenses', included: true },
      { label: 'Communication WhatsApp Parents', included: true },
      { label: 'Multi-campus / multi-sites', included: false, note: '1 établissement' },
      { label: 'Classes & élèves illimités', included: false, note: 'Jusqu’à 20 classes' },
    ],
    limits: {
      maxClasses: 20,
      allowCompta: true,
      allowRealtime: true,
      allowMultiEtablissements: false,
      allowLogoHD: true,
      allowExportAvance: false,
      isUnlimited: false,
    },
  },
  premium: {
    id: 'premium',
    nom: 'PACK PREMIUM',
    badge: '👑 Tout Illimité',
    prixMensuel: '89 900 FCFA',
    prixNumeric: 89900,
    periode: '/ mois',
    tagline: 'Pour les grands complexes scolaires et réseaux d’écoles',
    description: 'Aucune limite. Multi-établissements, exports comptables avancés et support VIP.',
    colorScheme: 'purple',
    pointsForts: [
      'Classes et élèves 100% ILLIMITÉS',
      'Multi-établissements (jusqu’à 3 campus)',
      'Exports comptables fiscaux & bancaires avancés',
      'Support prioritaire 7j/7 WhatsApp & Téléphone',
    ],
    features: [
      { label: 'Toutes les fonctionnalités PRO incluses', included: true },
      { label: 'Classes & Effectifs Illimités', included: true },
      { label: 'Multi-établissements (3 campus max)', included: true },
      { label: 'Exports avancés Excel / Grand Livre', included: true },
      { label: 'Comptabilité multi-cycles isolée', included: true },
      { label: 'Branding complet & Logo HD', included: true },
      { label: 'Sauvegardes automatiques cloud Supabase', included: true },
      { label: 'Assistance VIP dédiée 24/7', included: true },
    ],
    limits: {
      maxClasses: 9999,
      allowCompta: true,
      allowRealtime: true,
      allowMultiEtablissements: true,
      allowLogoHD: true,
      allowExportAvance: true,
      isUnlimited: true,
    },
  },
  etat: {
    id: 'etat',
    nom: 'PACK ÉTAT / PUBLIC',
    badge: '🏛️ Établissements Publics',
    prixMensuel: '29 900 FCFA',
    prixNumeric: 29900,
    periode: '/ mois',
    tagline: 'Conçu pour les Lycées et Collèges d’Enseignement Public',
    description: '100% Pédagogie, discipline, notes officielles et examens nationaux. Sans gestion de trésorerie privée.',
    colorScheme: 'blue',
    pointsForts: [
      'Adapté au cursus officiel Ministère MEPS',
      'Bulletins trimestriels et relevés officiels',
      'Cahier de texte visé par le Censeur',
      'Tarif public subventionné très accessible',
    ],
    features: [
      { label: 'Pédagogie & Cursus National Togo', included: true },
      { label: 'Gestion des effectifs & matricules', included: true },
      { label: 'Cahier de texte numérique & visas', included: true },
      { label: 'Discipline, sanctions & absences', included: true },
      { label: 'Saisie des notes & Coefficients Togo', included: true },
      { label: 'Bulletins périodiques officiels', included: true },
      { label: 'Comptabilité & Frais d’écolage privé', included: false, note: 'Bloqué (Non requis)' },
      { label: 'Journal de caisse & Salaires privés', included: false, note: 'Bloqué (Gestion publique)' },
    ],
    limits: {
      maxClasses: 9999,
      allowCompta: false, // BLOCK finance pour le pack État
      allowRealtime: true,
      allowMultiEtablissements: false,
      allowLogoHD: true,
      allowExportAvance: false,
      isUnlimited: false,
    },
  },
  special: {
    id: 'special',
    nom: 'OFFRE SPÉCIALE 5 ANS',
    badge: '🔥 1 500 000 FCFA (5 ANS)',
    prixMensuel: '1 500 000 FCFA',
    prixNumeric: 1500000,
    periode: 'pour 5 ANS',
    tagline: 'Pack Premium complet garanti 5 ans + 150 000 FCFA / an de maintenance',
    description: 'La tranquillité absolue pour votre groupe scolaire. Économisez plus de 60% sur votre budget informatique.',
    colorScheme: 'emerald',
    isSpecial5Years: true,
    pointsForts: [
      'Accès PREMIUM TOTAL pendant 5 ANS',
      'Maintenance annuelle à seulement 150 000 FCFA / an',
      'Multi-établissements & Effectifs illimités',
      'Après 5 ans : bascule transparente sur tarif mensuel classique',
    ],
    features: [
      { label: 'Toutes fonctionnalités PREMIUM illimitées', included: true },
      { label: 'Licence verrouillée 5 années scolaires', included: true },
      { label: 'Maintenance technique 150 000 FCFA / an', included: true },
      { label: 'Mises à jour majeures EFA offertes', included: true },
      { label: 'Formation complète du personnel sur site', included: true },
      { label: 'Option de désactivation / bascule manuelle', included: true },
      { label: 'Assistance WhatsApp prioritaire dédiée', included: true },
    ],
    limits: {
      maxClasses: 9999,
      allowCompta: true,
      allowRealtime: true,
      allowMultiEtablissements: true,
      allowLogoHD: true,
      allowExportAvance: true,
      isUnlimited: true,
      is5Years: true,
    },
  },
};

/**
 * Génère le lien WhatsApp officiel pour commander ou activer un forfait
 */
export function getSubscriptionWhatsAppUrl(tier: SubscriptionTier, schoolName?: string): string {
  const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS.pro;
  const ecole = (schoolName && schoolName.trim()) ? schoolName.trim() : 'Mon Établissement';
  const text = `Bonjour EFA, je veux PACK ${plan.nom} pour ${ecole}`;
  return `https://wa.me/22896100972?text=${encodeURIComponent(text)}`;
}

/**
 * Contrôle les pare-feu de fonctionnalités selon l'abonnement actif
 */
export function verifySubscriptionFirewall(
  tier: SubscriptionTier, 
  feature: SubscriptionFeature, 
  currentClassCount: number = 0
): { allowed: boolean; reason?: string; requiredTier?: SubscriptionTier } {
  const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS.pro;

  // 1. Pack État : Blocage strict de toute la finance
  if (tier === 'etat' && feature === 'compta') {
    return {
      allowed: false,
      reason: "Le Pack ÉTAT est dédié aux établissements publics et n'intègre pas la comptabilité financière privée ni les caisses d'écolages.",
      requiredTier: 'pro',
    };
  }

  // 2. Pack Starter : Blocage compta, realtime, multi-établissements, logo HD, et max 7 classes
  if (tier === 'starter') {
    if (feature === 'compta') {
      return {
        allowed: false,
        reason: "La comptabilité complète, les paiements d'écolage et le journal de caisse nécessitent le Pack PRO ou PREMIUM.",
        requiredTier: 'pro',
      };
    }
    if (feature === 'realtime') {
      return {
        allowed: false,
        reason: "La synchronisation en temps réel instantanée (alertes Censeur/Directeur) nécessite le Pack PRO ou PREMIUM.",
        requiredTier: 'pro',
      };
    }
    if (feature === 'multi_etablissements') {
      return {
        allowed: false,
        reason: "La gestion de plusieurs campus scolaires (multi-établissements) est réservée au Pack PREMIUM.",
        requiredTier: 'premium',
      };
    }
    if (feature === 'logo_hd') {
      return {
        allowed: false,
        reason: "L'affichage du logo officiel haute définition de votre établissement sur les reçus et bulletins nécessite le Pack PRO ou PREMIUM.",
        requiredTier: 'pro',
      };
    }
    if (feature === 'classes_illimitees' && currentClassCount >= 7) {
      return {
        allowed: false,
        reason: "Le Pack STARTER est limité à 7 classes maximum. Passez au Pack PRO pour gérer jusqu'à 20 classes ou PREMIUM pour l'illimité.",
        requiredTier: 'pro',
      };
    }
  }

  // 3. Pack Pro : Blocage multi-établissements et export avancé
  if (tier === 'pro') {
    if (feature === 'multi_etablissements') {
      return {
        allowed: false,
        reason: "Le Pack PRO comprend 1 établissement unique. La gestion multi-campus nécessite le Pack PREMIUM.",
        requiredTier: 'premium',
      };
    }
    if (feature === 'export_avance') {
      return {
        allowed: false,
        reason: "Les exports financiers avancés et bilans comptables consolidés sont réservés au Pack PREMIUM.",
        requiredTier: 'premium',
      };
    }
  }

  return { allowed: true };
}
