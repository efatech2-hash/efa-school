import React, { useState } from 'react';
import { 
  BookOpen, Plus, CheckCircle2, Clock, Calendar, 
  FileText, Check, AlertCircle, Filter, Search, User 
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { UserRole, UserSession } from '../types/auth';
import { CahierTexteRecord } from '../types';

interface CahierDeTexteViewProps {
  currentRole: UserRole;
  user: UserSession;
}

export const CahierDeTexteView: React.FC<CahierDeTexteViewProps> = ({
  currentRole,
  user,
}) => {
  const { 
    classes, 
    cahiersTexte, 
    addCahierTexte, 
    validerCahierTexte,
    isCyclePurchased 
  } = useSchool();

  const [filterClasse, setFilterClasse] = useState<string>('all');
  const [filterVisa, setFilterVisa] = useState<'all' | 'pending' | 'vises'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [classeNom, setClasseNom] = useState(classes[0]?.nom || '6ème A');
  const [matiere, setMatiere] = useState('Mathématiques');
  const [titreSeance, setTitreSeance] = useState('');
  const [contenu, setContenu] = useState('');
  const [devoirs, setDevoirs] = useState('');
  const [pourLeDate, setPourLeDate] = useState('');

  const canAdd = currentRole === 'professeur' || currentRole === 'censeur' || currentRole === 'fondateur';
  const canVisa = currentRole === 'censeur' || currentRole === 'fondateur';

  // Filter list
  const filteredRecords = cahiersTexte.filter(rec => {
    // Cycle filtering: if user has a specific cycle
    if (user.cycle_id !== 'all' && rec.cycle_id !== user.cycle_id) {
      return false;
    }
    // Filter by class
    if (filterClasse !== 'all' && rec.classeNom !== filterClasse) {
      return false;
    }
    // Filter by visa status
    if (filterVisa === 'pending' && rec.valideParCenseur) return false;
    if (filterVisa === 'vises' && !rec.valideParCenseur) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titreSeance || !contenu) return;

    const targetClass = classes.find(c => c.nom === classeNom);
    const cycle = targetClass?.session || user.cycle_id;

    addCahierTexte({
      date: new Date().toISOString().split('T')[0],
      classeNom,
      matiere,
      professeurNom: user.nom,
      cycle_id: cycle === 'all' ? 'college' : cycle,
      titreSeance,
      contenu,
      devoirs: devoirs || undefined,
      pourLeDate: pourLeDate || undefined,
      valideParCenseur: false,
    });

    setIsModalOpen(false);
    setTitreSeance('');
    setContenu('');
    setDevoirs('');
    setPourLeDate('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Cahier de Texte Numérique Homologué
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Cycle : {user.cycle_id.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Registre des Cours & Devoirs Donnés
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Traçabilité des séances enseignées, chapitres abordés, exercices prescrits et visa de contrôle pédagogique du Censeur.
          </p>
        </div>

        {canAdd && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>+ Enregistrer une Séance</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-600 dark:text-slate-400">Filtrer par classe :</span>
          <select
            value={filterClasse}
            onChange={(e) => setFilterClasse(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 font-bold text-slate-900 dark:text-white"
          >
            <option value="all">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.nom}>{c.nom}</option>
            ))}
          </select>

          <span className="font-bold text-slate-600 dark:text-slate-400 ml-2">Statut Visa :</span>
          <select
            value={filterVisa}
            onChange={(e) => setFilterVisa(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 font-bold text-slate-900 dark:text-white"
          >
            <option value="all">Tous ({cahiersTexte.length})</option>
            <option value="pending">En attente de visa ({cahiersTexte.filter(c => !c.valideParCenseur).length})</option>
            <option value="vises">Visés par le Censeur ({cahiersTexte.filter(c => c.valideParCenseur).length})</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-slate-500">
          {filteredRecords.length} séances affichées
        </span>
      </div>

      {/* List of Cahier de Texte Entries */}
      <div className="space-y-4">
        {filteredRecords.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-slate-400 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-800 dark:text-[#D4AF37] border border-amber-500/30 font-black text-xs">
                  {item.classeNom}
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {item.matiere}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  par {item.professeurNom}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500">
                  Séance du {item.date}
                </span>
                {item.valideParCenseur ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Visé le {item.visaDate}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 font-bold text-[11px] border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    En attente visa
                  </span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {item.titreSeance}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {item.contenu}
              </p>
            </div>

            {item.devoirs && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs flex items-start gap-2">
                <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-slate-800 dark:text-white block">Devoir à faire à la maison :</span>
                  <p className="text-slate-600 dark:text-slate-400">{item.devoirs}</p>
                </div>
                {item.pourLeDate && (
                  <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold shrink-0">
                    Pour le : {item.pourLeDate}
                  </span>
                )}
              </div>
            )}

            {/* Censeur Visa Action Button */}
            {canVisa && !item.valideParCenseur && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => validerCahierTexte(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apposer le Visa de Censure</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredRecords.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            Aucune séance enregistrée pour les filtres sélectionnés.
          </div>
        )}
      </div>

      {/* Modal Saisie Séance */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enregistrer une Séance au Cahier de Texte
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Classe</label>
                  <select
                    value={classeNom}
                    onChange={(e) => setClasseNom(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.nom}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Matière</label>
                  <input
                    type="text"
                    value={matiere}
                    onChange={(e) => setMatiere(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Titre de la Séance / Chapitre</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Les équations du second degré..."
                  value={titreSeance}
                  onChange={(e) => setTitreSeance(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Contenu Pédagogique Enseigné</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Points clés abordés, théorèmes démontrés, exercices résolus..."
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Devoirs à faire (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Exercices 1, 2, 3 page..."
                    value={devoirs}
                    onChange={(e) => setDevoirs(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Pour le</label>
                  <input
                    type="date"
                    value={pourLeDate}
                    onChange={(e) => setPourLeDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Valider la Séance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
