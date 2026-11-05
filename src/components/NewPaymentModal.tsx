import React, { useState } from 'react';
import { X, CreditCard, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { ModePaiement, Paiement, Eleve } from '../types';
import { formatCurrency } from '../utils/formatters';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudentId?: string;
  onPaymentSuccess?: (paiement: Paiement, eleve: Eleve) => void;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedStudentId,
  onPaymentSuccess,
}) => {
  const { eleves, classes, addPaiement } = useSchool();

  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId || '');
  const [montant, setMontant] = useState<number>(50000);
  const [motif, setMotif] = useState<Paiement['motif']>('Tranche 1');
  const [mode, setMode] = useState<ModePaiement>('Espèces');
  const [reference, setReference] = useState('');
  const [observations, setObservations] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentEleve = eleves.find(e => e.id === (selectedStudentId || preselectedStudentId));
  const currentClasse = classes.find(c => c.id === currentEleve?.classeId);
  const resteDu = currentEleve ? Math.max(0, currentEleve.scolariteTotal - currentEleve.montantPaye) : 0;

  const filteredEleves = search.trim() ? eleves.filter(e => 
    e.nom.toLowerCase().includes(search.toLowerCase()) ||
    e.prenom.toLowerCase().includes(search.toLowerCase()) ||
    e.matricule.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEleve) {
      setError('Veuillez sélectionner un élève.');
      return;
    }
    if (montant <= 0) {
      setError('Le montant doit être supérieur à 0 F CFA.');
      return;
    }

    const createdPaiement = addPaiement(currentEleve.id, {
      date: new Date().toISOString().split('T')[0],
      montant: Number(montant),
      motif,
      mode,
      reference: reference.trim() || undefined,
      recuPar: 'Caisse Centrale EFA',
      observations: observations.trim() || undefined,
    });

    onClose();

    if (onPaymentSuccess) {
      onPaymentSuccess(createdPaiement, currentEleve);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-slate-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                Encaisser un Paiement de Scolarité
              </h3>
              <p className="text-[11px] text-slate-400">
                Génération immédiate du reçu de caisse certifié
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

          {/* Student Selector */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Sélectionner l'Élève *
            </label>
            {!currentEleve ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, prénom ou matricule..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                {filteredEleves.length > 0 && (
                  <div className="border border-slate-800 rounded-lg bg-slate-950 divide-y divide-slate-800/60 max-h-40 overflow-y-auto">
                    {filteredEleves.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(e.id);
                          setSearch('');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white">{e.nom} {e.prenom}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{e.matricule}</span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-400">
                          Reste: {formatCurrency(e.scolariteTotal - e.montantPaye)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{currentEleve.nom} {currentEleve.prenom}</span>
                    <span className="px-1.5 py-0.5 rounded-sm bg-slate-800 text-[10px] text-slate-300 font-mono">
                      {currentEleve.matricule}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Classe: <strong className="text-amber-300">{currentClasse?.nom}</strong> · Scolarité: {formatCurrency(currentEleve.scolariteTotal)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Reste à payer</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {formatCurrency(resteDu)}
                  </span>
                  {!preselectedStudentId && (
                    <button
                      type="button"
                      onClick={() => setSelectedStudentId('')}
                      className="text-[10px] text-slate-400 hover:text-white underline block mt-1"
                    >
                      Changer
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Amount & Motif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Montant versé (F CFA) *
              </label>
              <input
                type="number"
                step="1000"
                min="1000"
                required
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold text-base focus:outline-hidden focus:border-emerald-500 text-emerald-400"
              />
              <div className="flex gap-1.5 mt-1.5">
                {[20000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMontant(preset)}
                    className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-sm font-mono"
                  >
                    +{preset / 1000}k
                  </button>
                ))}
                {resteDu > 0 && (
                  <button
                    type="button"
                    onClick={() => setMontant(resteDu)}
                    className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded-sm font-semibold"
                  >
                    Totalité
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Motif du versement *
              </label>
              <select
                value={motif}
                onChange={(e) => setMotif(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="Tranche 1">Tranche 1</option>
                <option value="Tranche 2">Tranche 2</option>
                <option value="Tranche 3">Tranche 3</option>
                <option value="Solde">Solde de Scolarité</option>
                <option value="Inscription">Frais d'Inscription</option>
                <option value="Cantine">Cantine Scolaire</option>
                <option value="Frais Annexe">Frais Annexes / Tenue</option>
              </select>
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Mode de règlement *
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as ModePaiement)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="Espèces">Espèces (Caisse)</option>
                <option value="MTN MoMo">MTN Mobile Money</option>
                <option value="Moov Money">Moov Money Flooz</option>
                <option value="Wave">Wave</option>
                <option value="Virement Bancaire">Virement Bancaire</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                N° Référence / Transaction
              </label>
              <input
                type="text"
                placeholder="ex: MOMO-849204 ou CHQ-0012"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Observations / Notes</label>
            <input
              type="text"
              placeholder="Facultatif (ex: Déposé par l'oncle maternel)"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
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
              disabled={!currentEleve}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
            >
              Encaisser & Émettre le Reçu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
