import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Classe, Eleve, Depense, Enseignant, MessageWhatsApp, 
  ParametresEcole, Paiement, Groupe, SessionType, AppelRecordJour,
  CycleId, CahierTexteRecord, IncidentDisciplineRecord, AbsenceProfRecord
} from '../types';
import { 
  initialClasses, initialEleves, initialDepenses, 
  initialEnseignants, initialMessages, initialParametres 
} from '../data/initialData';
import { initialCahiersTexte, initialIncidentsDiscipline, initialAbsencesProfs } from '../data/discipline_cahier_data';
import { EfaConfig, getStoredConfig, saveStoredConfig, DEFAULT_EFA_CONFIG } from '../types/config';
import { getSessionFromClasseNom } from '../data/matieres_par_classe';
import { supabase, broadcastAppelJour, broadcastAbsenceProf } from '../lib/supabase';

export interface SessionMetrics {
  effectif: number;
  classesCount: number;
  scolariteTotal: number;
  recettes: number;
  depenses: number;
  impayes: number;
  net: number;
}

interface SchoolContextType {
  classes: Classe[];
  eleves: Eleve[];
  depenses: Depense[];
  enseignants: Enseignant[];
  messages: MessageWhatsApp[];
  parametres: ParametresEcole;
  config: EfaConfig;
  currentEtablissement: string;
  selectedSession: SessionType | null;
  appelsJour: AppelRecordJour[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  supabaseStatus: { connected: boolean; message: string; lastSync?: string };
  refreshSupabase: () => Promise<void>;
  
  // Overall Statistics
  totalEleves: number;
  totalClasses: number;
  totalScolariteFacturee: number;
  totalRecettes: number;
  totalImpayes: number;
  totalDepenses: number;
  beneficeNet: number;
  tauxRecouvrement: number;
  elevesEnRetard: Eleve[];
  classesSurchargees: { classe: Classe; count: number; max: number }[];

  // Session Statistics & Isolations
  sessionMetrics: Record<SessionType, SessionMetrics>;
  cyclesGroupedSummary: {
    primaire: SessionMetrics;
    college: SessionMetrics;
    lycee: SessionMetrics;
    global: {
      totalEffectif: number;
      totalClasses: number;
      totalScolariteFacturee: number;
      totalCaisse: number;
      totalDepenses: number;
      totalImpayes: number;
      totalNet: number;
      tauxRecouvrement: number;
    };
  };
  getElevesBySession: (session: SessionType) => Eleve[];
  getClassesBySession: (session: SessionType) => Classe[];
  getDepensesBySession: (session: SessionType) => Depense[];
  getAppelsBySession: (session: SessionType) => AppelRecordJour[];

  // Cycle purchase & User filtering helpers
  isCyclePurchased: (cycle: SessionType) => boolean;
  getElevesForUser: (userCycleId?: CycleId) => Eleve[];
  getClassesForUser: (userCycleId?: CycleId) => Classe[];

  // State setters
  setSelectedSession: (session: SessionType | null) => void;
  setCurrentEtablissement: (name: string) => void;
  updateConfig: (newCfg: EfaConfig) => void;
  saveAppelJour: (record: AppelRecordJour) => void;

  // Cahier de Texte
  cahiersTexte: CahierTexteRecord[];
  addCahierTexte: (record: Omit<CahierTexteRecord, 'id'>) => CahierTexteRecord;
  validerCahierTexte: (id: string, visaDate?: string) => void;

  // Discipline & Incidents
  incidentsDiscipline: IncidentDisciplineRecord[];
  addIncidentDiscipline: (record: Omit<IncidentDisciplineRecord, 'id'>) => IncidentDisciplineRecord;
  validerSanctionProviseur: (id: string, decision: string) => void;

  // Absences Profs
  absencesProfs: AbsenceProfRecord[];
  signalerAbsenceProf: (record: Omit<AbsenceProfRecord, 'id' | 'statut'>) => AbsenceProfRecord;
  assignerRemplacementProf: (id: string, remplacantNom: string) => void;

  // Actions: Classes
  addClasse: (classe: Omit<Classe, 'id'>) => Classe;
  duplicateClasseGroup: (classeId: string) => Classe | null;
  updateClasse: (classe: Classe) => void;
  deleteClasse: (classeId: string) => void;
  
  // Actions: Eleves
  addEleve: (data: Omit<Eleve, 'id' | 'matricule' | 'paiements' | 'notes' | 'presences'>) => Eleve;
  updateEleve: (eleve: Eleve) => void;
  deleteEleve: (eleveId: string) => void;
  
  // Actions: Paiements
  addPaiement: (eleveId: string, data: Omit<Paiement, 'id' | 'eleveId' | 'numeroRecu'>) => Paiement;
  
  // Actions: Depenses
  addDepense: (data: Omit<Depense, 'id'>) => Depense;
  deleteDepense: (id: string) => void;
  
  // Actions: Enseignants
  addEnseignant: (data: Omit<Enseignant, 'id'>) => Enseignant;
  updateEnseignant: (ens: Enseignant) => void;
  deleteEnseignant: (id: string) => void;
  
  // Actions: Communication
  logWhatsAppMessage: (msg: Omit<MessageWhatsApp, 'id' | 'date' | 'statut'>) => MessageWhatsApp;
  
  // Actions: Settings
  updateParametres: (params: ParametresEcole) => void;
  resetToDemoData: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLASSES: 'efa_school_classes_v3',
  ELEVES: 'efa_school_eleves_v3',
  DEPENSES: 'efa_school_depenses_v3',
  ENSEIGNANTS: 'efa_school_enseignants_v3',
  MESSAGES: 'efa_school_messages_v3',
  PARAMETRES: 'efa_school_params_v3',
  APPELS: 'efa_appels_jour',
};

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Config & Sessions
  const [config, setConfig] = useState<EfaConfig>(() => getStoredConfig());
  const [currentEtablissement, setCurrentEtablissementState] = useState<string>(
    () => config.currentEtablissement || config.etablissements?.[0] || DEFAULT_EFA_CONFIG.etablissements[0]
  );
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(null);

