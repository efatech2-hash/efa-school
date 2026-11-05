import React, { useState, useRef } from 'react';
import { 
  Building2, MapPin, CheckCircle2, ChevronRight, School, 
  Sparkles, Layers, ShieldCheck, Plus, Trash2, ArrowLeft,
  Image as ImageIcon, Upload, X
} from 'lucide-react';
import { 
  EfaConfig, SessionKey, ALL_SESSIONS, DEFAULT_CLASSES_PRIMAIRE, 
  DEFAULT_CLASSES_COLLEGE, ALL_SERIES_LYCEE 
} from '../types/config';
import { useSchool } from '../context/SchoolContext';

interface OnboardingViewProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onCancel }) => {
  const { config, updateConfig, updateParametres, parametres } = useSchool();

  // State
  const [ecole, setEcole] = useState(config.ecole || "Complexe Scolaire EFA Excellence");
  const [ville, setVille] = useState(config.ville || "Lomé");
  const [logoEcole, setLogoEcole] = useState<string | undefined>(config.logoEcole);
  const [sessions, setSessions] = useState<SessionKey[]>(config.sessions || ['primaire', 'college', 'lycee']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Primaire
  const [selectedPrimaireClasses, setSelectedPrimaireClasses] = useState<string[]>(
    config.classesPrimaire && config.classesPrimaire.length > 0 
      ? config.classesPrimaire 
      : ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2']
  );
  const [groupesPrimaire, setGroupesPrimaire] = useState<'A' | 'AB' | 'ABC'>('AB');

  // Collège
  const [selectedCollegeClasses, setSelectedCollegeClasses] = useState<string[]>(
    config.classesCollege && config.classesCollege.length > 0
      ? config.classesCollege
      : ['6ème', '5ème', '4ème', '3ème']
  );
  const [groupesCollege, setGroupesCollege] = useState<'A' | 'AB' | 'ABC'>('AB');

  // Lycée: 2nde, 1ère, Tle
  const [lycee2ndeSeries, setLycee2ndeSeries] = useState<string[]>(['A4', 'C']);
  const [lycee1ereSeries, setLycee1ereSeries] = useState<string[]>(['A4', 'D']);
  const [lyceeTleSeries, setLyceeTleSeries] = useState<string[]>(['A4', 'D']);

  // Multi-Etablissements (Max 3)
  const [etablissements, setEtablissements] = useState<string[]>(
    config.etablissements && config.etablissements.length > 0
      ? config.etablissements
      : ["Complexe Scolaire EFA Excellence - Siège (Lomé)"]
  );
  const [newEtablissementName, setNewEtablissementName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Toggle sessions
  const toggleSession = (key: SessionKey) => {
    setErrorMsg(null);
    if (sessions.includes(key)) {
      if (sessions.length === 1) {
        setErrorMsg("Votre établissement doit comporter au moins 1 cycle actif !");
        return;
      }
      setSessions(prev => prev.filter(s => s !== key));
    } else {
      setSessions(prev => [...prev, key]);
    }
  };

  // Toggle single item in list
  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      if (list.length === 1) return; // Keep at least one
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Multi-etablissements helpers
  const handleAddEtablissement = () => {
    if (!newEtablissementName.trim()) return;
    if (etablissements.length >= 3) {
      setErrorMsg("Limite atteinte : 3 campus / établissements maximum pour cette licence");
      return;
    }
    setEtablissements([...etablissements, newEtablissementName.trim()]);
    setNewEtablissementName('');
  };

  const handleRemoveEtablissement = (index: number) => {
    if (etablissements.length === 1) return;
    setEtablissements(etablissements.filter((_, i) => i !== index));
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg("Veuillez sélectionner un fichier image valide (PNG ou JPG).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg("L'image ne doit pas dépasser 3 Mo.");
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setLogoEcole(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!ecole.trim() || !ville.trim()) {
      setErrorMsg("Veuillez renseigner le nom de l'établissement et la ville.");
      return;
    }

    if (sessions.length === 0) {
      setErrorMsg("Sélectionnez au moins une session active.");
      return;
    }

    // Format final config
    const finalConfig: EfaConfig = {
      ecole: ecole.trim(),
      ville: ville.trim(),
      sessions,
      classesPrimaire: selectedPrimaireClasses,
      classesCollege: selectedCollegeClasses,
      niveauxLycee: [
        { niveau: '2nde', series: lycee2ndeSeries },
        { niveau: '1ère', series: lycee1ereSeries },
        { niveau: 'Tle', series: lyceeTleSeries },
      ],
      etablissements,
      currentEtablissement: etablissements[0] || ecole.trim(),
      dateConfigured: new Date().toISOString(),
      logoEcole,
      subscription_tier: config.subscription_tier || 'pro',
    };

    updateConfig(finalConfig);

    // Update school parameters
    updateParametres({
      ...parametres,
      nom: ecole.trim(),
      ville: ville.trim(),
    });

    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn py-4">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#1e293b] text-white p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 p-2 shrink-0 flex items-center justify-center shadow-lg">
              <img 
                src="/logo-efa.png" 
                alt="EFA SCHOOL" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Assistant de Configuration Établissement
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Configure ton Établissement
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                EFA SCHOOL s'adapte à votre structure : cycles, classes et séries africaines
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: General Info */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
            1
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Identité de l'Établissement</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Nom officiel apparaissant sur les reçus, bulletins et attestations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Nom de l'École / Complexe Scolaire
            </label>
            <div className="relative">
              <Building2 className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={ecole}
                onChange={e => setEcole(e.target.value)}
                placeholder="Ex: Complexe Scolaire EFA Excellence"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Ville & Pays
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={ville}
                onChange={e => setVille(e.target.value)}
                placeholder="Ex: Lomé (Togo) ou Cotonou (Bénin)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload Field */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Logo Officiel de l'Établissement (PNG / JPG)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoFileChange}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
          />

          {logoEcole ? (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-4">
                <img
                  src={logoEcole}
                  alt="Logo École"
                  className="w-14 h-14 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 border border-amber-500/40 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Logo officiel chargé</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      Actif
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Sera imprimé en tête de vos bulletins trimestriels et reçus de caisse.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Changer
                </button>
                <button
                  type="button"
                  onClick={() => setLogoEcole(undefined)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                  title="Supprimer le logo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 bg-slate-50/50 dark:bg-slate-800/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    Cliquez pour téléverser le logo de votre école
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Format PNG ou JPG recommandé (max 3 Mo) · Apparaîtra sur l'en-tête, reçus et bulletins
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                Parcourir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STEP 2: Sessions Activation */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
            2
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cycles Scolaires Pris en Charge</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cochez les cycles actifs (au moins 1 obligatoire)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ALL_SESSIONS.map(sess => {
            const isSelected = sessions.includes(sess.key);
            return (
              <button
                key={sess.key}
                type="button"
                onClick={() => toggleSession(sess.key)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#0F172A] text-white border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{sess.icon}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'border border-slate-300 dark:border-slate-600 text-transparent'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-black text-base leading-tight mb-1">{sess.label}</h3>
                <p className={`text-xs leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {sess.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 3: Dynamic Class Configuration */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
            3
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Classes & Niveaux Détaillés</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Activez précisément les classes que votre école accueille cette rentrée</p>
          </div>
        </div>

        {/* 3A: PRIMAIRE */}
        {sessions.includes('primaire') && (
          <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎒</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Classes du Cours Primaire</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Groupes auto :</span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  Sections A & B
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {DEFAULT_CLASSES_PRIMAIRE.map(cls => {
                const active = selectedPrimaireClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleItem(selectedPrimaireClasses, setSelectedPrimaireClasses, cls)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      active
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {active ? '✓ ' : ''}{cls}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 italic">
              Note : Au primaire, 1 maître = 1 classe toute l'année. Les maîtres ont accès uniquement à la feuille d'appel et leur liste d'élèves.
            </p>
          </div>
        )}

        {/* 3B: COLLÈGE */}
        {sessions.includes('college') && (
          <div className="p-5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📘</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Classes du Collège</h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold">
                Préparation BEPC
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {DEFAULT_CLASSES_COLLEGE.map(cls => {
                const active = selectedCollegeClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleItem(selectedCollegeClasses, setSelectedCollegeClasses, cls)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      active
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md font-black'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {active ? '✓ ' : ''}{cls} (A, B)
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3C: LYCÉE AVEC SÉRIES AFRICAINES */}
        {sessions.includes('lycee') && (
          <div className="p-5 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Lycée & Séries Nationales Africaines</h3>
                <p className="text-xs text-slate-500">Cochez les séries ouvertes dans votre établissement</p>
              </div>
            </div>

            {/* 2nde */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Classe de Seconde (2nde)
              </span>
              <div className="flex flex-wrap gap-2">
                {['A4', 'C', 'G1', 'G2', 'F1', 'F2', 'F3', 'F4'].map(serie => {
                  const active = lycee2ndeSeries.includes(serie);
                  return (
                    <button
                      key={`2nde-${serie}`}
                      type="button"
                      onClick={() => toggleItem(lycee2ndeSeries, setLycee2ndeSeries, serie)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                        active ? 'bg-purple-600 text-white border-purple-500 font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {active ? '✓ ' : ''}2nde {serie}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1ère */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Classe de Première (1ère)
              </span>
              <div className="flex flex-wrap gap-2">
                {ALL_SERIES_LYCEE.map(serie => {
                  const active = lycee1ereSeries.includes(serie);
                  return (
                    <button
                      key={`1ere-${serie}`}
                      type="button"
                      onClick={() => toggleItem(lycee1ereSeries, setLycee1ereSeries, serie)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                        active ? 'bg-purple-600 text-white border-purple-500 font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {active ? '✓ ' : ''}1ère {serie}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terminale */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Classe de Terminale (Tle - Baccalauréat)
              </span>
              <div className="flex flex-wrap gap-2">
                {ALL_SERIES_LYCEE.map(serie => {
                  const active = lyceeTleSeries.includes(serie);
                  return (
                    <button
                      key={`tle-${serie}`}
                      type="button"
                      onClick={() => toggleItem(lyceeTleSeries, setLyceeTleSeries, serie)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                        active ? 'bg-purple-600 text-white border-purple-500 font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {active ? '✓ ' : ''}Tle {serie}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 4: Multi-Établissements (Max 3) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
            4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Campus & Annexes</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                Max 3 établissements
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gérez plusieurs sites scolaires sous le même compte Fondateur</p>
          </div>
        </div>

        <div className="space-y-3">
          {etablissements.map((etab, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <School className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{etab}</span>
                {idx === 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                    Siège Principal
                  </span>
                )}
              </div>
              {etablissements.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveEtablissement(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {etablissements.length < 3 && (
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newEtablissementName}
                onChange={e => setNewEtablissementName(e.target.value)}
                placeholder="Ex: Campus Annexe B - Adidogomé"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                onKeyDown={e => { if (e.key === 'Enter') handleAddEtablissement(); }}
              />
              <button
                type="button"
                onClick={handleAddEtablissement}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ajouter Campus
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Validate & Submit button */}
      <div className="flex justify-end pt-4 pb-12">
        <button
          type="button"
          onClick={handleSave}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 transition-all cursor-pointer transform active:scale-95"
        >
          <span>Enregistrer & Activer Mon Établissement</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
