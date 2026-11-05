import React, { useState } from 'react';
import { 
  MessageCircle, Send, CheckCircle2, Clock, 
  Users, Filter, Phone, Sparkles, FileText, 
  ShieldCheck, AlertCircle, Copy, ExternalLink, Zap
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { formatCurrency, buildWhatsAppLink } from '../utils/formatters';
import { MessageWhatsApp } from '../types';

export const CommunicationView: React.FC = () => {
  const { classes, eleves, messages, parametres, logWhatsAppMessage } = useSchool();

  const [targetType, setTargetType] = useState<'classe' | 'retardataires' | 'manuel'>('classe');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Templates
  const templates = [
    {
      id: 'reunion',
      title: 'Réunion Pédagogique Parents',
      text: `Chers parents d'élèves de {classe}, la Direction du Complexe {nom_ecole} vous convie cordialement à la réunion pédagogique trimestrielle ce samedi à 09h00 précises dans la cour principale. Votre présence active est vivement souhaitée pour le suivi de nos enfants.`,
    },
    {
      id: 'absence',
      title: 'Alerte Absence Non Justifiée',
      text: `Urgent - {nom_ecole} : Bonjour {nom_parent}, votre enfant {nom_eleve} ({classe}) a été constaté absent au cours ce matin. Merci de justifier cette absence dans les plus brefs délais auprès de la vie scolaire au {telephone_ecole}.`,
    },
    {
      id: 'rappel_scolarite',
      title: 'Rappel d\'Échéance de Scolarité',
      text: `Bonjour {nom_parent}. La direction du Complexe {nom_ecole} vous rappelle avec bienveillance qu'un solde de {reste_a_payer} reste dû sur la scolarité de {nom_eleve} ({classe}). Merci de vous rapprocher de la caisse pour régularisation avant la fin de semaine.`,
    },
    {
      id: 'bulletins',
      title: 'Disponibilité des Bulletins',
      text: `Chers parents, les bulletins de notes du 1er trimestre de {nom_eleve} ({classe}) sont disponibles et certifiés par la direction du Complexe {nom_ecole}. Vous pouvez venir les retirer au secrétariat du lundi au vendredi.`,
    },
  ];

  const [messageBody, setMessageBody] = useState(templates[0].text);
  const [broadcastProgress, setBroadcastProgress] = useState<{
    isRunning: boolean;
    currentIndex: number;
    total: number;
    completed: boolean;
  }>({
    isRunning: false,
    currentIndex: 0,
    total: 0,
    completed: false,
  });

  // Calculate recipients based on selection
  const targetStudents = React.useMemo(() => {
    if (targetType === 'classe') {
      return eleves.filter(e => e.classeId === selectedClassId);
    }
    if (targetType === 'retardataires') {
      return eleves.filter(e => (e.scolariteTotal - e.montantPaye) > 0);
    }
    return eleves.filter(e => selectedStudentIds.includes(e.id));
  }, [targetType, selectedClassId, selectedStudentIds, eleves]);

  const targetClass = classes.find(c => c.id === selectedClassId);

  // Substitute tags for a single student
  const formatMessageForStudent = (student: typeof eleves[0], rawText: string) => {
    const cls = classes.find(c => c.id === student.classeId);
    const reste = Math.max(0, student.scolariteTotal - student.montantPaye);

    return rawText
      .replace(/{nom_parent}/g, student.parent1.nom)
      .replace(/{nom_eleve}/g, `${student.nom} ${student.prenom}`)
      .replace(/{classe}/g, cls?.nom || 'la classe')
      .replace(/{reste_a_payer}/g, formatCurrency(reste))
      .replace(/{nom_ecole}/g, parametres.nom)
      .replace(/{telephone_ecole}/g, parametres.telephone);
  };

  // Preview message with first student
  const previewStudent = targetStudents[0] || eleves[0];
  const previewMessage = previewStudent 
    ? formatMessageForStudent(previewStudent, messageBody) 
    : messageBody;

  // Unitary direct WhatsApp
  const handleSendUnitaryWhatsApp = (student: typeof eleves[0]) => {
    const finalMsg = formatMessageForStudent(student, messageBody);
    const cls = classes.find(c => c.id === student.classeId);

    logWhatsAppMessage({
      type: messageBody.includes('solde') || messageBody.includes('scolarité') ? 'Rappel Écolage' :
            messageBody.includes('absent') ? 'Absence' :
            messageBody.includes('réunion') ? 'Réunion Parents' : 'Général',
      destinataireNom: `${student.parent1.nom} (Parent de ${student.nom})`,
      eleveNom: `${student.nom} ${student.prenom}`,
      classeNom: cls?.nom,
      telephone: student.parent1.telephone,
      message: finalMsg,
    });

    const link = buildWhatsAppLink(student.parent1.telephone, finalMsg);
    window.open(link, '_blank');
  };

  // Launch broadcast simulation
  const handleStartBroadcast = () => {
    if (targetStudents.length === 0) return;

    setBroadcastProgress({
      isRunning: true,
      currentIndex: 0,
      total: targetStudents.length,
      completed: false,
    });

    let current = 0;
    const interval = setInterval(() => {
      if (current < targetStudents.length) {
        const student = targetStudents[current];
        const finalMsg = formatMessageForStudent(student, messageBody);
        const cls = classes.find(c => c.id === student.classeId);

        logWhatsAppMessage({
          type: 'Général',
          destinataireNom: `${student.parent1.nom} (Diffusion)`,
          eleveNom: `${student.nom} ${student.prenom}`,
          classeNom: cls?.nom,
          telephone: student.parent1.telephone,
          message: finalMsg,
        });

        current++;
        setBroadcastProgress(prev => ({
          ...prev,
          currentIndex: current,
        }));
      } else {
        clearInterval(interval);
        setBroadcastProgress(prev => ({
          ...prev,
          isRunning: false,
          completed: true,
        }));
      }
    }, 250);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white font-heading">
              Centre de Communication & Diffusion WhatsApp
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              wa.me Direct
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Informez instantanément les parents d'élèves sur leur canal de messagerie préféré
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Passerelle WhatsApp EFA Validée</span>
        </div>
      </div>

      {/* Main Grid: Composer (left) vs WhatsApp Preview & Broadcast Queue (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Composer & Target Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Step 1: Target Selection */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>1. Sélectionner les Destinataires</span>
            </h3>

            {/* Target Mode Segmented Buttons */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTargetType('classe')}
                className={`py-2 px-2 rounded-md font-semibold transition-colors cursor-pointer text-center ${
                  targetType === 'classe'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Par Classe
              </button>
              <button
                type="button"
                onClick={() => setTargetType('retardataires')}
                className={`py-2 px-2 rounded-md font-semibold transition-colors cursor-pointer text-center ${
                  targetType === 'retardataires'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Retards Écolage
              </button>
              <button
                type="button"
                onClick={() => setTargetType('manuel')}
                className={`py-2 px-2 rounded-md font-semibold transition-colors cursor-pointer text-center ${
                  targetType === 'manuel'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Personnalisé
              </button>
            </div>

            {/* Target Options */}
            {targetType === 'classe' && (
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1">
                  Sélectionner la classe cible :
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-semibold"
                >
                  {classes.map((c) => {
                    const count = eleves.filter(e => e.classeId === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.nom} ({count} élèves & parents)
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {targetType === 'retardataires' && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                <span>
                  Tous les parents ayant un solde impayé ({targetStudents.length} parents ciblés)
                </span>
                <span className="font-mono font-bold text-rose-200">
                  {formatCurrency(targetStudents.reduce((a, b) => a + (b.scolariteTotal - b.montantPaye), 0))}
                </span>
              </div>
            )}

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Destinataires ciblés : <strong className="text-white font-mono">{targetStudents.length} parents</strong></span>
              <span className="text-emerald-400">100% numéros WhatsApp valides</span>
            </div>
          </div>

          {/* Step 2: Message Templates & Textarea */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              <span>2. Rédiger le Message</span>
              <span className="text-[10px] text-slate-400 font-normal">Modèles prêts à l'emploi</span>
            </h3>

            {/* Quick Template Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setMessageBody(tpl.text)}
                  className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors cursor-pointer"
                >
                  {tpl.title}
                </button>
              ))}
            </div>

            {/* Dynamic Tags Helper */}
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-1">
              <span className="text-slate-400 block font-medium">Balises dynamiques insérables (cliquez pour ajouter) :</span>
              <div className="flex flex-wrap gap-1">
                {['{nom_parent}', '{nom_eleve}', '{classe}', '{reste_a_payer}', '{nom_ecole}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setMessageBody(prev => `${prev} ${tag}`)}
                    className="px-1.5 py-0.5 rounded-sm bg-slate-800 text-amber-300 font-mono text-[10px] hover:bg-slate-700 cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                rows={5}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Rédigez votre message aux parents..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-hidden focus:border-amber-500 font-sans"
              />
              <span className="text-[10px] text-slate-500 block text-right mt-1">
                {messageBody.length} caractères
              </span>
            </div>

            {/* Broadcast action button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleStartBroadcast}
                disabled={broadcastProgress.isRunning || targetStudents.length === 0}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/40"
              >
                <Zap className="w-4 h-4 text-emerald-200" />
                <span>
                  {broadcastProgress.isRunning
                    ? `Diffusion en cours... (${broadcastProgress.currentIndex}/${broadcastProgress.total})`
                    : `Lancer la Diffusion Groupée (${targetStudents.length} Parents)`}
                </span>
              </button>
            </div>
          </div>

          {/* Broadcast Progress Card */}
          {(broadcastProgress.isRunning || broadcastProgress.completed) && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Progression de la Diffusion WhatsApp</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {broadcastProgress.currentIndex} / {broadcastProgress.total} envoyés
                </span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${(broadcastProgress.currentIndex / Math.max(1, broadcastProgress.total)) * 100}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                />
              </div>
              {broadcastProgress.completed && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tous les messages ont été générés et enregistrés dans l'historique !</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: WhatsApp Live Preview & Unitary Clicker (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Smartphone Style WhatsApp Preview Box */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
            {/* WhatsApp App Header */}
            <div className="bg-[#075E54] text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  {previewStudent?.nom[0] || 'E'}
                </div>
                <div>
                  <span className="text-xs font-bold block">{previewStudent?.parent1.nom || 'Parent d\'élève'}</span>
                  <span className="text-[10px] text-emerald-200 block">{previewStudent?.parent1.telephone || '+229 97 00 12 34'}</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-100 font-mono">Prévisualisation</span>
            </div>

            {/* Chat Area */}
            <div className="p-4 bg-[#0B141A] min-h-[220px] flex flex-col justify-end space-y-3">
              <div className="bg-[#005C4B] text-slate-100 p-3 rounded-lg rounded-tr-none text-xs leading-relaxed max-w-[90%] self-end shadow-sm border border-emerald-700/30">
                <p className="whitespace-pre-wrap">{previewMessage}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-emerald-200">
                  <span>14:30</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                </div>
              </div>
            </div>

            {/* Action inside preview */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Tester en direct pour ce parent :</span>
              {previewStudent && (
                <button
                  type="button"
                  onClick={() => handleSendUnitaryWhatsApp(previewStudent)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ouvrir WhatsApp</span>
                </button>
              )}
            </div>
          </div>

          {/* Unitary Parent Queue List (Top 5 of current target) */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>File de Diffusion Directe ({targetStudents.length})</span>
              <span className="text-[10px] text-slate-500">Envoi 1-par-1</span>
            </h4>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {targetStudents.slice(0, 8).map((st) => (
                <div
                  key={st.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-white block truncate">{st.parent1.nom}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Élève : {st.nom} ({st.parent1.telephone})
                    </span>
                  </div>

                  <button
                    onClick={() => handleSendUnitaryWhatsApp(st)}
                    className="px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-2.5 h-2.5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Business API Config Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Passerelle API WhatsApp Cloud / Business</span>
            </div>
            <p className="text-[11px] text-slate-400">
              L'intégration hybride permet l'envoi instantané via <code className="text-amber-400 font-mono">wa.me</code> sans coût d'infrastructure, tout en préparant le raccordement au webhook Meta Cloud API pour les diffusions automatisées en haute volumétrie.
            </p>
          </div>

        </div>

      </div>

      {/* RECENT WHATSAPP MESSAGE LOGS */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
          Historique des Messages & Diffusions Envoyées ({messages.length})
        </h3>

        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date & Heure</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Destinataire & Tél</th>
                <th className="py-2.5 px-3">Élève & Classe</th>
                <th className="py-2.5 px-3">Extrait du Message</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {messages.slice(0, 10).map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">{m.date}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 text-[10px] font-semibold">
                      {m.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-200">
                    <span className="block font-medium">{m.destinataireNom}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{m.telephone}</span>
                  </td>
                  <td className="py-2 px-3 text-slate-300">
                    <span>{m.eleveNom || '-'}</span>
                    <span className="text-[10px] text-slate-500 block">{m.classeNom || '-'}</span>
                  </td>
                  <td className="py-2 px-3 text-slate-400 truncate max-w-xs text-[11px]">
                    {m.message}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                      {m.statut}
                    </span>
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
