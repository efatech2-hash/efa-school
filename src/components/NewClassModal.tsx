import React, { useState } from 'react';
import { X, School, Plus, AlertCircle } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { Niveau, Groupe } from '../types';

interface NewClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClassModal: React.FC<NewClassModalProps> = ({ isOpen, onClose }) => {
  const { addClasse } = useSchool();

  const [niveau, setNiveau] = useState<Niveau>('CP1');
  const [groupe, setGroupe] = useState<Groupe>('A');
  const [serie, setSerie] = useState('');
  const [salle, setSalle] = useState('Bâtiment Primaire · Salle 02');
  const [effectifMax, setEffectifMax] = useState(35);
  const [scolariteAnnuelle, setScolariteAnnuelle] = useState(150000);
  const [enseignantPrincipal, setEnseignantPrincipal] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const isLycee = ['2nde', '1ere', 'Tle'].includes(niveau);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let generatedNom = `${niveau}-${groupe}`;
    if (isLycee && serie) {
      generatedNom = `${niveau} ${serie}-${groupe}`;
    }

    addClasse({
      nom: generatedNom,
      niveau,
      groupe,
      serie: isLycee && serie ? serie : undefined,
      salle,
      effectifMax: Number(effectifMax),
      scolariteAnnuelle: Number(scolariteAnnuelle),
      enseignantPrincipal: enseignantPrincipal.trim() || undefined,
      description: description.trim() || `Classe de ${niveau}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-slate-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                Créer une Nouvelle Classe
              </h3>
              <p className="text-[11px] text-slate-400">
                Définition pédagogique, salle, effectif maximal et scolarité
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Niveau Pédagogique *
              </label>
              <select
                value={niveau}
                onChange={(e) => setNiveau(e.target.value as Niveau)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500 font-semibold"
              >
                <optgroup label="Primaire & Maternelle">
                  <option value="CI1">CI 1 (Section des Petits)</option>
                  <option value="CI2">CI 2 (Maternelle)</option>
                  <option value="CP1">CP 1 (Cours Préparatoire 1)</option>
                  <option value="CP2">CP 2 (Cours Préparatoire 2)</option>
                  <option value="CE1">CE 1 (Cours Élémentaire 1)</option>
                  <option value="CE2">CE 2 (Cours Élémentaire 2)</option>
                  <option value="CM1">CM 1 (Cours Moyen 1)</option>
                  <option value="CM2">CM 2 (Cours Moyen 2 - Certificat)</option>
                </optgroup>
                <optgroup label="Collège (Premier Cycle)">
                  <option value="6e">6ème</option>
                  <option value="5e">5ème</option>
                  <option value="4e">4ème</option>
                  <option value="3e">3ème (Brevet / BEPC)</option>
                </optgroup>
                <optgroup label="Lycée (Second Cycle)">
                  <option value="2nde">Seconde</option>
                  <option value="1ere">Première</option>
                  <option value="Tle">Terminale (Baccalauréat)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Groupe / Section *
              </label>
              <select
                value={groupe}
                onChange={(e) => setGroupe(e.target.value as Groupe)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500 font-semibold"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
          </div>

          {isLycee && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Série / Filière (Lycée)
              </label>
              <select
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500 font-mono"
              >
                <option value="">-- Sans série spécifique --</option>
                <option value="D">Série D (Sciences Biologiques & Maths)</option>
                <option value="C">Série C (Mathématiques & Physiques)</option>
                <option value="A1">Série A1 (Lettres & Langues)</option>
                <option value="A2">Série A2 (Lettres & Philosophie)</option>
                <option value="B">Série B (Sciences Économiques)</option>
                <option value="G">Série G (Technique & Gestion)</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Salle de cours affectée *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Bâtiment B · Salle 04"
                value={salle}
                onChange={(e) => setSalle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Capacité Max (Élèves) *
              </label>
              <input
                type="number"
                min="10"
                max="60"
                required
                value={effectifMax}
                onChange={(e) => setEffectifMax(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Frais de Scolarité Annuelle (F CFA) *
            </label>
            <input
              type="number"
              step="5000"
              min="20000"
              required
              value={scolariteAnnuelle}
              onChange={(e) => setScolariteAnnuelle(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Enseignant Titulaire / Principal
            </label>
            <input
              type="text"
              placeholder="ex: M. KPADONOU Anselme"
              value={enseignantPrincipal}
              onChange={(e) => setEnseignantPrincipal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
            >
              Créer la Classe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
