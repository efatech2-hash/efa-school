import React, { useState } from 'react';
import { X, TrendingDown, AlertCircle } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { CategorieDepense } from '../types';

interface NewDepenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewDepenseModal: React.FC<NewDepenseModalProps> = ({ isOpen, onClose }) => {
  const { addDepense } = useSchool();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categorie, setCategorie] = useState<CategorieDepense>('Fournitures');
  const [montant, setMontant] = useState<number>(35000);
  const [beneficiaire, setBeneficiaire] = useState('');
  const [description, setDescription] = useState('');
  const [modePaiement, setModePaiement] = useState<'Caisse' | 'Virement' | 'Chèque' | 'Mobile Money'>('Caisse');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiaire.trim() || !description.trim()) {
      setError('Veuillez spécifier le bénéficiaire et le motif de la dépense.');
      return;
    }
    if (montant <= 0) {
      setError('Le montant doit être supérieur à 0 F CFA.');
      return;
    }

    addDepense({
      date,
      categorie,
      montant: Number(montant),
      beneficiaire: beneficiaire.trim(),
      description: description.trim(),
      modePaiement,
      reference: reference.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-slate-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                Enregistrer une Dépense
              </h3>
              <p className="text-[11px] text-slate-400">
                Déduction automatique sur le bénéfice net de l'école
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
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Catégorie de Dépense *
              </label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as CategorieDepense)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500 font-medium"
              >
                <option value="Salaire Enseignants">Salaire Enseignants / Paie</option>
                <option value="Loyer">Loyer Bâtiments & Locaux</option>
                <option value="Fournitures">Fournitures Pédagogiques (Papier, Craie)</option>
                <option value="Électricité">Électricité (SBEE / CIE / Senelec)</option>
                <option value="Eau">Eau (SONEB / SODECI / SDE)</option>
                <option value="Taxes">Taxes Scolaires & Assurances</option>
                <option value="Entretien & Travaux">Entretien, Plomberie & Travaux</option>
                <option value="Autre">Autre Dépense</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Date de la dépense *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Montant décaissé (F CFA) *
              </label>
              <input
                type="number"
                step="1000"
                min="500"
                required
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-rose-400 font-mono font-bold text-base focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Bénéficiaire / Fournisseur *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Papeterie Centrale, SBEE..."
                value={beneficiaire}
                onChange={(e) => setBeneficiaire(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Description / Justification du motif *
            </label>
            <textarea
              required
              rows={2}
              placeholder="ex: Achat de 10 cartons de rames A4 pour tirages du devoir de Novembre"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Mode de Paiement *
              </label>
              <select
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="Caisse">Caisse Espèces</option>
                <option value="Mobile Money">Mobile Money (MoMo / Wave)</option>
                <option value="Virement">Virement Bancaire</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                N° Facture / Pièce Jointe
              </label>
              <input
                type="text"
                placeholder="ex: FAC-2025-084"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
              />
            </div>
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
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors cursor-pointer shadow-sm shadow-rose-600/20"
            >
              Enregistrer la Dépense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
