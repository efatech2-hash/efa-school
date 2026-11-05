import React, { useState } from 'react';
import { 
  FileText, Download, Printer, TrendingUp, TrendingDown, 
  Wallet, Award, CheckCircle, Calendar, School, BarChart3, Filter
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { formatCurrency, formatDate } from '../utils/formatters';

interface RapportsViewProps {
  onPrintReport?: () => void;
}

export const RapportsView: React.FC<RapportsViewProps> = () => {
  const { classes, eleves, depenses, parametres, totalRecettes, totalDepenses, totalImpayes, beneficeNet } = useSchool();
  const [selectedTrimestre, setSelectedTrimestre] = useState('Trimestre 1 (2025-2026)');
  const [activeReportType, setActiveReportType] = useState<'financier' | 'recouvrement' | 'academique'>('financier');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Recouvrement calculation per class
  const classBreakdown = classes.map(cls => {
    const classEleves = eleves.filter(e => e.classeId === cls.id);
    const totalAttendu = classEleves.reduce((acc, curr) => acc + curr.scolariteTotal, 0);
    const totalPaye = classEleves.reduce((acc, curr) => acc + curr.montantPaye, 0);
    const reste = totalAttendu - totalPaye;
    const taux = totalAttendu > 0 ? ((totalPaye / totalAttendu) * 100).toFixed(1) : '100';

    return {
      classe: cls,
      effectif: classEleves.length,
      totalAttendu,
      totalPaye,
      reste,
      taux: Number(taux),
    };
  });

  // Depense breakdown per category
  const depensesByCategory = depenses.reduce((acc, curr) => {
    acc[curr.categorie] = (acc[curr.categorie] || 0) + curr.montant;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.keys(depensesByCategory);

  const totalScolariteTheorique = eleves.reduce((acc, curr) => acc + curr.scolariteTotal, 0);
  const tauxGlobalRecouvrement = totalScolariteTheorique > 0 
    ? ((totalRecettes / totalScolariteTheorique) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              📊 États & Rapports Certifiés
            </span>
            <span className="text-slate-400 text-xs">Direction Générale & Caisse</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            Rapports Financiers & Scolaires
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Génération des bilans comptables, taux de recouvrement par classe et arrêtés périodiques.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <select
            value={selectedTrimestre}
            onChange={(e) => setSelectedTrimestre(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-hidden focus:border-amber-500"
          >
            <option value="Trimestre 1 (2025-2026)">Trimestre 1 (2025-2026)</option>
            <option value="Trimestre 2 (2025-2026)">Trimestre 2 (2025-2026)</option>
            <option value="Trimestre 3 (2025-2026)">Trimestre 3 (2025-2026)</option>
            <option value="Bilan Annuel Global">Bilan Annuel Global</option>
          </select>

          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Générer Rapport PDF Officiel</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Recettes Encaissées</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black font-mono text-emerald-400">
            {formatCurrency(totalRecettes)}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">
            {eleves.reduce((a, c) => a + (c.paiements?.length || 0), 0)} versements enregistrés
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Dépenses Engagées</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black font-mono text-rose-400">
            {formatCurrency(totalDepenses)}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">
            Salaires, logistique, électricité et fournitures
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Résultat Net d'Exploitation</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <span className={`text-2xl font-black font-mono ${beneficeNet >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
            {formatCurrency(beneficeNet)}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">
            Bénéfice opérationnel net disponible
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Taux de Recouvrement</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black font-mono text-blue-400">
            {tauxGlobalRecouvrement} %
          </span>
          <p className="text-[11px] text-slate-400 mt-2">
            Impayés restants : <strong className="text-rose-400">{formatCurrency(totalImpayes)}</strong>
          </p>
        </div>

      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveReportType('financier')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportType === 'financier'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          Bilan Recettes vs Dépenses
        </button>

        <button
          onClick={() => setActiveReportType('recouvrement')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportType === 'recouvrement'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          État de Recouvrement par Classe
        </button>

        <button
          onClick={() => setActiveReportType('academique')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportType === 'academique'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          Synthèse des Dépenses par Poste
        </button>
      </div>

      {/* TAB 1: FINANCIER & RECOUVREMENT */}
      {activeReportType === 'recouvrement' && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Recouvrement Scolaire Détaillé par Classe ({selectedTrimestre})
              </h3>
              <p className="text-xs text-slate-400">
                Suivi des montants perçus versus montants restants à payer
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
              Effectif Total : {eleves.length} élèves
            </span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Classe & Niveau</th>
                  <th className="py-2.5 px-3 text-center">Effectif</th>
                  <th className="py-2.5 px-3 text-right">Montant Attendu</th>
                  <th className="py-2.5 px-3 text-right">Montant Perçu</th>
                  <th className="py-2.5 px-3 text-right">Reste à Recouvrer</th>
                  <th className="py-2.5 px-3 text-center">Taux Réalisé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {classBreakdown.map((row) => (
                  <tr key={row.classe.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-white block">{row.classe.nom}</span>
                      <span className="text-[10px] text-slate-400">{row.classe.niveau} · {row.classe.salle}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.effectif}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatCurrency(row.totalAttendu)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">{formatCurrency(row.totalPaye)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-400">{formatCurrency(row.reste)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                        row.taux >= 80 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : row.taux >= 50 
                          ? 'bg-amber-500/20 text-amber-300' 
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {row.taux}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEPENSES PAR CATEGORIE */}
      {activeReportType === 'academique' && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Ventilation des Dépenses par Catégorie
              </h3>
              <p className="text-xs text-slate-400">
                Répartition des charges opérationnelles de l'établissement
              </p>
            </div>
            <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md">
              Total : {formatCurrency(totalDepenses)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const amount = depensesByCategory[cat];
              const pct = totalDepenses > 0 ? ((amount / totalDepenses) * 100).toFixed(1) : '0';

              return (
                <div key={cat} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs block">{cat}</span>
                    <span className="text-[11px] text-slate-400">{pct}% du budget des dépenses</span>
                  </div>
                  <span className="font-mono font-black text-rose-400 text-sm">
                    {formatCurrency(amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BILAN GLOBAL */}
      {activeReportType === 'financier' && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Compte d'Exploitation Périodique ({selectedTrimestre})
              </h3>
              <p className="text-xs text-slate-400">
                Synthèse officielle certifiée par la Direction Générale EFA TECHNOLOGIE
              </p>
            </div>
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-slate-400 text-[11px] uppercase block mb-1">A. Recettes Scolaires</span>
              <span className="text-xl font-black font-mono text-emerald-400">+{formatCurrency(totalRecettes)}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Écolages & inscriptions perçus</span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] uppercase block mb-1">B. Charges d'Exploitation</span>
              <span className="text-xl font-black font-mono text-rose-400">-{formatCurrency(totalDepenses)}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Salaires, charges, fournitures</span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] uppercase block mb-1">C. Résultat d'Exploitation Net</span>
              <span className={`text-xl font-black font-mono ${beneficeNet >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {formatCurrency(beneficeNet)}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium block mt-1">Solde Trésorerie Positif</span>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 my-6">
            
            {/* Header Document */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
              <div className="flex items-center gap-4">
                <img
                  src="/logo-efa.png"
                  alt="Logo EFA SCHOOL"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-xl font-black tracking-tight text-[#0F172A]">
                    {parametres.nom}
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold">
                    COMPLEXE SCOLAIRE INTERNATIONAL · EXCELLENCE & RIGUEUR
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {parametres.adresse} · Tél: {parametres.telephone} · Email: {parametres.email}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-bold text-amber-600 block">RAPPORT OFFICIEL</span>
                <span className="text-sm font-black text-slate-900 font-mono">DOC-EFA-{new Date().getFullYear()}-042</span>
                <span className="text-[11px] text-slate-500 block mt-1">{formatDate(new Date().toISOString())}</span>
              </div>
            </div>

            {/* Document Body */}
            <div className="py-6 space-y-5 text-xs text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Objet du document :</span>
                  <p className="font-bold text-sm text-slate-900">
                    Bilan Financier & Recouvrement Trimestriel — {selectedTrimestre}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Directeur :</span>
                  <p className="font-bold text-xs text-slate-900">{parametres.directeur}</p>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Désignation</th>
                    <th className="p-2 text-right border-r border-slate-300">Montant (FCFA)</th>
                    <th className="p-2 text-center">Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-sans font-semibold">1. Total Droits de Scolarité Encaissés</td>
                    <td className="p-2 text-right border-r border-slate-300 text-emerald-700 font-bold">{formatCurrency(totalRecettes)}</td>
                    <td className="p-2 text-center font-sans text-[11px]">Encaissé en caisse & banque</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-sans font-semibold">2. Total Dépenses & Salaires Décaissés</td>
                    <td className="p-2 text-right border-r border-slate-300 text-rose-700 font-bold">-{formatCurrency(totalDepenses)}</td>
                    <td className="p-2 text-center font-sans text-[11px]">Validé par le Promoteur</td>
                  </tr>
                  <tr className="bg-amber-50/50 font-bold">
                    <td className="p-2 border-r border-slate-300 font-sans">3. BÉNÉFICE NET D'EXPLOITATION</td>
                    <td className="p-2 text-right border-r border-slate-300 text-amber-800 text-sm">{formatCurrency(beneficeNet)}</td>
                    <td className="p-2 text-center font-sans text-emerald-700 font-bold">EXCÉDENT COMPTABLE</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="font-semibold text-slate-600 mb-12">Le Responsable Caisse & Recouvrement</p>
                  <p className="font-bold text-slate-900">Awa SOW</p>
                  <p className="text-[10px] text-slate-500">Service Financier EFA SCHOOL</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 mb-12">Le Promoteur & Fondateur Directeur Général</p>
                  <p className="font-bold text-[#0F172A]">{parametres.directeur}</p>
                  <p className="text-[10px] text-amber-700 font-semibold">EFA TECHNOLOGIE · Lomé, Togo</p>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#0F172A] text-[#D4AF37] font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Lancer l'Impression / Sauvegarder PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
