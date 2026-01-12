import React from 'react';
import { Calendar, Home, CheckCircle, Clock, Plus } from 'lucide-react';
import { Inspection } from '../types';

interface Props {
  inspections: Inspection[];
  onSelect: (id: string) => void;
  onNew: () => void;
}

export const InspectionList: React.FC<Props> = ({ inspections, onSelect, onNew }) => {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Minhas Vistorias</h1>
          <p className="text-slate-500">Gerencie sua agenda e sincronize dados.</p>
        </div>
        <button 
          onClick={onNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} />
          <span className="hidden md:inline">Nova Vistoria</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inspections.map((insp) => (
          <div 
            key={insp.id}
            onClick={() => onSelect(insp.id)}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide
                ${insp.type === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {insp.type}
              </span>
              <span className={`flex items-center gap-1 text-xs font-medium
                ${insp.status === 'concluida' ? 'text-green-600' : 'text-slate-500'}`}>
                {insp.status === 'concluida' ? <CheckCircle size={14} /> : <Clock size={14} />}
                {insp.status.replace('_', ' ')}
              </span>
            </div>
            
            <h3 className="font-bold text-slate-800 mb-1 truncate">{insp.address}</h3>
            <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
              <Home size={14} /> {insp.clientName}
            </p>

            <div className="flex items-center justify-between text-sm text-slate-400 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(insp.date).toLocaleDateString('pt-BR')}
              </div>
              <div className="text-xs">
                 {insp.rooms.length} cômodos
              </div>
            </div>
          </div>
        ))}
        
        {inspections.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
            <p className="text-slate-400 mb-2">Nenhuma vistoria agendada.</p>
            <button onClick={onNew} className="text-blue-600 font-medium hover:underline">
              Criar primeira vistoria
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
