import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, Plus, Phone, 
  CreditCard, Eye, Award, ExternalLink, Download, 
  MessageSquare, AlertCircle
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { Eleve, StatutPaiement } from '../types';
import { UserRole } from '../types/auth';
import { formatCurrency, getStatutPaiement, buildWhatsAppLink } from '../utils/formatters';

interface ElevesViewProps {
  onOpenNewStudent: () => void;
  onSelectStudent: (eleve: Eleve) => void;
  onOpenPaymentForStudent: (eleveId: string) => void;
  currentRole?: UserRole;
  hidePaymentAction?: boolean;
}

export const ElevesView: React.FC<ElevesViewProps> = ({
  onOpenNewStudent,
  onSelectStudent,
  onOpenPaymentForStudent,
  currentRole,
  hidePaymentAction,
}) => {
  const { eleves, classes, parametres, logWhatsAppMessage } = useSchool();
  const canEncaisser = currentRole !== 'censeur' && currentRole !== 'professeur' && !hidePaymentAction;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedStatutFilter, setSelectedStatutFilter] = useState<'ALL' | StatutPaiement>('ALL');

  // Filter students
  const filteredEleves = useMemo(() => {
    return eleves.filter((el) => {
      const matchesSearch = 
        el.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        el.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        el.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        el.parent1.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        el.parent1.telephone.includes(searchQuery);

      const matchesClass = selectedClassFilter === 'ALL' || el.classeId === selectedClassFilter;

      const statut = getStatutPaiement(el.scolariteTotal, el.montantPaye);
      const matchesStatut = selectedStatutFilter === 'ALL' || statut === selectedStatutFilter;

      return matchesSearch && matchesClass && matchesStatut;
    });
  }, [eleves, searchQuery, selectedClassFilter, selectedStatutFilter]);

  const handleQuickWhatsApp = (el: Eleve) => {
    const reste = Math.max(0, el.scolariteTotal - el.montantPaye);
    const classe = classes.find(c => c.id === el.classeId);
    let msg = `Bonjour ${el.parent1.nom}. Direction du Complexe ${parametres.nom} concernant l'élève ${el.nom} ${el.prenom} (${classe?.nom}).`;
    if (reste > 0) {
      msg += ` Nous vous rappelons cordialement qu'un solde de ${formatCurrency(reste)} reste en attente sur la scolarité.`;
    }

    logWhatsAppMessage({
      type: reste > 0 ? 'Rappel Écolage' : 'Général',
      destinataireNom: `${el.parent1.nom} (${el.nom})`,
      eleveNom: `${el.nom} ${el.prenom}`,
      classeNom: classe?.nom,
      telephone: el.parent1.telephone,
      message: msg,
    });

    const link = buildWhatsAppLink(el.parent1.telephone, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-heading">
            Répertoire Général des Élèves ({eleves.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Matricules officiels, fiches parents WhatsApp et historique financier
          </p>
        </div>

        <button
          onClick={onOpenNewStudent}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>+ Inscrire un Élève</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule, parent ou tel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Filter by Class */}
        <div>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-medium"
          >
            <option value="ALL">Toutes les classes ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} ({c.niveau})
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Payment Status */}
        <div>
          <select
            value={selectedStatutFilter}
            onChange={(e) => setSelectedStatutFilter(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-medium"
          >
            <option value="ALL">Tous les statuts de paiement</option>
            <option value="Soldé">Soldé (100% payé)</option>
            <option value="Partiel">Partiel (Acomptes versés)</option>
            <option value="Impayé">Impayé / En retard</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Élève & Matricule</th>
                <th className="py-3 px-3">Classe</th>
                <th className="py-3 px-3">Parent 1 (WhatsApp)</th>
                <th className="py-3 px-3 text-right">Scolarité</th>
                <th className="py-3 px-3 text-right">Payé</th>
                <th className="py-3 px-3 text-right">Reste</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEleves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Aucun élève ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredEleves.map((el) => {
                  const classe = classes.find(c => c.id === el.classeId);
                  const reste = Math.max(0, el.scolariteTotal - el.montantPaye);
                  const statut = getStatutPaiement(el.scolariteTotal, el.montantPaye);

                  return (
                    <tr 
                      key={el.id} 
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name & Matricule */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                            {el.nom[0]}{el.prenom[0]}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectStudent(el)}
                              className="font-bold text-white hover:text-amber-400 text-left transition-colors cursor-pointer block"
                            >
                              {el.nom} {el.prenom}
                            </button>
                            <span className="font-mono text-[10px] text-slate-400 block">
                              {el.matricule} · {el.sexe === 'M' ? 'G' : 'F'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Classe */}
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-semibold">
                          {classe?.nom || 'N/A'}
                        </span>
                      </td>

                      {/* Parent 1 */}
                      <td className="py-2.5 px-3 text-slate-300">
                        <div className="truncate max-w-[170px]">
                          <span className="block font-medium truncate">{el.parent1.nom}</span>
                          <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {el.parent1.telephone}
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {formatCurrency(el.scolariteTotal)}
                      </td>

                      {/* Payé */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(el.montantPaye)}
                      </td>

                      {/* Reste */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {reste > 0 ? (
                          <span className="text-rose-400">{formatCurrency(reste)}</span>
                        ) : (
                          <span className="text-slate-500">0 F</span>
                        )}
                      </td>

                      {/* Statut Badge */}
                      <td className="py-2.5 px-3 text-center">
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

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {reste > 0 && canEncaisser && (
                            <button
                              onClick={() => onOpenPaymentForStudent(el.id)}
                              className="p-1.5 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                              title="Encaisser un versement"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleQuickWhatsApp(el)}
                            className="p-1.5 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                            title="Contacter sur WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onSelectStudent(el)}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                            title="Ouvrir la fiche complète"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
