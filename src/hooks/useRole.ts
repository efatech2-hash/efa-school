import { useState, useEffect, useCallback } from 'react';
import { UserRole, UserSession, DEMO_ACCOUNTS, AppTab, CycleId } from '../types/auth';
export { checkRole, checkCycle } from '../lib/supabase';

const STORAGE_ROLE_KEY = 'efa_role';
const STORAGE_USER_KEY = 'efa_user';

export const ROLE_ALLOWED_TABS: Record<UserRole, AppTab[]> = {
  fondateur: [
    'dashboard-fondateur',
    'session-view',
    'onboarding',
    'eleves',
    'inscriptions',
    'classes',
    'emploi-du-temps',
    'cahier-de-texte',
    'presences',
    'absences-profs',
    'discipline',
    'notes',
    'bulletins',
    'professeurs',
    'employes',
    'paiements',
    'journal-caisse',
    'depenses',
    'salaires',
    'rapports',
    'parents',
    'parametres',
    'abonnements',
  ],
  directeur: [
    'dashboard-fondateur', // Dashboard Proviseur / Principal / Directeur
    'session-view',
    'eleves',
    'inscriptions',
    'classes',
    'emploi-du-temps',
    'cahier-de-texte',
    'presences',
    'absences-profs',
    'discipline',
    'notes',
    'bulletins',
    'professeurs',
    'employes',
    'paiements', // Voir rapports
    'journal-caisse', // Lecture seule
    'depenses', // Proposer
    'salaires', // Lecture seule
    'rapports',
    'parents',
    'abonnements',
  ],
  censeur: [
    'dashboard-censeur',
    'session-view',
    'eleves', // Voir + modifier tout
    'classes',
    'emploi-du-temps', // Planification & Horaires
    'cahier-de-texte', // Contrôler / valider tous
    'presences', // Voir tout + justifier
    'absences-profs', // Gérer / remplacer
    'discipline', // Gérer sanctions / conseils
    'notes', // Vérifier / pré-valider
    'bulletins',
    'professeurs',
    'employes', // Créer profs
    'paiements', // Impayés lecture seule uniquement
    'salaires', // Lecture seule
    'parents',
  ],
  caisse: [
    'dashboard-caisse',
    'session-view',
    'eleves', // Voir + contact parents
    'paiements', // Encaisser / Reçu / Impayés
    'journal-caisse', // Saisie & livre de caisse
    'depenses', // Saisie < 10k
    'salaires', // Remettre enveloppe / Signature
    'rapports', // Rapports financiers PDF
  ],
  professeur: [
    'dashboard-professeur',
    'classes', // Voir ses classes
    'eleves', // Voir ses élèves uniquement
    'emploi-du-temps', // Voir le sien
    'cahier-de-texte', // Saisir le sien
    'presences', // Faire appel ses classes
    'absences-profs', // Signaler son absence
    'discipline', // Signaler incident
    'notes', // Saisir ses matières
    'bulletins', // Proposer
    'salaires', // Voir MON salaire uniquement
    'parents',
  ],
};

/**
 * RÈGLES D'OR MATRICE V2 À CODER EN DUR (middleware & frontend) :
 * 1. if role == 'caisse' => BLOCK route /notes et /bulletins
 * 2. if role == 'professeur' => BLOCK route /finance (paiements, journal-caisse, depenses)
 * 3. if role == 'censeur' => BLOCK route /finance (sauf lecture seule impayés dans paiements)
 * 4. if action == 'create-salary' && role != 'fondateur' => FORBIDDEN
 */
export function checkGoldRuleAccess(role: UserRole, tab: AppTab): boolean {
  // Règle d'or 1 : Caisse n'a JAMAIS accès aux notes et bulletins
  if (role === 'caisse' && (tab === 'notes' || tab === 'bulletins')) {
    return false;
  }

  // Règle d'or 2 : Prof n'a JAMAIS accès aux finances
  if (role === 'professeur' && (tab === 'paiements' || tab === 'journal-caisse' || tab === 'depenses' || tab === 'rapports')) {
    return false;
  }

  // Règle d'or 3 : Censeur n'a JAMAIS accès aux caisses directes ni dépenses
  if (role === 'censeur' && (tab === 'journal-caisse' || tab === 'depenses' || tab === 'inscriptions')) {
    return false;
  }

  return true;
}