  // 2. Core entities
  const [classes, setClasses] = useState<Classe[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialClasses;
  });

  const [eleves, setEleves] = useState<Eleve[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ELEVES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialEleves;
  });

  const [depenses, setDepenses] = useState<Depense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEPENSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialDepenses;
  });

  const [enseignants, setEnseignants] = useState<Enseignant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENSEIGNANTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialEnseignants;
  });

  const [messages, setMessages] = useState<MessageWhatsApp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialMessages;
  });

  const [parametres, setParametres] = useState<ParametresEcole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARAMETRES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.nom) return parsed;
      }
    } catch {}
    return initialParametres;
  });

  // Daily roll-call records
  const [appelsJour, setAppelsJour] = useState<AppelRecordJour[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPELS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    // Initial sample roll-call for demo
    return [
      {
        id: 'appel-cp1-initial',
        date: new Date().toISOString().split('T')[0],
        heureEnvoi: '08:15',
        classeId: 'cls-cp1-a',
        classeNom: 'CP1-A',
        professeurNom: 'Koffi ADANGBE',
        session: 'primaire',
        totalEleves: 25,
        totalPresents: 23,
        totalAbsents: 2,
        totalRetards: 0,
        absents: [
          { eleveId: 'std-cls-cp1-a-7', nomComplet: 'KOUASSI Prince', matricule: 'EFA-CP1-007', statut: 'Absent', motif: 'Fièvre paludéenne' },
          { eleveId: 'std-cls-cp1-a-14', nomComplet: 'DIALLO Aminata', matricule: 'EFA-CP1-014', statut: 'Absent', motif: 'Voyage familial' }
        ]
      }
    ];
  });

  // Cahier de Texte
  const [cahiersTexte, setCahiersTexte] = useState<CahierTexteRecord[]>(() => {
    try {
      const saved = localStorage.getItem('efa_cahiers_texte_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialCahiersTexte;
  });

  // Discipline & Incidents
  const [incidentsDiscipline, setIncidentsDiscipline] = useState<IncidentDisciplineRecord[]>(() => {
    try {
      const saved = localStorage.getItem('efa_discipline_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialIncidentsDiscipline;
  });

  // Absences Professeurs & Remplacements
  const [absencesProfs, setAbsencesProfs] = useState<AbsenceProfRecord[]>(() => {
    try {
      const saved = localStorage.getItem('efa_absences_profs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialAbsencesProfs;
  });

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('efa_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'light'; // Default light mode
  });

  // Supabase Live Status & Sync
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; message: string; lastSync?: string }>({
    connected: false,
    message: 'Initialisation Supabase...',
  });

  const refreshSupabase = async () => {
    try {
      const { data, error } = await supabase.from('users').select('id, email, role, cycle_id').limit(5);
      if (!error && data) {
        setSupabaseStatus({
          connected: true,
          message: `Connecté à Supabase (${data.length} utilisateurs)`,
          lastSync: new Date().toLocaleTimeString(),
        });
      } else {
        setSupabaseStatus({
          connected: false,
          message: error?.message || 'Prêt pour configuration Supabase',
          lastSync: new Date().toLocaleTimeString(),
        });
      }
    } catch (e: any) {
      setSupabaseStatus({
        connected: false,
        message: e?.message || 'Mode local / Démo sécurisée',
        lastSync: new Date().toLocaleTimeString(),
      });
    }
  };

  useEffect(() => {
    refreshSupabase();
  }, []);

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('efa_theme', theme);
  }, [theme]);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ELEVES, JSON.stringify(eleves));
  }, [eleves]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPENSES, JSON.stringify(depenses));
  }, [depenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENSEIGNANTS, JSON.stringify(enseignants));
  }, [enseignants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARAMETRES, JSON.stringify(parametres));
  }, [parametres]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPELS, JSON.stringify(appelsJour));
  }, [appelsJour]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateConfig = (newCfg: EfaConfig) => {
    setConfig(newCfg);
    saveStoredConfig(newCfg);
  };

  const setCurrentEtablissement = (name: string) => {
    setCurrentEtablissementState(name);
    const updated = { ...config, currentEtablissement: name };
    setConfig(updated);
    saveStoredConfig(updated);
  };

  const saveAppelJour = (record: AppelRecordJour) => {
    setAppelsJour(prev => {
      const filtered = prev.filter(a => !(a.date === record.date && a.classeId === record.classeId));
      const next = [record, ...filtered];
      try {
        localStorage.setItem(STORAGE_KEYS.APPELS, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Realtime broadcast to Censeur and Direction
    broadcastAppelJour({
      classeNom: record.classeNom,
      professeurNom: record.professeurNom,
      totalPresents: record.totalPresents,
      totalAbsents: record.totalAbsents,
      date: record.date,
      session: record.session as any,
    });
  };

  // Helper to resolve session for a class
  const resolveClasseSession = (cls: Classe): SessionType => {
    if (cls.session) return cls.session;
    return getSessionFromClasseNom(cls.nom);
  };

  // Helper to resolve session for an eleve
  const resolveEleveSession = (el: Eleve): SessionType => {
    if (el.session) return el.session;
    const parentCls = classes.find(c => c.id === el.classeId);
    if (parentCls) return resolveClasseSession(parentCls);
    return 'college';
  };

  // Session-isolated queries
  const getElevesBySession = (session: SessionType): Eleve[] => {
    return eleves.filter(el => resolveEleveSession(el) === session);
  };

  const getClassesBySession = (session: SessionType): Classe[] => {
    return classes.filter(cls => resolveClasseSession(cls) === session);
  };

  const getDepensesBySession = (session: SessionType): Depense[] => {
    return depenses.filter(dep => dep.session === session || dep.session === 'generale');
  };

  const getAppelsBySession = (session: SessionType): AppelRecordJour[] => {
    return appelsJour.filter(a => a.session === session);
  };

  // Overall calculations
  const totalEleves = eleves.length;
  const totalClasses = classes.length;

  const totalScolariteFacturee = useMemo(() => {
    return eleves.reduce((acc, el) => acc + (el.scolariteTotal || 0), 0);
  }, [eleves]);

  const totalRecettes = useMemo(() => {
    return eleves.reduce((acc, el) => acc + (el.montantPaye || 0), 0);
  }, [eleves]);

  const totalImpayes = Math.max(0, totalScolariteFacturee - totalRecettes);

  const totalDepenses = useMemo(() => {
    return depenses.reduce((acc, dep) => acc + (dep.montant || 0), 0);
  }, [depenses]);

  const beneficeNet = totalRecettes - totalDepenses;

  const tauxRecouvrement = totalScolariteFacturee > 0 
    ? Math.round((totalRecettes / totalScolariteFacturee) * 100) 
    : 0;

  const elevesEnRetard = useMemo(() => {
    return eleves.filter(el => {
      const reste = (el.scolariteTotal || 0) - (el.montantPaye || 0);
      return reste > 0;
    });
  }, [eleves]);

  const classesSurchargees = useMemo(() => {
    const list: { classe: Classe; count: number; max: number }[] = [];
    classes.forEach(cls => {
      const count = eleves.filter(e => e.classeId === cls.id).length;
      if (count > cls.effectifMax) {
        list.push({ classe: cls, count, max: cls.effectifMax });
      }
    });
    return list;
  }, [classes, eleves]);

  // Session Metrics calculation
  const sessionMetrics = useMemo<Record<SessionType, SessionMetrics>>(() => {
    const sessions: SessionType[] = ['primaire', 'college', 'lycee'];
    const result: Record<SessionType, SessionMetrics> = {
      primaire: { effectif: 0, classesCount: 0, scolariteTotal: 0, recettes: 0, depenses: 0, impayes: 0, net: 0 },
      college: { effectif: 0, classesCount: 0, scolariteTotal: 0, recettes: 0, depenses: 0, impayes: 0, net: 0 },
      lycee: { effectif: 0, classesCount: 0, scolariteTotal: 0, recettes: 0, depenses: 0, impayes: 0, net: 0 },
    };

    sessions.forEach(sess => {
      const sessionEleves = eleves.filter(e => resolveEleveSession(e) === sess);
      const sessionClasses = classes.filter(c => resolveClasseSession(c) === sess);
      const sessionDep = depenses.filter(d => d.session === sess);

      const scolarite = sessionEleves.reduce((s, e) => s + (e.scolariteTotal || 0), 0);
      const rec = sessionEleves.reduce((s, e) => s + (e.montantPaye || 0), 0);
      const dep = sessionDep.reduce((s, d) => s + (d.montant || 0), 0);
      const imp = Math.max(0, scolarite - rec);

      result[sess] = {
        effectif: sessionEleves.length,
        classesCount: sessionClasses.length,
        scolariteTotal: scolarite,
        recettes: rec,
        depenses: dep,
        impayes: imp,
        net: rec - dep,
      };
    });

    return result;
  }, [eleves, classes, depenses]);

  // V2 Matrice & 3 Blocs : Cycle-based isolation & Global SQL Group By simulation
  const cyclesGroupedSummary = useMemo(() => {
    const s = sessionMetrics;
    const totalEffectif = s.primaire.effectif + s.college.effectif + s.lycee.effectif;
    const totalClasses = s.primaire.classesCount + s.college.classesCount + s.lycee.classesCount;
    const totalScolariteFacturee = s.primaire.scolariteTotal + s.college.scolariteTotal + s.lycee.scolariteTotal;
    const totalCaisse = s.primaire.recettes + s.college.recettes + s.lycee.recettes;
    const totalDepenses = s.primaire.depenses + s.college.depenses + s.lycee.depenses;
    const totalImpayes = s.primaire.impayes + s.college.impayes + s.lycee.impayes;
    const totalNet = totalCaisse - totalDepenses;
    const tauxRecouvrement = totalScolariteFacturee > 0 ? Math.round((totalCaisse / totalScolariteFacturee) * 100) : 0;

    return {
      primaire: s.primaire,
      college: s.college,
      lycee: s.lycee,
      global: {
        totalEffectif,
        totalClasses,
        totalScolariteFacturee,
        totalCaisse,
        totalDepenses,
        totalImpayes,
        totalNet,
        tauxRecouvrement,
      },
    };
  }, [sessionMetrics]);

  // Cahier de Texte Actions
  const addCahierTexte = (data: Omit<CahierTexteRecord, 'id'>): CahierTexteRecord => {
    const id = `ct-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const record: CahierTexteRecord = { ...data, id };
    setCahiersTexte(prev => {
      const next = [record, ...prev];
      localStorage.setItem('efa_cahiers_texte_v2', JSON.stringify(next));
      return next;
    });
    return record;
  };

  const validerCahierTexte = (id: string, visaDate?: string) => {
    const today = visaDate || new Date().toISOString().split('T')[0];
    setCahiersTexte(prev => {
      const next = prev.map(c => c.id === id ? { ...c, valideParCenseur: true, visaDate: today } : c);
      localStorage.setItem('efa_cahiers_texte_v2', JSON.stringify(next));
      return next;
    });
  };

  // Discipline Actions
  const addIncidentDiscipline = (data: Omit<IncidentDisciplineRecord, 'id'>): IncidentDisciplineRecord => {
    const id = `disc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const record: IncidentDisciplineRecord = { ...data, id };
    setIncidentsDiscipline(prev => {
      const next = [record, ...prev];
      localStorage.setItem('efa_discipline_v2', JSON.stringify(next));
      return next;
    });
    return record;
  };

  const validerSanctionProviseur = (id: string, decision: string) => {
    setIncidentsDiscipline(prev => {
      const next = prev.map(inc => inc.id === id ? { ...inc, valideParProviseur: true, decisionProviseur: decision } : inc);
      localStorage.setItem('efa_discipline_v2', JSON.stringify(next));
      return next;
    });
  };

  const signalerAbsenceProf = (data: Omit<AbsenceProfRecord, 'id' | 'statut'>): AbsenceProfRecord => {
    const id = `abs-p-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const record: AbsenceProfRecord = { ...data, id, statut: 'Signalée' };
    setAbsencesProfs(prev => {
      const next = [record, ...prev];
      localStorage.setItem('efa_absences_profs_v2', JSON.stringify(next));
      return next;
    });

    // Realtime broadcast to Censeur and Direction
    broadcastAbsenceProf({
      profNom: data.professeurNom,
      motif: data.motif,
      dateDebut: data.dateDebut,
      session: data.cycle_id as any,
    });

    return record;
  };

  const assignerRemplacementProf = (id: string, remplacantNom: string) => {
    setAbsencesProfs(prev => {
      const next: AbsenceProfRecord[] = prev.map(a => a.id === id ? { ...a, statut: 'Remplacement assigné' as const, remplacantNom } : a);
      localStorage.setItem('efa_absences_profs_v2', JSON.stringify(next));
      return next;
    });
  };

  // Helper pour vérifier si un cycle a été acheté
  const isCyclePurchased = (cycle: SessionType): boolean => {
    return (config.sessions || ['primaire', 'college', 'lycee']).includes(cycle);
  };

  const getElevesForUser = (userCycleId?: CycleId): Eleve[] => {
    if (!userCycleId || userCycleId === 'all') return eleves;
    return eleves.filter(e => resolveEleveSession(e) === userCycleId);
  };

  const getClassesForUser = (userCycleId?: CycleId): Classe[] => {
    if (!userCycleId || userCycleId === 'all') return classes;
    return classes.filter(c => resolveClasseSession(c) === userCycleId);
  };

  // Actions: Classes
  const addClasse = (newClasseData: Omit<Classe, 'id'>): Classe => {
    const id = `cls-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const session = newClasseData.session || getSessionFromClasseNom(newClasseData.nom);
    const newClasse: Classe = { ...newClasseData, id, session };
    setClasses(prev => [...prev, newClasse]);
    return newClasse;
  };

  const duplicateClasseGroup = (classeId: string): Classe | null => {
    const source = classes.find(c => c.id === classeId);
    if (!source) return null;

    const existingGroups = classes
      .filter(c => c.niveau === source.niveau && (!source.serie || c.serie === source.serie))
      .map(c => c.groupe);

    const groupLetters: Groupe[] = ['A', 'B', 'C', 'D', 'E'];
    const nextGroup = groupLetters.find(g => !existingGroups.includes(g)) || 'B';

    let newNom = `${source.niveau}-${nextGroup}`;
    if (source.serie) {
      newNom = `${source.niveau} ${source.serie}-${nextGroup}`;
    }

    const newClasse: Classe = {
      ...source,
      id: `cls-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      nom: newNom,
      groupe: nextGroup,
      salle: `${source.salle.replace(/\d+$/, '')}${parseInt(source.salle.match(/\d+$/)?.[0] || '1', 10) + 1}`,
      description: `Groupe dédoublé depuis ${source.nom}`,
    };

    setClasses(prev => [...prev, newClasse]);
    return newClasse;
  };

  const updateClasse = (updated: Classe) => {
    setClasses(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteClasse = (classeId: string) => {
    setClasses(prev => prev.filter(c => c.id !== classeId));
  };

  // Actions: Eleves
  const addEleve = (data: Omit<Eleve, 'id' | 'matricule' | 'paiements' | 'notes' | 'presences'>): Eleve => {
    const id = `std-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const nextNum = eleves.length + 1;
    const targetClass = classes.find(c => c.id === data.classeId);
    const prefix = targetClass ? targetClass.nom.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : 'EFA';
    const matricule = `EFA-${prefix}-${String(nextNum).padStart(3, '0')}`;
    const session = data.session || (targetClass ? resolveClasseSession(targetClass) : 'college');

    const newEleve: Eleve = {
      ...data,
      id,
      matricule,
      session,
      paiements: [],
      notes: [],
      presences: [
        { date: new Date().toISOString().split('T')[0], statut: 'Présent', justifie: true }
      ],
      dateInscription: new Date().toISOString().split('T')[0],
    };

    setEleves(prev => [newEleve, ...prev]);
    return newEleve;
  };

  const updateEleve = (updated: Eleve) => {
    setEleves(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const deleteEleve = (eleveId: string) => {
    setEleves(prev => prev.filter(e => e.id !== eleveId));
  };

  // Actions: Paiements
  const addPaiement = (eleveId: string, data: Omit<Paiement, 'id' | 'eleveId' | 'numeroRecu'>): Paiement => {
    const targetEleve = eleves.find(e => e.id === eleveId);
    const session = data.session || (targetEleve ? resolveEleveSession(targetEleve) : undefined);
    const recuNum = `REC-2025-${String(Math.floor(1000 + Math.random() * 9000))}`;
    
    const newPaiement: Paiement = {
      ...data,
      id: `pay-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      eleveId,
      session,
      numeroRecu: recuNum,
    };

    setEleves(prev => prev.map(el => {
      if (el.id === eleveId) {
        const updatedMontant = (el.montantPaye || 0) + data.montant;
        return {
          ...el,
          montantPaye: updatedMontant,
          paiements: [newPaiement, ...el.paiements],
        };
      }
      return el;
    }));

    return newPaiement;
  };

  // Actions: Depenses
  const addDepense = (data: Omit<Depense, 'id'>): Depense => {
    const newDepense: Depense = {
      ...data,
      id: `dep-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setDepenses(prev => [newDepense, ...prev]);
    return newDepense;
  };

  const deleteDepense = (id: string) => {
    setDepenses(prev => prev.filter(d => d.id !== id));
  };

  // Actions: Enseignants
  const addEnseignant = (data: Omit<Enseignant, 'id'>): Enseignant => {
    const newEnseignant: Enseignant = {
      ...data,
      id: `ens-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setEnseignants(prev => [...prev, newEnseignant]);
    return newEnseignant;
  };

  const updateEnseignant = (ens: Enseignant) => {
    setEnseignants(prev => prev.map(e => e.id === ens.id ? ens : e));
  };

  const deleteEnseignant = (id: string) => {
    setEnseignants(prev => prev.filter(e => e.id !== id));
  };

  // Actions: Communication
  const logWhatsAppMessage = (msg: Omit<MessageWhatsApp, 'id' | 'date' | 'statut'>): MessageWhatsApp => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newMsg: MessageWhatsApp = {
      ...msg,
      id: `msg-${Date.now().toString(36)}`,
      date: formattedDate,
      statut: 'Délivré',
    };

    setMessages(prev => [newMsg, ...prev]);
    return newMsg;
  };

  // Actions: Parametres
  const updateParametres = (params: ParametresEcole) => {
    setParametres(params);
  };

  const resetToDemoData = () => {
    setClasses(initialClasses);
    setEleves(initialEleves);
    setDepenses(initialDepenses);
    setEnseignants(initialEnseignants);
    setMessages(initialMessages);
    setParametres(initialParametres);
    setConfig(DEFAULT_EFA_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.ELEVES);
    localStorage.removeItem(STORAGE_KEYS.DEPENSES);
    localStorage.removeItem(STORAGE_KEYS.ENSEIGNANTS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.PARAMETRES);
    localStorage.removeItem('efa_config');
  };

  return (
    <SchoolContext.Provider
      value={{
        classes,
        eleves,
        depenses,
        enseignants,
        messages,
        parametres,
        config,
        currentEtablissement,
        selectedSession,
        appelsJour,
        theme,
        toggleTheme,
        supabaseStatus,
        refreshSupabase,
        totalEleves,
        totalClasses,
        totalScolariteFacturee,
        totalRecettes,
        totalImpayes,
        totalDepenses,
        beneficeNet,
        tauxRecouvrement,
        elevesEnRetard,
        classesSurchargees,
        sessionMetrics,
        cyclesGroupedSummary,
        getElevesBySession,
        getClassesBySession,
        getDepensesBySession,
        getAppelsBySession,
        isCyclePurchased,
        getElevesForUser,
        getClassesForUser,
        setSelectedSession,
        setCurrentEtablissement,
        updateConfig,
        saveAppelJour,
        cahiersTexte,
        addCahierTexte,
        validerCahierTexte,
        incidentsDiscipline,
        addIncidentDiscipline,
        validerSanctionProviseur,
        absencesProfs,
        signalerAbsenceProf,
        assignerRemplacementProf,
        addClasse,
        duplicateClasseGroup,
        updateClasse,
        deleteClasse,
        addEleve,
        updateEleve,
        deleteEleve,
        addPaiement,
        addDepense,
        deleteDepense,
        addEnseignant,
        updateEnseignant,
        deleteEnseignant,
        logWhatsAppMessage,
        updateParametres,
        resetToDemoData,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
