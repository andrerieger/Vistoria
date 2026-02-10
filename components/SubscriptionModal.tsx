
import React, { useState } from 'react';
import { Check, Star, X, Loader2, ShieldCheck, Zap, AlertTriangle, CreditCard, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface Props {
  user: User;
  onClose: () => void;
  onUpgradeSuccess: (updatedUser: User) => void;
}

export const SubscriptionModal: React.FC<Props> = ({ user, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleMercadoPagoCheckout = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // O Mercado Pago precisa saber para onde voltar após o pagamento.
      // Enviamos a URL atual (ex: https://vistorilar.vercel.app)
      const returnUrl = window.location.origin;

      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          email: user.email,
          returnUrl: returnUrl
        }
      });

      if (error) throw error;

      if (data && data.success && data.checkoutUrl) {
          // Redireciona o usuário para o ambiente seguro do Mercado Pago
          window.location.href = data.checkoutUrl;
      } else {
          throw new Error(data?.error || 'Erro ao gerar link de pagamento.');
      }

    } catch (err: any) {
        console.error("Erro checkout:", err);
        setErrorMsg(err.message || "Não foi possível conectar ao Mercado Pago.");
        setLoading(false);
    }
  };

  const isExpired = user.subscriptionStatus === 'expired';

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Container principal com scroll vertical para telas pequenas */}
      <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:flex-row relative custom-scrollbar">
        
        {!isExpired && (
            <button 
                onClick={onClose}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-slate-300 hover:text-white z-50 p-2 bg-slate-950/80 backdrop-blur-sm border border-slate-700/50 rounded-full shadow-lg transition-all active:scale-95"
                title="Fechar"
            >
                <X size={20} />
            </button>
        )}

        {/* Lado Esquerdo: Benefícios */}
        <div className="md:w-5/12 bg-slate-950 p-6 md:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>
            <div className="relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mb-4 md:mb-6 border border-blue-900/50">
                    <Star className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3 md:mb-4">
                    {isExpired ? "Período Encerrado" : "Torne-se Profissional"}
                </h2>
                <p className="text-slate-400 text-sm md:text-base mb-6 md:mb-8 leading-relaxed">
                    Desbloqueie todo o potencial com uma licença vitalícia. Aceitamos Pix, Cartão e Boleto.
                </p>
                
                <ul className="space-y-3 md:space-y-4 text-sm md:text-base">
                    <li className="flex items-center gap-3 text-slate-300">
                        <Check className="text-emerald-500 flex-shrink-0" size={18} />
                        <span>Vistorias Ilimitadas</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                        <Check className="text-emerald-500 flex-shrink-0" size={18} />
                        <span>PDFs Profissionais (Nuvem)</span>
                    </li>
                    <li className="flex items-center gap-3 text-blue-400 font-bold">
                        <ShieldCheck className="flex-shrink-0" size={18} />
                        <span>Pagamento Único via Mercado Pago</span>
                    </li>
                </ul>
            </div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Lado Direito: Pagamento */}
        <div className="md:w-7/12 p-6 md:p-8 bg-slate-900 flex flex-col justify-center">
            
            <div className="relative p-5 md:p-6 rounded-xl border-2 border-blue-500 bg-slate-800/50 shadow-xl shadow-blue-900/20 mt-2 md:mt-0">
                <div className="absolute -top-3 right-4 bg-blue-500 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    MELHOR ESCOLHA
                </div>
                
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                            Acesso Vitalício
                            <Zap className="text-blue-500" size={16} fill="currentColor" />
                        </h3>
                        <p className="text-xs md:text-sm text-slate-400 mt-1">Pix (Aprovação Imediata) ou Cartão.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs md:text-sm text-slate-500 line-through">R$ 497,00</p>
                        <p className="text-2xl md:text-3xl font-bold text-white">R$ 200,00</p>
                    </div>
                </div>

                <div className="my-4 md:my-6 h-px bg-slate-700"></div>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400 text-xs md:text-sm flex items-start gap-2 animate-in fade-in">
                        <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <div className="w-full flex flex-col items-center">
                    <button 
                        onClick={handleMercadoPagoCheckout}
                        disabled={loading}
                        className="w-full h-[50px] md:h-[56px] bg-[#009EE3] hover:bg-[#008CC9] text-white font-bold rounded-xl shadow-lg flex items-center justify-between px-4 md:px-6 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group text-sm md:text-base"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center w-full gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Gerando link...</span>
                            </div>
                        ) : (
                            <>
                                <span className="flex items-center gap-2">
                                    <CreditCard size={20} />
                                    Pagar com Mercado Pago
                                </span>
                                <ArrowRight size={20} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
                
                <div className="text-center text-[10px] md:text-xs text-slate-500 mt-4 flex flex-col gap-1">
                    <p className="flex items-center justify-center gap-1">
                        <ShieldCheck size={12} /> Ambiente seguro do Mercado Pago.
                    </p>
                    <p>Você será redirecionado e voltará automaticamente.</p>
                </div>
            </div>
            
            {isExpired && (
                <div className="mt-4 md:mt-6 text-center">
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs md:text-sm underline py-2">
                        Apenas visualizar dados existentes
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
