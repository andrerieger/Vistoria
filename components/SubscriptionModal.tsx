import React, { useState } from 'react';
import { Check, Star, X, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import GooglePayButton from '@google-pay/button-react';

interface Props {
  user: User;
  onClose: () => void;
  onUpgradeSuccess: (updatedUser: User) => void;
}

export const SubscriptionModal: React.FC<Props> = ({ user, onClose, onUpgradeSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Função chamada quando o Google Pay retorna sucesso (token de pagamento gerado)
  const handlePaymentSuccess = async (paymentData: any) => {
    setLoading(true);
    console.log("Payment Data Received:", paymentData);
    
    // NOTA: Em produção, você enviaria paymentData.paymentMethodData.tokenizationData.token
    // para seu backend processar o pagamento com Stripe/MercadoPago.
    // Aqui simulamos a confirmação imediata.

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { subscription_status: 'paid' }
      });

      if (error) throw error;

      if (data.user) {
          const updatedUser: User = {
              ...user,
              subscriptionStatus: 'paid'
          };
          onUpgradeSuccess(updatedUser);
          alert("Pagamento confirmado! Assinatura Vitalícia ativada com sucesso.");
          onClose();
      }

    } catch (error) {
      console.error("Erro ao atualizar usuário", error);
      alert("Erro ao confirmar assinatura no sistema. Entre em contato com o suporte.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (err: any) => {
      console.error("Google Pay Error:", err);
      // Não mostramos alert para cancelamento do usuário, apenas erros reais
      if (err.statusCode !== 'CANCELED') {
          alert("Erro ao conectar com Google Pay.");
      }
  };

  const isExpired = user.subscriptionStatus === 'expired';

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Close Button (Only if not expired, or force upgrade) */}
        {!isExpired && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-2 bg-slate-800/50 rounded-full"
            >
                <X size={24} />
            </button>
        )}

        {/* Left Side: Benefits */}
        <div className="md:w-5/12 bg-slate-950 p-8 flex flex-col justify-center border-r border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-amber-700"></div>
            <div className="relative z-10">
                <div className="w-16 h-16 bg-amber-900/30 text-amber-500 rounded-2xl flex items-center justify-center mb-6 border border-amber-900/50">
                    <Star size={32} fill="currentColor" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100 mb-4">
                    {isExpired ? "Período de Teste Encerrado" : "Torne-se Profissional"}
                </h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    {isExpired 
                        ? "Seus 7 dias grátis acabaram. Para continuar gerando vistorias ilimitadas e profissionais, ative o plano vitalício." 
                        : "Desbloqueie todo o potencial do VistoriLar com uma licença vitalícia e diga adeus às mensalidades."}
                </p>
                
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-300">
                        <Check className="text-emerald-500 flex-shrink-0" size={20} />
                        <span>Vistorias Ilimitadas</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                        <Check className="text-emerald-500 flex-shrink-0" size={20} />
                        <span>Geração de PDF Profissional</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                        <Check className="text-emerald-500 flex-shrink-0" size={20} />
                        <span>Backup em Nuvem</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                        <Check className="text-emerald-500 flex-shrink-0" size={20} />
                        <span>Suporte Prioritário</span>
                    </li>
                    <li className="flex items-center gap-3 text-amber-500 font-bold">
                        <ShieldCheck className="flex-shrink-0" size={20} />
                        <span>Pagamento Único (Sem Mensalidade)</span>
                    </li>
                </ul>
            </div>
            
            {/* Decoration */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side: Plans */}
        <div className="md:w-7/12 p-8 bg-slate-900 flex flex-col justify-center">
            
            {/* Trial Card (Visual Only) */}
            <div className={`mb-6 p-4 rounded-xl border ${isExpired ? 'bg-slate-950 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700'}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-100 flex items-center gap-2">
                            Teste Grátis
                            {!isExpired && <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900">Ativo</span>}
                        </h3>
                        <p className="text-sm text-slate-400">7 dias de acesso completo</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-bold text-slate-200">R$ 0</span>
                    </div>
                </div>
            </div>

            {/* Lifetime Card (Active Selection) */}
            <div className="relative p-6 rounded-xl border-2 border-amber-500 bg-slate-800/50 shadow-xl shadow-amber-900/20">
                <div className="absolute -top-3 right-4 bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    MELHOR ESCOLHA
                </div>
                
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            Acesso Vitalício
                            <Zap className="text-amber-500" size={18} fill="currentColor" />
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">Pague uma vez, use para sempre.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500 line-through">R$ 497,00</p>
                        <p className="text-3xl font-bold text-white">R$ 200,00</p>
                    </div>
                </div>

                <div className="my-6 h-px bg-slate-700"></div>

                <div className="w-full flex flex-col items-center">
                    {loading ? (
                        <div className="w-full py-3 flex items-center justify-center gap-2 text-amber-500">
                             <Loader2 className="animate-spin" size={24} /> Processando...
                        </div>
                    ) : (
                        <div className="w-full h-[50px]">
                            <GooglePayButton
                                environment="TEST"
                                paymentRequest={{
                                    apiVersion: 2,
                                    apiVersionMinor: 0,
                                    allowedPaymentMethods: [
                                    {
                                        type: 'CARD',
                                        parameters: {
                                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                            allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                        },
                                        tokenizationSpecification: {
                                            type: 'PAYMENT_GATEWAY',
                                            parameters: {
                                                gateway: 'example', // Substitua 'example' pelo seu gateway (ex: 'stripe', 'mercadopago')
                                                gatewayMerchantId: 'exampleGatewayMerchantId',
                                            },
                                        },
                                    },
                                    ],
                                    merchantInfo: {
                                        merchantId: '12345678901234567890', // Seu Merchant ID de produção
                                        merchantName: 'VistoriLar',
                                    },
                                    transactionInfo: {
                                        totalPriceStatus: 'FINAL',
                                        totalPriceLabel: 'Total',
                                        totalPrice: '200.00',
                                        currencyCode: 'BRL',
                                        countryCode: 'BR',
                                    },
                                }}
                                onLoadPaymentData={handlePaymentSuccess}
                                onError={handlePaymentError}
                                buttonColor="black"
                                buttonType="buy"
                                buttonSizeMode="fill"
                                style={{ width: '100%', height: '48px' }}
                            />
                        </div>
                    )}
                </div>
                
                <p className="text-center text-xs text-slate-500 mt-4">
                    Pagamento processado pelo Google. Ambiente Seguro.
                </p>
            </div>
            
            {isExpired && (
                <div className="mt-6 text-center">
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-sm underline">
                        Apenas visualizar minhas vistorias existentes
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};