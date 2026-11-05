import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour EFA SCHOOL
// Supporte à la fois process.env et import.meta.env
const url = process.env.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL || 'https://efa-school.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_efa_placeholder';

export const supabase = createClient(url, key);

export type CycleIdEnum = 'primaire' | 'college' | 'lycee' | 'all';
export type UserRoleEnum = 'fondateur' | 'directeur' | 'censeur' | 'caisse' | 'professeur';

/**
 * Middleware de sécurité côté client : checkRole
 * Vérifie si le rôle de l'utilisateur a accès au module demandé selon la matrice officielle EFA SCHOOL V2
 */
export function checkRole(role: UserRoleEnum, targetModule: string): { allowed: boolean; reason?: string } {
  // Règle 1: Caisse = BLOCK /notes et /bulletins
  if (role === 'caisse' && (targetModule === 'notes' || targetModule === 'bulletins')) {
    return { allowed: false, reason: 'Accès refusé : la caisse n\'a pas accès aux notes et bulletins.' };
  }

  // Règle 2: Professeur = BLOCK /finance (paiements, journal-caisse, depenses, rapports)
  if (role === 'professeur' && (targetModule === 'finance' || targetModule === 'paiements' || targetModule === 'journal-caisse' || targetModule === 'depenses' || targetModule === 'rapports')) {
    return { allowed: false, reason: 'Accès refusé : les professeurs n\'ont pas accès au module financier.' };
  }

  // Règle 3: Censeur = BLOCK /finance (sauf lecture des impayés)
  if (role === 'censeur' && (targetModule === 'journal-caisse' || targetModule === 'depenses' || targetModule === 'inscriptions')) {
    return { allowed: false, reason: 'Accès refusé : le censeur a uniquement accès en lecture seule aux impayés.' };
  }

  // Règle 4: Salaire (création) = réservé exclusivement au Fondateur
  if (targetModule === 'create-salary' && role !== 'fondateur') {
    return { allowed: false, reason: 'Action interdite : seul le Fondateur peut créer ou modifier une grille salariale.' };
  }

  return { allowed: true };
}

/**
 * Middleware de cycle : checkCycle
 * Vérifie si l'utilisateur ou la ressource correspond au cycle autorisé
 * - 'all' (Fondateur) voit tous les cycles
 * - Un directeur/censeur/prof ne voit que les ressources de son cycle
 */
export function checkCycle(userCycle: CycleIdEnum, resourceCycle: CycleIdEnum): boolean {
  if (userCycle === 'all') return true;
  return userCycle === resourceCycle;
}

/**
 * Testeur de connexion et de requête Supabase avec fallback automatique
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('users').select('id, email, role, cycle_id').limit(1);
    if (error) {
      return { connected: false, message: error.message };
    }
    return { connected: true, message: `Connecté à Supabase (${data?.length || 0} utilisateurs détectés)` };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Erreur réseau Supabase' };
  }
}

/**
 * Canal Realtime Supabase pour la synchronisation instantanée EFA SCHOOL
 */
export const EFA_REALTIME_CHANNEL = 'efa-school-live';

export interface RealtimeSchoolAlert {
  id: string;
  type: 'appel' | 'absence';
  title: string;
  message: string;
  timestamp: string;
  cycle_id?: CycleIdEnum;
}

/**
 * Diffusion instantanée (Prof -> Censeur + Directeur) lors de la validation d'un appel
 */
export function broadcastAppelJour(data: {
  classeNom: string;
  professeurNom: string;
  totalPresents: number;
  totalAbsents: number;
  date: string;
  session?: CycleIdEnum;
}) {
  try {
    const channel = supabase.channel(EFA_REALTIME_CHANNEL);
    channel.send({
      type: 'broadcast',
      event: 'appel_realise',
      payload: {
        ...data,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    });
  } catch (err) {
    console.warn('Realtime broadcast error (offline fallback):', err);
  }
}

/**
 * Diffusion instantanée (Prof -> Censeur + Directeur) lors d'un signalement d'absence prof
 */
export function broadcastAbsenceProf(data: {
  profNom: string;
  motif: string;
  dateDebut: string;
  matiere?: string;
  classeNom?: string;
  session?: CycleIdEnum;
}) {
  try {
    const channel = supabase.channel(EFA_REALTIME_CHANNEL);
    channel.send({
      type: 'broadcast',
      event: 'absence_prof_signalee',
      payload: {
        ...data,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    });
  } catch (err) {
    console.warn('Realtime broadcast error (offline fallback):', err);
  }
}

/**
 * Écoute en temps réel des alertes pour Censeur et Directeur
 */
export function subscribeToSchoolAlerts(callback: (alert: RealtimeSchoolAlert) => void) {
  try {
    const channel = supabase.channel(EFA_REALTIME_CHANNEL);
    channel
      .on('broadcast', { event: 'appel_realise' }, ({ payload }) => {
        callback({
          id: `appel-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          type: 'appel',
          title: `Appel Réalisé · ${payload.classeNom}`,
          message: `${payload.professeurNom} a clôturé l'appel (${payload.totalPresents} présents, ${payload.totalAbsents} absents).`,
          timestamp: payload.timestamp || new Date().toLocaleTimeString(),
          cycle_id: payload.session,
        });
      })
      .on('broadcast', { event: 'absence_prof_signalee' }, ({ payload }) => {
        const details = payload.classeNom ? ` (${payload.classeNom})` : '';
        const mat = payload.matiere ? `${payload.matiere} : ` : '';
        callback({
          id: `abs-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          type: 'absence',
          title: `Signalement d'Absence · ${payload.profNom}`,
          message: `${mat}${payload.motif}${details}`,
          timestamp: payload.timestamp || new Date().toLocaleTimeString(),
          cycle_id: payload.session,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
}

