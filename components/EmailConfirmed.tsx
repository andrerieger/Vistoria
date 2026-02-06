import React from 'react';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';

interface Props {
  onContinue: () => void;
}

export const EmailConfirmed: React.FC<Props> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
        
        <div className="flex justify-center mb-6">
            <div className="relative">
                <div className="w-20 h-20 bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-900/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={40} strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1.5 border border-slate-800">
                     <Home size={16} className="text-amber-500" />
                </div>
            </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-100 mb-2">Email Confirmado!</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
            Sua conta foi verificada com sucesso. Agora você tem acesso completo à plataforma VistoriLar.
        </p>

        <button 
            onClick={onContinue}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] group"
        >
            Acessar Plataforma 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};