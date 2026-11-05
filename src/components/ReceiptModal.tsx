import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Download, Share2 } from 'lucide-react';
import { Paiement, Eleve, Classe } from '../types';
import { useSchool } from '../context/SchoolContext';
import { formatCurrency, formatDate, numberToFrenchWords } from '../utils/formatters';

interface ReceiptModalProps {
  paiement: Paiement | null;
  eleve: Eleve | null;
  classe: Classe | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  paiement,
  eleve,
  classe,
  onClose,
}) => {
  const { parametres, config } = useSchool();

  if (!paiement || !eleve) return null;

  const handlePrint = () => {
    window.print();
  };

  const resteApres = Math.max(0, (eleve.scolariteTotal || 0) - (eleve.montantPaye || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Top Action Bar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Reçu Officiel de Caisse
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 font-sans">
          
          {/* Header with School Crest & Info */}
          <div className="flex items-start justify-between border-b border-slate-300 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-2">
                <img
                  src={config?.logoEcole || "/logo-efa.png"}
                  alt={parametres.nom}
                  className="w-16 h-16 object-contain shrink-0 rounded-lg p-0.5 border border-slate-200"
                />
                {config?.logoEcole && (
                  <img
                    src="/logo-efa.png"
                    alt="EFA SCHOOL"
                    className="w-8 h-8 object-contain shrink-0 opacity-80"
                    title="Propulsé par EFA SCHOOL"
                  />
                )}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                  {parametres.nom}
                </h2>
                <p className="text-xs text-amber-700 font-semibold italic">
                  « {parametres.slogan} »
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {parametres.adresse} · {parametres.ville}, {parametres.pays} · Tél: {parametres.telephone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-slate-100 border border-slate-300 px-3 py-1 rounded-md">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">N° Reçu</span>
                <span className="text-sm font-mono font-bold text-slate-900">{paiement.numeroRecu}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">Date: {formatDate(paiement.date)}</p>
            </div>
          </div>

          {/* Student & Class Details Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Matricule</span>
              <span className="font-mono font-bold text-slate-900">{eleve.matricule}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Nom & Prénom</span>
              <span className="font-bold text-slate-900 truncate block">{eleve.nom} {eleve.prenom}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Classe</span>
              <span className="font-bold text-slate-900">{classe?.nom || 'Classe assignée'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Année Scolaire</span>
              <span className="font-bold text-slate-900">{parametres.anneeScolaire}</span>
            </div>
          </div>

          {/* Payment breakdown table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Désignation du Versement</th>
                  <th className="py-2.5 px-4">Mode de Règlement</th>
                  <th className="py-2.5 px-4">Référence</th>
                  <th className="py-2.5 px-4 text-right">Montant Encaissé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {paiement.motif} (Frais de Scolarité Annuelle)
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {paiement.mode}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {paiement.reference || 'Paiement direct caisse'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-950 text-sm">
                    {formatCurrency(paiement.montant)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in French Letters */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs">
            <span className="text-slate-600 font-medium block text-[11px]">
              Arrêté le présent reçu à la somme de :
            </span>
            <p className="font-bold text-amber-950 uppercase tracking-wide mt-0.5">
              {numberToFrenchWords(paiement.montant)}
            </p>
          </div>

          {/* Balance situation */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Total Scolarité</span>
              <span className="font-mono font-bold text-slate-800">
                {formatCurrency(eleve.scolariteTotal)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Total Payé à ce jour</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatCurrency(eleve.montantPaye)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Reste à Solder</span>
              <span className="font-mono font-bold text-rose-700">
                {formatCurrency(resteApres)}
              </span>
            </div>
          </div>

          {/* Signatures & Stamps */}
          <div className="pt-4 grid grid-cols-2 gap-8 text-xs border-t border-slate-200">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Le Déposant / Parent</p>
              <p className="text-xs font-medium text-slate-800 mt-1">{eleve.parent1.nom}</p>
              <p className="text-[10px] text-slate-500">Contact: {eleve.parent1.telephone}</p>
              <div className="h-16 mt-2 border-b border-dashed border-slate-300 flex items-end pb-1 text-[10px] text-slate-400">
                Signature du parent
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Pour la Direction & Caisse</p>
              <p className="text-xs font-bold text-slate-900 mt-1">{parametres.directeur}</p>
              <p className="text-[10px] text-slate-500">{paiement.recuPar}</p>
              
              <div className="h-16 mt-2 flex flex-col items-end justify-end">
                {/* Visual Stamp Simulation */}
                <div className="w-28 h-12 border-2 border-dashed border-amber-600 rounded-lg flex flex-col items-center justify-center rotate-[-3deg] text-[9px] font-bold text-amber-700 uppercase bg-amber-50/50">
                  <span>CAISSE EFA SCHOOL</span>
                  <span className="text-[8px] text-slate-600 font-mono">PAYÉ & CERTIFIÉ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100">
            Ce reçu certifie le paiement scolaire sous le contrôle de EFA TECHNOLOGIE · Tout paiement est non remboursable.
          </div>
        </div>
      </div>
    </div>
  );
};