/**
 * Validation des actions sensibles selon la matrice
 */
export function isActionPermitted(role: UserRole, action: string): boolean {
  // Règle d'or 4 : SEUL LE FONDATEUR PEUT CRÉER UN SALAIRE
  if (action === 'create-salary' && role !== 'fondateur') {
    return false;
  }

  if (action === 'delete-user' && role !== 'fondateur') {
    return false;
  }

  if (action === 'validate-all-expenses' && role !== 'fondateur') {
    return false;
  }

  if (action === 'create-caisse-or-censeur' && role !== 'fondateur' && role !== 'directeur') {
    return false;
  }

  if (action === 'create-prof' && role !== 'fondateur' && role !== 'directeur' && role !== 'censeur') {
    return false;
  }

  if (role === 'caisse' && (action === 'saisie-notes' || action === 'valider-bulletin' || action === 'modifier-emploi-temps')) {
    return false;
  }

  if ((role === 'professeur' || role === 'censeur') && action === 'encaisser-frais') {
    return false;
  }

  if (role === 'professeur' && (action === 'creer-depense' || action === 'valider-sanction-exclusion')) {
    return false;
  }

  return true;
}

export function getDefaultDashboardForRole(role: UserRole): AppTab {
  switch (role) {
    case 'caisse':
      return 'dashboard-caisse';
    case 'censeur':
      return 'dashboard-censeur';
    case 'professeur':
      return 'dashboard-professeur';
    case 'directeur':
    case 'fondateur':
    default:
      return 'dashboard-fondateur';
  }
}

export function useRole() {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ROLE_KEY) as UserRole;
      if (stored && ['fondateur', 'directeur', 'censeur', 'caisse', 'professeur'].includes(stored)) {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'fondateur';
  });

  const [user, setUserState] = useState<UserSession>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.fondateur;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  const setRole = useCallback((newRole: UserRole, customUser?: Partial<UserSession>) => {
    setRoleState(newRole);
    localStorage.setItem(STORAGE_ROLE_KEY, newRole);

    const baseUser = DEMO_ACCOUNTS[newRole] || DEMO_ACCOUNTS.fondateur;
    const fullUser: UserSession = {
      ...baseUser,
      ...customUser,
      role: newRole,
      cycle_id: customUser?.cycle_id || baseUser.cycle_id || (newRole === 'fondateur' ? 'all' : 'lycee'),
    };
    setUserState(fullUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(fullUser));
  }, []);

  const loginAs = useCallback((targetRole: UserRole, email?: string, cycle_id?: CycleId) => {
    const extra: Partial<UserSession> = {};
    if (email) extra.email = email;
    if (cycle_id) extra.cycle_id = cycle_id;
    setRole(targetRole, extra);
    return getDefaultDashboardForRole(targetRole);
  }, [setRole]);

  const hasAccessToTab = useCallback((tab: AppTab): boolean => {
    if (tab === '403') return true;
    
    // 1. RÈGLES D'OR STRICTES
    if (!checkGoldRuleAccess(role, tab)) {
      return false;
    }

    // 2. MATRICE DE PERMISSION PAR RÔLE
    const allowed = ROLE_ALLOWED_TABS[role] || [];
    return allowed.includes(tab);
  }, [role]);

  return {
    role,
    user,
    setRole,
    loginAs,
    hasAccessToTab,
    isActionPermitted: (action: string) => isActionPermitted(role, action),
    defaultDashboard: getDefaultDashboardForRole(role),
    toastMessage,
    triggerToast,
    clearToast: () => setToastMessage(null),
  };
}
