import React, { useState } from 'react';
import { 
  X, Phone, MessageSquare, CreditCard, Award, 
  Calendar, CheckCircle, Clock, AlertTriangle, 
  Printer, User, ExternalLink, ShieldCheck, Plus
} from 'lucide-react';
import { Eleve, Classe, Paiement } from '../types';
import { UserRole } from '../types/auth';
import { useSchool } from '../context/SchoolContext';
import { formatCurrency, formatDate, buildWhatsAppLink, getStatutPaiement } from '../utils/formatters';

interface StudentDetailModalProps {
  eleve: Eleve | null;
  onClose: () => void;
  onOpenPaymentModal: (eleveId: string) => void;
  onOpenReceipt: (paiement: Paiement, eleve: Eleve) => void;
  onOpenBulletin: (eleve: Eleve) => void;
  currentRole?: UserRole;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  eleve,
  onClose,
  onOpenPaymentModal,
  onOpenReceipt,
  onOpenBulletin,
  currentRole,
}) => {
  const { classes, parametres, logWhatsAppMessage } = useSchool();
  const initialTab = currentRole === 'professeur' ? 'notes' : 'finance';
  const [activeTab, setActiveTab] = useState<'info' | 'finance' | 'notes' | 'presences'>(initialTab);

  if (!eleve) return null;

  const currentClass = classes.find(c => c.id === eleve.classeId);
  const reste = Math.max(0, eleve.scolariteTotal - eleve.montantPaye);
  const statut = getStatutPaiement(eleve.scolariteTotal, eleve.montantPaye);

  const handleSendAbsenceAlert = () => {
    const parent = eleve.parent1;
    const msg = `Bonjour ${parent.nom}. La direction du Complexe ${parametres.nom} vous informe que votre enfant ${eleve.nom} ${eleve.prenom} (Classe de ${currentClass?.nom}) a été constaté absent ce jour. Merci de contacter la vie scolaire au ${parametres.telephone}.`;
    
    logWhatsAppMessage({
      type: 'Absence',
      destinataireNom: `${parent.nom} (${eleve.nom} ${eleve.prenom})`,
      eleveNom: `${eleve.nom} ${eleve.prenom}`,
      classeNom: currentClass?.nom,
      telephone: parent.telephone,
      message: msg,
    });

    const link = buildWhatsAppLink(parent.telephone, msg);
    window.open(link, '_blank');
  };

  const handleSendReminder = () => {
    const parent = eleve.parent1;
    const msg = `Bonjour ${parent.nom}. La direction du Complexe ${parametres.nom} vous rappelle avec bienveillance qu'un solde de ${formatCurrency(reste)} reste dû pour la scolarité de votre enfant ${eleve.nom} ${eleve.prenom} (${currentClass?.nom}). Merci de régulariser la situation auprès de la caisse.`;

    logWhatsAppMessage({
      type: 'Rappel Écolage',
      destinataireNom: `${parent.nom} (${eleve.nom} ${eleve.prenom})`,
      eleveNom: `${eleve.nom} ${eleve.prenom}`,
      classeNom: currentClass?.nom,
      telephone: parent.telephone,
      message: msg,
    });

    const link = buildWhatsAppLink(parent.telephone, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-slate-100 overflow-hidden my-6">
        
        {/* Header Profile */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-800 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl uppercase shadow-md shrink-0">
              {eleve.nom[0]}{eleve.prenom[0]}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-heading">
                  {eleve.nom} {eleve.prenom}
                </h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    statut === 'Soldé'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : statut === 'Partiel'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {statut}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                <span className="font-mono text-amber-400/90 font-medium">{eleve.matricule}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300 font-medium">{currentClass?.nom || 'Classe inconnue'}</span>
                <span aria-hidden="true">·</span>
                <span>{eleve.sexe === 'M' ? 'Garçon' : 'Fille'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/40 text-xs">
          {/* Tab Finance: Caisse, Fondateur, Directeur, Censeur (Prof = HIDE) */}
          {currentRole !== 'professeur' && (
            <button
              onClick={() => setActiveTab('finance')}
              className={`py-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'finance'
                  ? 'border-amber-500 text-amber-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Finances & Paiements</span>
            </button>
          )}

          {/* Tab Dossier & Parents: Tous rôles */}
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'info'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Dossier & Parents</span>
          </button>

          {/* Tab Notes: Prof, Censeur, Dir, Fondateur (Caisse = HIDE) */}
          {currentRole !== 'caisse' && (
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'notes'
                  ? 'border-amber-500 text-amber-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Notes & Bulletin</span>
            </button>
          )}

          {/* Tab Assiduité: Prof, Censeur, Dir, Fondateur (Caisse = HIDE) */}
          {currentRole !== 'caisse' && (
            <button
              onClick={() => setActiveTab('presences')}
              className={`py-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'presences'
                  ? 'border-amber-500 text-amber-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Assiduité</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs max-h-[60vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: FINANCE */}
          {activeTab === 'finance' && (
            currentRole === 'professeur' ? (
              <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">Accès restreint</h4>
                <p className="text-xs text-slate-400">Le module financier et les détails des paiements sont strictement réservés à la Caisse et à la Direction.</p>
              </div>
            ) : (
            <div className="space-y-4">
              {/* Financial KPI Banner */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Scolarité Totale</span>
                  <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                    {formatCurrency(eleve.scolariteTotal)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Montant Payé</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">
                    {formatCurrency(eleve.montantPaye)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Reste à Solder</span>
                  <span className="text-sm font-mono font-bold text-rose-400 mt-0.5 block">
                    {formatCurrency(reste)}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-200 text-xs">
                  Historique des Versements ({eleve.paiements?.length || 0})
                </span>

                <div className="flex items-center gap-2">
                  {reste > 0 && (
                    <button
                      onClick={handleSendReminder}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Relancer WhatsApp</span>
                    </button>
                  )}

                  {reste > 0 && currentRole !== 'censeur' && (
                    <button
                      onClick={() => onOpenPaymentModal(eleve.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-slate-950" />
                      <span>Encaisser un Versement</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Payments Table */}
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">N° Reçu</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Motif</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3 text-right">Montant</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {eleve.paiements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          Aucun paiement enregistré pour le moment.
                        </td>
                      </tr>
                    ) : (
                      eleve.paiements.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3 font-mono text-amber-400/90 font-medium">
                            {p.numeroRecu}
                          </td>
                          <td className="py-2 px-3 text-slate-400">
                            {formatDate(p.date)}
                          </td>
                          <td className="py-2 px-3 text-white font-medium">
                            {p.motif}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {p.mode}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatCurrency(p.montant)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => onOpenReceipt(p, eleve)}
                              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                              title="Imprimer le reçu"
                            >
                              <Printer className="w-3 h-3 text-amber-400" />
                              <span>Reçu</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* TAB 2: DOSSIER & PARENTS */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block border-b border-slate-800/80 pb-1">
                  Parent 1 (Contact WhatsApp Officiel)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Nom du tuteur</span>
                    <span className="font-semibold text-white">{eleve.parent1.nom}</span>
                    <span className="text-slate-400 text-[11px] block">({eleve.parent1.lienParente})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Numéro WhatsApp</span>
                    <a
                      href={buildWhatsAppLink(eleve.parent1.telephone, `Bonjour ${eleve.parent1.nom}, direction ${parametres.nom}...`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-emerald-400 hover:underline inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{eleve.parent1.telephone}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Profession</span>
                    <span className="text-slate-300">{eleve.parent1.profession || 'Non renseigné'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Action Rapide</span>
                    <button
                      onClick={() => {
                        const link = buildWhatsAppLink(eleve.parent1.telephone, `Bonjour ${eleve.parent1.nom}...`);
                        window.open(link, '_blank');
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-md hover:bg-emerald-600/30 cursor-pointer"
                    >
                      Discuter sur WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              {eleve.parent2 && (
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block border-b border-slate-800/80 pb-1">
                    Parent 2 (Secondaire)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Nom</span>
                      <span className="font-semibold text-white">{eleve.parent2.nom}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Téléphone</span>
                      <span className="font-mono text-slate-300">{eleve.parent2.telephone || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Détails de l'Inscription
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Date d'inscription</span>
                    <span className="text-slate-300 font-mono">{formatDate(eleve.dateInscription)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Date de naissance</span>
                    <span className="text-slate-300 font-mono">{formatDate(eleve.dateNaissance)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Salle de cours</span>
                    <span className="text-slate-300">{currentClass?.salle || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTES & BULLETIN */}
          {activeTab === 'notes' && (
            currentRole === 'caisse' ? (
              <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">Accès restreint</h4>
                <p className="text-xs text-slate-400">La consultation et l'édition des notes sont strictement réservées aux enseignants et à la direction pédagogique.</p>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Relevé de Notes du Trimestre</h4>
                  <p className="text-[11px] text-slate-400">Évaluations continues et notes d'examen</p>
                </div>
                <button
                  onClick={() => onOpenBulletin(eleve)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-slate-950" />
                  <span>Imprimer le Bulletin</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Matière</th>
                      <th className="py-2 px-3 text-center">D1</th>
                      <th className="py-2 px-3 text-center">D2</th>
                      <th className="py-2 px-3 text-center">Examen</th>
                      <th className="py-2 px-3 text-center">Moy / 20</th>
                      <th className="py-2 px-3">Appréciation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {eleve.notes?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          Aucune note saisie pour cet élève.
                        </td>
                      </tr>
                    ) : (
                      eleve.notes.map((n, i) => {
                        const avg = (n.devoir1 + n.devoir2 + n.examen * 2) / 4;
                        return (
                          <tr key={i} className="hover:bg-slate-900/40">
                            <td className="py-2 px-3 font-medium text-white">{n.matiere}</td>
                            <td className="py-2 px-3 text-center font-mono text-slate-300">{n.devoir1.toFixed(1)}</td>
                            <td className="py-2 px-3 text-center font-mono text-slate-300">{n.devoir2.toFixed(1)}</td>
                            <td className="py-2 px-3 text-center font-mono text-slate-300 font-semibold">{n.examen.toFixed(1)}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-amber-400 bg-amber-500/10">
                              {avg.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-[11px] text-slate-400 italic">
                              {n.appreciation}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* TAB 4: PRÉSENCES */}
          {activeTab === 'presences' && (
            currentRole === 'caisse' ? (
              <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">Accès restreint</h4>
                <p className="text-xs text-slate-400">Le registre d'assiduité est réservé au corps enseignant et à la vie scolaire.</p>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Registre des Présences</h4>
                  <p className="text-[11px] text-slate-400">Pointage des cours et retards</p>
                </div>
                <button
                  onClick={handleSendAbsenceAlert}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Alerter Absence WhatsApp</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Statut</th>
                      <th className="py-2 px-3">Motif communiqué</th>
                      <th className="py-2 px-3">Justificatif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {eleve.presences?.map((pr, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-mono text-slate-300">{formatDate(pr.date)}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              pr.statut === 'Présent'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : pr.statut === 'Retard'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {pr.statut}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400 italic text-[11px]">
                          {pr.motif || 'Aucun signalement'}
                        </td>
                        <td className="py-2 px-3 text-[11px]">
                          {pr.justifie ? (
                            <span className="text-emerald-400">Justifié</span>
                          ) : (
                            <span className="text-rose-400">Non justifié</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            EFA SCHOOL by EFA TECHNOLOGIE · Directeur: {parametres.directeur}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
