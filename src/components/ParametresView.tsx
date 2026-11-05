import React, { useState, useRef } from 'react';
import { 
  Settings, School, ShieldCheck, RotateCcw, 
  Save, Download, CheckCircle2, UserCheck, 
  MapPin, Phone, Mail, Award, AlertTriangle,
  Database, RefreshCw, ExternalLink, ShieldAlert,
  Upload, X, Image as ImageIcon
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { ParametresEcole } from '../types';
import { testSupabaseConnection } from '../lib/supabase';

export const ParametresView: React.FC = () => {
  const { parametres, updateParametres, resetToDemoData, supabaseStatus, refreshSupabase, config, updateConfig } = useSchool();
  const [formData, setFormData] = useState<ParametresEcole>(parametres);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [testResult, setTestResult] = useState<{ testing: boolean; message?: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image valide (PNG ou JPG).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 3 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        updateConfig({
          ...config,
          logoEcole: event.target.result,
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    updateConfig({
      ...config,
      logoEcole: undefined,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParametres(formData);
    updateConfig({
      ...config,
      ecole: formData.nom,
      ville: formData.ville,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      parametres: formData,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `EFA_SCHOOL_Config_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-heading">
            Configuration Générale & Identité de l'Établissement
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            EFA SCHOOL by EFA TECHNOLOGIE · Système de Gestion Scolaire Intégré
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter Sauvegarde</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">Paramètres de l'école mis à jour avec succès !</span>
        </div>
      )}

      {/* Supabase PostgreSQL V2 Status Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Base de Données Supabase V2</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PostgreSQL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Synchronisation des tables users, eleves, notes et finance avec filtrage par cycle_id
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                setTestResult({ testing: true });
                const res = await testSupabaseConnection();
                setTestResult({ testing: false, message: res.message });
                await refreshSupabase();
              }}
              disabled={testResult?.testing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testResult?.testing ? 'animate-spin' : ''}`} />
              <span>{testResult?.testing ? 'Test en cours...' : 'Tester Requête users'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Statut Client</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${supabaseStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-semibold text-slate-200 truncate">{supabaseStatus.message}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Architecture V2</span>
            <span className="font-mono text-amber-400 font-semibold block truncate">
              cycle_id (primaire, college, lycee, all)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Schéma SQL</span>
            <span className="font-mono text-slate-300 block truncate">
              supabase/schema.sql (prêt à déployer)
            </span>
          </div>
        </div>

        {testResult?.message && (
          <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
            <span className="font-mono">Résultat test : {testResult.message}</span>
            <span className="text-[10px] text-slate-500">Testé à {new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6 text-xs">
        
        {/* Section 1: Établissement */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-2">
            <School className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Identité Officielle</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nom de l'Établissement Scolaire *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-semibold focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Devise ou Slogan Pédagogique</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500 italic"
              />
            </div>
          </div>

          {/* Logo Officiel de l'Établissement */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-200 font-bold mb-0.5">Logo Officiel de l'Établissement</label>
                <p className="text-[11px] text-slate-400">
                  Affiché sur l'en-tête de l'application, les bulletins trimestriels et les reçus officiels de caisse.
                </p>
              </div>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
              />
            </div>

            {config?.logoEcole ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <img
                    src={config.logoEcole}
                    alt="Logo Établissement"
                    className="w-12 h-12 rounded-lg object-contain bg-white dark:bg-slate-800 p-1 border border-amber-500/40"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Logo personnalisé actif</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Visible sur reçus et bulletins officiels</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                  >
                    Remplacer
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center justify-between p-3 rounded-lg border border-dashed border-slate-700 hover:border-amber-500 bg-slate-900/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors block">
                      Téléverser votre logo officiel (PNG / JPG)
                    </span>
                    <span className="text-[10px] text-slate-400">Recommandé : image carrée ou ronde sur fond transparent</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                >
                  Choisir
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Année Scolaire en cours *</label>
              <input
                type="text"
                required
                placeholder="2025 - 2026"
                value={formData.anneeScolaire}
                onChange={(e) => setFormData({ ...formData, anneeScolaire: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Devise Monétaire *</label>
              <input
                type="text"
                required
                value={formData.deviseMonetaire}
                onChange={(e) => setFormData({ ...formData, deviseMonetaire: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Délai Alerte Retard (Jours)</label>
              <input
                type="number"
                value={formData.tauxRelanceAlerteJours}
                onChange={(e) => setFormData({ ...formData, tauxRelanceAlerteJours: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Direction & EFA TECHNOLOGIE */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-2">
            <Award className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Direction & Fondateur</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Directeur de l'Établissement *</label>
              <input
                type="text"
                required
                value={formData.directeur}
                onChange={(e) => setFormData({ ...formData, directeur: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-semibold focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Promoteur Technologique</label>
              <input
                type="text"
                disabled
                value="EFA TECHNOLOGIE · Lomé, Togo"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Coordonnées & Localisation */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-2">
            <MapPin className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Coordonnées Géographiques & Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Ville</label>
              <input
                type="text"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Pays</label>
              <input
                type="text"
                value={formData.pays}
                onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Téléphone de l'École</label>
              <input
                type="text"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Officiel</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
          >
            Enregistrer les Modifications
          </button>
        </div>
      </form>

      {/* Section: Zone de Réinitialisation des Données Démo */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Réinitialiser les Données Démo
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Cette action recharge les données d'origine conformes au cahier des charges : les <strong>3 classes (CP1-A 25 élèves, CE2-B 30 élèves, Tle D 35 élèves = 90 élèves au total)</strong>, les dépenses réelles et les enseignants.
        </p>

        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser aux 90 Élèves Démo</span>
          </button>
        ) : (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs space-y-3">
            <span className="font-bold text-rose-300 block">
              Confirmez-vous la réinitialisation complète des données ?
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetToDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
              >
                Oui, réinitialiser
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
