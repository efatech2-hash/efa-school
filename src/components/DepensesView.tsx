import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, Plus, DollarSign, Filter, 
  Trash2, FileText, CheckCircle, ArrowDownRight, 
  TrendingUp, Calendar, Search
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { CategorieDepense } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DepensesViewProps {
  onOpenNewDepense: () => void;
}

export const DepensesView: React.FC<DepensesViewProps> = ({ onOpenNewDepense }) => {
  const { 
    depenses, 
    totalDepenses, 
    totalRecettes, 
    beneficeNet, 
    deleteDepense 
  } = useSchool();

  const [selectedCategory, setSelectedCategory] = useState<'ALL' | CategorieDepense>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    depenses.forEach(d => {
      map[d.categorie] = (map[d.categorie] || 0) + d.montant;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [depenses]);

  // Filtered expenses
  const filteredDepenses = useMemo(() => {
    return depenses.filter(d => {
      const matchesCat = selectedCategory === 'ALL' || d.categorie === selectedCategory;
      const matchesSearch = 
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.beneficiaire.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.reference && d.reference.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCat && matchesSearch;
    });
  }, [depenses, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-heading">
            Gestion des Dépenses & Bilan d'Exploitation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivi des charges opérationnelles, salaires des professeurs et rentabilité nette
          </p>
        </div>

        <button
          onClick={onOpenNewDepense}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-rose-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ Enregistrer une Dépense</span>
        </button>
      </div>

      {/* Financial Comparison Summary (Bénéfice Net Equation) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Recettes Élèves */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Recettes Élèves</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block mt-1">
            +{formatCurrency(totalRecettes)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Versements de scolarité perçus</span>
        </div>

        {/* Total Dépenses */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Dépenses École</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono text-rose-400 block mt-1">
            -{formatCurrency(totalDepenses)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Charges salariales et logistiques</span>
        </div>

        {/* Bénéfice Net = Recettes - Dépenses */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bénéfice Net d'Exploitation
            </span>
            <DollarSign className={`w-4 h-4 ${beneficeNet >= 0 ? 'text-amber-400' : 'text-rose-400'}`} />
          </div>
          <span className={`text-xl sm:text-2xl font-black font-mono block mt-1 ${
            beneficeNet >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {formatCurrency(beneficeNet)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Recettes Élèves - Charges Totales
          </span>
        </div>

      </div>

      {/* Category Breakdown Badges */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Ventilation des Charges par Poste de Dépense
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoryBreakdown.map(([cat, amount]) => {
            const pct = totalDepenses > 0 ? Math.round((amount / totalDepenses) * 100) : 0;
            return (
              <div 
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat as any)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold truncate">{cat}</span>
                  <span className="font-mono text-slate-400">{pct}%</span>
                </div>
                <span className="font-mono font-bold text-xs text-white block mt-1">
                  {formatCurrency(amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses Table with Filters */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
            Journal des Décaissements ({filteredDepenses.length})
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher dépense..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="ALL">Toutes catégories</option>
              <option value="Salaire Enseignants">Salaire Enseignants</option>
              <option value="Loyer">Loyer</option>
              <option value="Fournitures">Fournitures</option>
              <option value="Électricité">Électricité</option>
              <option value="Eau">Eau</option>
              <option value="Taxes">Taxes</option>
              <option value="Entretien & Travaux">Entretien & Travaux</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>

        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Catégorie</th>
                <th className="py-2.5 px-3">Bénéficiaire</th>
                <th className="py-2.5 px-3">Description du motif</th>
                <th className="py-2.5 px-3">Mode & Référence</th>
                <th className="py-2.5 px-3 text-right">Montant</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDepenses.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {formatDate(d.date)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[10px] font-semibold">
                      {d.categorie}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-white">
                    {d.beneficiaire}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate text-[11px]">
                    {d.description}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    <span>{d.modePaiement}</span>
                    {d.reference && (
                      <span className="block font-mono text-[10px] text-slate-500">{d.reference}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                    -{formatCurrency(d.montant)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => deleteDepense(d.id)}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Supprimer la dépense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
