import React, { useState } from 'react';
import { Calendar, Home, CheckCircle, Clock, Plus, Trash2, FileText, Download, Archive, ExternalLink, Share2 } from 'lucide-react';
import { Inspection, User } from '../types';
import { generateInspectionPDF } from '../services/pdfGenerator';

interface Props {
  currentUser: User;
  inspections: Inspection[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

type TabType = 'inspections' | 'reports';

export const InspectionList: React.FC<Props> = ({ currentUser, inspections, onSelect, onNew, onDelete }) => {
  const [activeTab, setActiveTab] = useState<TabType>('inspections');

  // Filter inspections based on tab
  const activeInspections = inspections.filter(i => i.status !== 'concluida');
  const completedInspections = inspections.filter(i => i.status === 'concluida');

  const handleDownloadPdf = (e: React.MouseEvent, inspection: Inspection) => {
    e.stopPropagation();
    
    // Priority: Saved PDF > Generate local
    if (inspection.pdfUrl) {
        window.open(inspection.pdfUrl, '_blank');
        return;
    }

    try {
        generateInspectionPDF(inspection, currentUser);
    } catch (err) {
        console.error("Failed to generate PDF", err);
        alert("Erro ao gerar PDF. Tente novamente.");
    }
  };

  const handleShare = async (e: React.MouseEvent, inspection: Inspection) => {
      e.stopPropagation();
      
      if (!inspection.pdfUrl) {
          alert("O PDF precisa estar sincronizado na nuvem para ser compartilhado. Tente abrir o PDF localmente.");
          return;
      }

      if (navigator.share) {
          try {
              await navigator.share({
                  title: `Vistoria - ${inspection.address}`,
                  text: `Olá ${inspection.clientName}, segue o link do laudo de vistoria do imóvel:`,
                  url: inspection.pdfUrl
              });
          } catch (err) {
              console.log('Error sharing', err);
          }
      } else {
          // Fallback: Copy to clipboard
          try {
             await navigator.clipboard.writeText(inspection.pdfUrl);
             alert("Link do PDF copiado para a área de transferência!");
          } catch(err) {
             alert("Não foi possível compartilhar automaticamente.");
          }
      }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Painel de Vistorias</h1>
          <p className="text-slate-400">Gerencie sua agenda e acesse laudos salvos.</p>
        </div>
        
        <div className="w-full md:w-auto">
          <button 
            onClick={onNew}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all w-full md:w-auto"
          >
            <Plus size={20} />
            <span>Nova Vistoria</span>
          </button>
        </div>
      </div>

      {/* Tabs - Equal Width */}
      <div className="flex w-full mb-6 border-b border-slate-800">
        <button
            onClick={() => setActiveTab('inspections')}
            className={`flex-1 pb-3 px-2 font-medium transition-colors relative text-center ${activeTab === 'inspections' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
            Agendadas / Em Andamento
            {activeTab === 'inspections' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-t-full" />}
        </button>
        <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 pb-3 px-2 font-medium transition-colors relative text-center ${activeTab === 'reports' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
            Laudos Salvos (PDF)
            {activeTab === 'reports' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-t-full" />}
        </button>
      </div>

      {/* ACTIVE INSPECTIONS LIST */}
      {activeTab === 'inspections' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeInspections.map((insp) => (
              <div 
                key={insp.id}
                className="bg-slate-900 rounded-xl border border-slate-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-900/10 transition-all relative group isolate overflow-hidden"
              >
                {/* Clickable Content Area */}
                <div 
                  onClick={() => onSelect(insp.id)}
                  className="p-5 h-full cursor-pointer active:bg-slate-800/50 transition-colors"
                >
                    <div className="flex justify-between items-start mb-3 pr-8">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide
                        ${insp.type === 'entrada' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-900' : 'bg-amber-900/40 text-amber-400 border border-amber-900'}`}>
                        {insp.type}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-slate-100 mb-1 truncate pr-2">{insp.address}</h3>
                    <p className="text-sm text-slate-400 mb-4 flex items-center gap-1">
                      <Home size={14} /> {insp.clientName}
                    </p>

                    <div className="flex items-center justify-between text-sm text-slate-500 pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(insp.date).toLocaleDateString('pt-BR')}
                      </div>
                      
                      <div className={`flex items-center gap-1 text-xs font-medium text-slate-400`}>
                        <Clock size={14} />
                        {insp.status.replace('_', ' ')}
                      </div>
                    </div>
                </div>

                {/* Delete Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onDelete(insp.id);
                    }}
                    className="absolute top-4 right-4 z-20 p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-red-600 rounded-lg transition-all shadow-sm border border-slate-700 hover:border-red-500 flex items-center justify-center"
                    title="Excluir Vistoria"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            ))}
            
            {activeInspections.length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-900 rounded-xl border-dashed border-2 border-slate-800">
                <p className="text-slate-500 mb-2">Nenhuma vistoria pendente.</p>
                <button onClick={onNew} className="text-amber-500 font-medium hover:text-amber-400 hover:underline">
                  Agendar nova vistoria
                </button>
              </div>
            )}
          </div>
      )}

      {/* COMPLETED REPORTS (PDFs) LIST */}
      {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {completedInspections.map((insp) => {
                // Filename visual calculation for display
                let addressSuffix = insp.address.trim();
                const firstSpace = addressSuffix.indexOf(' ');
                if (firstSpace !== -1) {
                  addressSuffix = addressSuffix.substring(firstSpace + 1);
                }
                const filenameDisplay = `${insp.type}_${addressSuffix.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

                return (
                <div 
                    key={insp.id}
                    className="bg-slate-900 rounded-xl border border-slate-800 relative group overflow-hidden flex flex-col"
                >
                    <div className="p-5 flex-grow">
                        <div className="flex items-center gap-2 mb-3 text-emerald-500 font-medium text-xs uppercase tracking-wide">
                            <CheckCircle size={14} /> Concluída
                        </div>

                        <h3 className="font-bold text-slate-100 mb-1 truncate">{insp.address}</h3>
                        <p className="text-sm text-slate-400 mb-2">{insp.clientName}</p>
                        <p className="text-xs text-slate-500 mb-4">
                            Realizada em: {new Date(insp.date).toLocaleDateString('pt-BR')}
                        </p>
                        
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                            <div className="bg-red-900/20 text-red-500 p-2 rounded">
                                <FileText size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-slate-300 font-medium truncate">{filenameDisplay}</p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                   {insp.pdfUrl ? (
                                     <span className="text-emerald-500 flex items-center gap-0.5">Salvo na Nuvem <CheckCircle size={10} /></span>
                                   ) : (
                                     <span>Gerado Localmente</span>
                                   )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex gap-2">
                         <button 
                            onClick={(e) => handleDownloadPdf(e, insp)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
                         >
                             {insp.pdfUrl ? <ExternalLink size={16} /> : <Download size={16} />}
                             {insp.pdfUrl ? 'Abrir' : 'Baixar'}
                         </button>

                         <button
                             onClick={(e) => handleShare(e, insp)}
                             className="p-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-amber-400 rounded-lg border border-slate-700 transition-colors"
                             title="Compartilhar Link"
                         >
                             <Share2 size={16} />
                         </button>

                         <button
                             onClick={(e) => {
                                 e.stopPropagation(); 
                                 onDelete(insp.id);
                             }}
                             className="p-2 bg-slate-800 text-slate-400 hover:bg-red-900/30 hover:text-red-400 rounded-lg border border-slate-700 transition-colors"
                             title="Apagar Registro"
                         >
                             <Trash2 size={16} />
                         </button>
                    </div>
                </div>
             );
            })}

             {completedInspections.length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-900 rounded-xl border-dashed border-2 border-slate-800 text-slate-500">
                <Archive className="mx-auto mb-2 opacity-20" size={48} />
                <p>Nenhum laudo concluído ainda.</p>
                <p className="text-sm">Finalize uma vistoria para gerar o PDF.</p>
              </div>
            )}
          </div>
      )}

    </div>
  );
};