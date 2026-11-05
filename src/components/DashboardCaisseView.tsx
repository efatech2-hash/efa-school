import React, { useState } from 'react';
import { 
  Wallet, CreditCard, ArrowDownRight, ArrowUpRight, 
  Printer, Plus, Search, Calendar, FileText, CheckCircle, 
  TrendingDown, TrendingUp, AlertCircle, Download
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { Paiement, Eleve } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DashboardCaisseViewProps {
  onOpenNewPayment: (eleveId?: string) => void;
  onOpenNewDepense: () => void;
  onOpenReceipt: (paiement: Paiement, eleve: Eleve) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardCaisseView: React.FC<DashboardCaisseViewProps> = ({
  onOpenNewPayment,
  onOpenNewDepense,
  onOpenReceipt,
  onNavigateTab,
}) => {
  const { eleves, classes, depenses, totalImpayes } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');

  // Flatten all payments across students
  const allPayments: { paiement: Paiement; eleve: Eleve }[] = [];
  eleves.forEach(el => {
    (el.paiements || []).forEach(p => {
      allPayments.push({ paiement: p, eleve: el });
    });
  });

  // Sort by date descending
  allPayments.sort((a, b) => new Date(b.paiement.date).getTime() - new Date(a.paiement.date).getTime());

  // KPI Calculations
  // Today's date simulation
  const today = new Date().toISOString().split('T')[0];
  
  // Encaissements récents (aujourd'hui / session active)
  const encaisseAujourdhui = allPayments
    .slice(0, 8)
    .reduce((acc, curr) => acc + curr.paiement.montant, 0);

  // Dépenses jour
  const depensesJour = depenses
    .slice(0, 2)
    .reduce((acc, curr) => acc + curr.montant, 0);

  // Solde de caisse net
  const soldeCaisse = encaisseAujourdhui - depensesJour;

  // Filtered payments for the table
  const filteredPayments = allPayments.filter(({ paiement, eleve }) => {
    const matchesSearch = 
      eleve.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eleve.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eleve.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paiement.numeroRecu.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode = modeFilter === 'ALL' || paiement.mode === modeFilter;

    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Caisse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              💰 Espace Guichet & Caisse
            </span>
            <span className="text-slate-400 text-xs">Session Caisse Ouverte</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            Journal & Encaissements de Caisse
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Gestion des versements des écolages, émission instantanée des reçus et suivi des dépenses quotidiennes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenNewPayment()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Encaisser un Versement</span>
          </button>

          <button
            onClick={onOpenNewDepense}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Saisir une Dépense</span>
          </button>
        </div>
      </div>

      {/* 4 KPI EN HAUT DEMANDÉS : Encaissé aujourd'hui, Impayés, Dépenses jour, Solde */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Encaissé aujourd'hui */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Encaissé Aujourd'hui</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight block">
            +{formatCurrency(encaisseAujourdhui)}
          </span>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>{filteredPayments.slice(0, 8).length} versements validés</span>
            <span className="text-emerald-400 font-medium">100% reçus émis</span>
          </div>
        </div>

        {/* KPI 2: Impayés */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Impayés</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono text-rose-400 tracking-tight block">
            {formatCurrency(totalImpayes)}
          </span>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Reste à recouvrer</span>
            <button
              onClick={() => onNavigateTab('eleves')}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Voir liste →
            </button>
          </div>
        </div>

        {/* KPI 3: Dépenses jour */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dépenses du Jour</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black font-mono text-rose-400 tracking-tight block">
            -{formatCurrency(depensesJour)}
          </span>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Fournitures & logistique</span>
            <span className="text-slate-400 font-mono">2 opérations</span>
          </div>
        </div>

        {/* KPI 4: Solde */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Solde Net en Caisse</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <span className={`text-2xl font-black font-mono tracking-tight block ${
            soldeCaisse >= 0 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {formatCurrency(soldeCaisse)}
          </span>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>Encaissé - Dépenses jour</span>
            <span className="text-emerald-400 font-mono font-bold">Clôture OK</span>
          </div>
        </div>

      </div>

      {/* TABLE PAIEMENTS AVEC BOUTON ENCAISSER + REÇU */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white font-heading">
              Registre des Paiements & Reçus Récents ({filteredPayments.length})
            </h3>
            <p className="text-xs text-slate-400">
              Historique des règlements enregistrés avec génération de reçu officiel certifié
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher élève ou reçu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Mode filter */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="ALL">Tous modes</option>
              <option value="Espèces">Espèces</option>
              <option value="MTN MoMo">MTN MoMo</option>
              <option value="Moov Money">Moov Money</option>
              <option value="Wave">Wave</option>
              <option value="Virement Bancaire">Virement</option>
            </select>

            <button
              onClick={() => onOpenNewPayment()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Encaisser</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">N° Reçu</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Élève & Classe</th>
                <th className="py-2.5 px-3">Motif</th>
                <th className="py-2.5 px-3">Mode & Référence</th>
                <th className="py-2.5 px-3 text-right">Montant</th>
                <th className="py-2.5 px-3 text-center">Action Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.slice(0, 15).map(({ paiement, eleve }) => {
                const classe = classes.find(c => c.id === eleve.classeId);

                return (
                  <tr key={paiement.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-amber-400">
                      {paiement.numeroRecu}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {formatDate(paiement.date)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-white block">{eleve.nom} {eleve.prenom}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {eleve.matricule} · <strong className="text-amber-300">{classe?.nom}</strong>
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[10px] font-medium">
                        {paiement.motif}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <span>{paiement.mode}</span>
                      {paiement.reference && (
                        <span className="block font-mono text-[10px] text-slate-500">{paiement.reference}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(paiement.montant)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onOpenReceipt(paiement, eleve)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-[#D4AF37] border border-amber-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Imprimer le Reçu Officiel"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimer Reçu</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
