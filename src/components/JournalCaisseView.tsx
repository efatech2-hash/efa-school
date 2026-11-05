import React, { useState } from 'react';
import { 
  Wallet, CreditCard, TrendingDown, TrendingUp, 
  Printer, Download, Search, CheckCircle2, ArrowRight 
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Paiement, Eleve } from '../types';

interface JournalCaisseViewProps {
  onOpenReceipt: (paiement: Paiement, eleve: Eleve) => void;
  onOpenNewPayment: () => void;
}

export const JournalCaisseView: React.FC<JournalCaisseViewProps> = ({
  onOpenReceipt,
  onOpenNewPayment,
}) => {
  const { eleves, classes, depenses } = useSchool();
  const [filterMode, setFilterMode] = useState('ALL');

  // All transactions combined (recettes + depenses)
  const transactions: Array<{
    id: string;
    date: string;
    type: 'RECETTE' | 'DEPENSE';
    designation: string;
    reference: string;
    mode: string;
    montant: number;
    rawPayment?: Paiement;
    rawEleve?: Eleve;
  }> = [];

  eleves.forEach(el => {
    (el.paiements || []).forEach(p => {
      transactions.push({
        id: p.id,
        date: p.date,
        type: 'RECETTE',
        designation: `Versement ${p.motif} - ${el.nom} ${el.prenom}`,
        reference: p.numeroRecu,
        mode: p.mode,
        montant: p.montant,
        rawPayment: p,
        rawEleve: el,
      });
    });
  });

  depenses.forEach(d => {
    transactions.push({
      id: d.id,
      date: d.date,
      type: 'DEPENSE',
      designation: `Dépense: ${d.categorie} - ${d.description}`,
      reference: d.reference || d.id,
      mode: d.modePaiement,
      montant: d.montant,
    });
  });

  // Sort descending
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalEntrees = transactions
    .filter(t => t.type === 'RECETTE')
    .reduce((acc, t) => acc + t.montant, 0);

  const totalSorties = transactions
    .filter(t => t.type === 'DEPENSE')
    .reduce((acc, t) => acc + t.montant, 0);

  const soldeNetCaisse = totalEntrees - totalSorties;

  const filtered = transactions.filter(t => {
    if (filterMode === 'RECETTES') return t.type === 'RECETTE';
    if (filterMode === 'DEPENSES') return t.type === 'DEPENSE';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-heading">
            Journal Quotidien de Caisse
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Livre de caisse certifié · Suivi des flux d'entrées et de sorties d'espèces et mobile money
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Journal</span>
          </button>

          <button
            onClick={onOpenNewPayment}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>+ Encaissement</span>
          </button>
        </div>
      </div>

      {/* 3 Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Entrées Caisse</span>
          <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">
            +{formatCurrency(totalEntrees)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Scolarités & versements</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Sorties Caisse</span>
          <span className="text-xl font-black font-mono text-rose-400 mt-1 block">
            -{formatCurrency(totalSorties)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Dépenses opérationnelles</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Solde Théorique de Caisse</span>
          <span className="text-xl font-black font-mono text-[#D4AF37] mt-1 block">
            {formatCurrency(soldeNetCaisse)}
          </span>
          <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">Caisse équilibrée</span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
            Écritures de Caisse ({filtered.length})
          </h3>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold ${filterMode === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterMode('RECETTES')}
              className={`px-2.5 py-1 rounded-md font-semibold ${filterMode === 'RECETTES' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
            >
              Entrées
            </button>
            <button
              onClick={() => setFilterMode('DEPENSES')}
              className={`px-2.5 py-1 rounded-md font-semibold ${filterMode === 'DEPENSES' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
            >
              Sorties
            </button>
          </div>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type Flux</th>
                <th className="py-2.5 px-3">Désignation</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Réf / Reçu</th>
                <th className="py-2.5 px-3 text-right">Montant</th>
                <th className="py-2.5 px-3 text-center">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.type === 'RECETTE'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-medium text-white max-w-xs truncate">{t.designation}</td>
                  <td className="py-2 px-3 text-slate-300">{t.mode}</td>
                  <td className="py-2 px-3 font-mono text-amber-400/90">{t.reference}</td>
                  <td className={`py-2 px-3 text-right font-mono font-bold ${
                    t.type === 'RECETTE' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {t.type === 'RECETTE' ? '+' : '-'}{formatCurrency(t.montant)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {t.rawPayment && t.rawEleve ? (
                      <button
                        onClick={() => onOpenReceipt(t.rawPayment!, t.rawEleve!)}
                        className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[#D4AF37] text-[10px] cursor-pointer inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Reçu</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-600">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
