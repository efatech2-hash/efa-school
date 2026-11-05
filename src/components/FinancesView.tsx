import React, { useState } from 'react';
import { 
  Wallet, DollarSign, Download, CreditCard, 
  Search, CheckCircle, AlertTriangle, ArrowDownRight, 
  ArrowUpRight, Percent, Filter
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { Classe, Eleve, StatutPaiement } from '../types';
import { formatCurrency, getStatutPaiement } from '../utils/formatters';
import { UserRole } from '../types/auth';

interface FinancesViewProps {
  currentRole?: UserRole;
  onOpenNewPayment: () => void;
  onOpenPaymentForStudent: (eleveId: string) => void;
  onSelectStudent: (eleve: Eleve) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  currentRole = 'fondateur',
  onOpenNewPayment,
  onOpenPaymentForStudent,
  onSelectStudent,
}) => {
  const { 
    classes, 
    eleves, 
    totalScolariteFacturee, 
    totalRecettes, 
    totalImpayes, 
    tauxRecouvrement 
  } = useSchool();

  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedStatut, setSelectedStatut] = useState<'ALL' | StatutPaiement>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Class by class summary calculation
  const classSummaries = classes.map((c) => {
    const classStudents = eleves.filter(e => e.classeId === c.id);
    const totalAttendu = classStudents.reduce((acc, el) => acc + el.scolariteTotal, 0);
    const totalEncaisse = classStudents.reduce((acc, el) => acc + el.montantPaye, 0);
    const reste = Math.max(0, totalAttendu - totalEncaisse);
    const taux = totalAttendu > 0 ? Math.round((totalEncaisse / totalAttendu) * 100) : 0;
    return {
      classe: c,
      count: classStudents.length,
      totalAttendu,
      totalEncaisse,
      reste,
      taux,
    };
  });

  // Filtered students for financial ledger
  const filteredEleves = eleves.filter((el) => {
    const matchesClass = selectedClassId === 'ALL' || el.classeId === selectedClassId;
    const statut = getStatutPaiement(el.scolariteTotal, el.montantPaye);
    const matchesStatut = selectedStatut === 'ALL' || statut === selectedStatut;
    const matchesSearch = 
      el.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.matricule.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesClass && matchesStatut && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ["Matricule", "Nom", "Prenom", "Classe", "Scolarite_Totale", "Montant_Paye", "Reste_A_Payer", "Statut", "Telephone_Parent"];
    const rows = filteredEleves.map(el => {
      const cls = classes.find(c => c.id === el.classeId);
      const reste = el.scolariteTotal - el.montantPaye;
      const st = getStatutPaiement(el.scolariteTotal, el.montantPaye);
      return [
        el.matricule,
        el.nom,
        el.prenom,
        cls?.nom || '',
        el.scolariteTotal,
        el.montantPaye,
        reste,
        st,
        el.parent1.telephone
      ].join(";");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(";"), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EFA_Finances_Recouvrement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-heading">
            Gestion Financière & Recouvrement des Écolages
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivi en temps réel des encaissements, soldes débiteurs et états par classe
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>

          {currentRole !== 'censeur' ? (
            <button
              onClick={onOpenNewPayment}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>Encaisser un Versement</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold">
              ⚖️ Mode Lecture Seule (Censeur)
            </span>
          )}
        </div>
      </div>

      {/* Global Financial KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Total Écolage Attendu
          </span>
          <span className="text-xl font-black font-mono text-white mt-1 block">
            {formatCurrency(totalScolariteFacturee)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Facturation 90 élèves</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Total Déjà Encaissé
          </span>
          <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">
            {formatCurrency(totalRecettes)}
          </span>
          <span className="text-[10px] text-emerald-400/80 mt-1 block font-mono">En caisse & banques</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Reste à Recouvrer (Impayés)
          </span>
          <span className="text-xl font-black font-mono text-rose-400 mt-1 block">
            {formatCurrency(totalImpayes)}
          </span>
          <span className="text-[10px] text-rose-400/80 mt-1 block">Créances scolaires</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Taux Global de Recouvrement
          </span>
          <span className="text-xl font-black font-mono text-amber-400 mt-1 block">
            {tauxRecouvrement} %
          </span>
          <div className="h-1.5 w-full bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div 
              style={{ width: `${tauxRecouvrement}%` }}
              className="h-full bg-amber-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: CALCUL AUTO DU TOTAL ÉCOLAGE PAR CLASSE */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
          Répartition de la Scolarité par Classe (Calcul Automatique)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classSummaries.map((item) => (
            <div
              key={item.classe.id}
              className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-bold text-white font-heading">{item.classe.nom}</span>
                  <span className="text-[11px] text-slate-400 block">{item.count} élèves</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {item.taux}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">recouvré</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  style={{ width: `${item.taux}%` }}
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                />
              </div>

              {/* Numbers */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Encaissé</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatCurrency(item.totalEncaisse)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Reste à solder</span>
                  <span className="font-mono font-bold text-rose-400">
                    {formatCurrency(item.reste)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: TABLEAU DÉTAILLÉ DES ÉLÈVES AVEC STATUT COULEUR */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
            Grand Livre des Élèves ({filteredEleves.length})
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter class */}
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="ALL">Toutes les classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>

            {/* Filter status */}
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="ALL">Tous statuts</option>
              <option value="Soldé">Soldé (Payé)</option>
              <option value="Partiel">Partiel</option>
              <option value="Impayé">Impayé</option>
            </select>
          </div>
        </div>

        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Matricule</th>
                <th className="py-2.5 px-3">Élève</th>
                <th className="py-2.5 px-3">Classe</th>
                <th className="py-2.5 px-3 text-right">Total Écolage</th>
                <th className="py-2.5 px-3 text-right">Montant Payé</th>
                <th className="py-2.5 px-3 text-right">Reste Dû</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
                <th className="py-2.5 px-3 text-center">Versement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEleves.map((el) => {
                const cls = classes.find(c => c.id === el.classeId);
                const reste = Math.max(0, el.scolariteTotal - el.montantPaye);
                const statut = getStatutPaiement(el.scolariteTotal, el.montantPaye);

                return (
                  <tr key={el.id} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-mono text-amber-400/90 font-medium">{el.matricule}</td>
                    <td className="py-2 px-3 font-bold text-white">
                      <button
                        onClick={() => onSelectStudent(el)}
                        className="hover:text-amber-400 transition-colors text-left"
                      >
                        {el.nom} {el.prenom}
                      </button>
                    </td>
                    <td className="py-2 px-3 text-slate-300 font-medium">{cls?.nom}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">
                      {formatCurrency(el.scolariteTotal)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(el.montantPaye)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {reste > 0 ? (
                        <span className="text-rose-400">{formatCurrency(reste)}</span>
                      ) : (
                        <span className="text-slate-500">0 F</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          statut === 'Soldé'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : statut === 'Partiel'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {statut}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      {currentRole === 'censeur' ? (
                        <span className="text-[10px] text-purple-400 font-medium">Lecture seule</span>
                      ) : reste > 0 ? (
                        <button
                          onClick={() => onOpenPaymentForStudent(el.id)}
                          className="px-2 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold cursor-pointer"
                        >
                          Encaisser
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">Complet</span>
                      )}
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
