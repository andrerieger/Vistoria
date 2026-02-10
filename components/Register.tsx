
import React, { useState } from 'react';
import { Home, Check, User, Lock, Mail, Phone, ArrowRight, Loader2, CheckCircle, Award, Eye, EyeOff, Briefcase, Key, HardHat, Ruler } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Profession } from '../types';

interface Props {
  onRegister: () => void;
  onSwitchToLogin: () => void;
  onViewPrivacy: () => void;
}

export const Register: React.FC<Props> = ({ onSwitchToLogin, onViewPrivacy }) => {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Profession, Step 2: Form
  const [profession, setProfession] = useState<Profession>('corretor');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    creci: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const getProfessionalIdLabel = () => {
    switch (profession) {
      case 'corretor': return 'Número do CRECI';
      case 'engenheiro': return 'Número do CREA';
      case 'arquiteto': return 'Número do CAU';
      default: return 'Documento Profissional (Opcional)';
    }
  };

  const getProfessionTitle = () => {
      switch (profession) {
          case 'corretor': return 'Corretor de Imóveis';
          case 'engenheiro': return 'Engenheiro';
          case 'arquiteto': return 'Arquiteto';
          default: return 'Vistoriador';
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      // 1. Sign up with Supabase Auth including Subscription Metadata
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            creci: formData.creci, // Save optional ID to metadata (generic field)
            profession: profession, // Save profession
            subscription_status: 'trial', // Start as trial
            trial_start: new Date().toISOString() // Start counting from now
          }
        }
      });

      if (authError) throw authError;

      if (data.user && !data.session) {
        // User created but email confirmation required
        setSuccessMessage("Conta criada com sucesso! Verifique seu email para confirmar o cadastro antes de fazer login.");
      } 
      // If data.session exists, App.tsx will automatically redirect via onAuthStateChange

    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("security purposes")) {
          setError("Muitas tentativas recentes. Verifique se já recebeu o email de confirmação ou aguarde alguns minutos.");
      } else {
          setError(err.message || "Erro ao criar conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-900/50">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Quase lá!</h2>
                <p className="text-slate-400 mb-8">{successMessage}</p>
                <button 
                    onClick={onSwitchToLogin}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-700 transition-colors"
                >
                    Ir para Login
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 text-center border-b border-slate-800 bg-slate-900/50">
          <div className="flex flex-col items-center justify-center mb-6 scale-110">
             <div className="inline-flex items-center gap-3 text-3xl font-bold">
                <div className="relative">
                    <Home className="text-amber-600" size={40} />
                    <div className="absolute -bottom-1 -right-2 bg-slate-900 rounded-full border-4 border-slate-900 p-0.5">
                        <Check className="text-emerald-500" size={16} strokeWidth={4} />
                    </div>
                </div>
                <span className="text-slate-100">Vistori<span className="text-amber-500">Lar</span></span>
             </div>
          </div>
          <p className="text-slate-400 text-sm">Inicie seu teste grátis de 7 dias</p>
        </div>

        {/* STEP 1: PROFESSION SELECTOR */}
        {step === 1 && (
            <div className="p-8">
                <h3 className="text-lg font-bold text-slate-100 mb-4 text-center">Qual sua área de atuação?</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => { setProfession('corretor'); setStep(2); }}
                        className="flex flex-col items-center justify-center p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-amber-500 hover:text-amber-500 transition-all group"
                    >
                        <Key size={32} className="text-slate-400 group-hover:text-amber-500 mb-2" />
                        <span className="text-sm font-medium">Corretor</span>
                    </button>
                    
                    <button 
                        onClick={() => { setProfession('engenheiro'); setStep(2); }}
                        className="flex flex-col items-center justify-center p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-amber-500 hover:text-amber-500 transition-all group"
                    >
                        <HardHat size={32} className="text-slate-400 group-hover:text-amber-500 mb-2" />
                        <span className="text-sm font-medium">Engenheiro</span>
                    </button>

                    <button 
                        onClick={() => { setProfession('arquiteto'); setStep(2); }}
                        className="flex flex-col items-center justify-center p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-amber-500 hover:text-amber-500 transition-all group"
                    >
                        <Ruler size={32} className="text-slate-400 group-hover:text-amber-500 mb-2" />
                        <span className="text-sm font-medium">Arquiteto</span>
                    </button>

                    <button 
                        onClick={() => { setProfession('outro'); setStep(2); }}
                        className="flex flex-col items-center justify-center p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:border-amber-500 hover:text-amber-500 transition-all group"
                    >
                        <Briefcase size={32} className="text-slate-400 group-hover:text-amber-500 mb-2" />
                        <span className="text-sm font-medium">Outro</span>
                    </button>
                </div>
                
                <div className="mt-8 text-center pt-6 border-t border-slate-800">
                    <p className="text-slate-400 text-sm">
                        Já possui uma conta?{' '}
                        <button 
                        onClick={onSwitchToLogin}
                        className="text-amber-500 hover:text-amber-400 font-medium hover:underline"
                        >
                        Fazer Login
                        </button>
                    </p>
                </div>
            </div>
        )}

        {/* STEP 2: REGISTRATION FORM */}
        {step === 2 && (
            <>
                <div className="px-8 pt-4 pb-0">
                    <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-amber-500 flex items-center gap-1 mb-2">
                        ← Voltar para seleção
                    </button>
                    <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-2 text-center">
                        <span className="text-xs text-amber-500 font-bold uppercase tracking-wide">Cadastro de {getProfessionTitle()}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-sm p-3 rounded-lg text-center">
                    {error}
                    </div>
                )}
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nome Completo</label>
                    <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="email"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Telefone / WhatsApp</label>
                    <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="tel"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                        {getProfessionalIdLabel()}
                    </label>
                    <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500"
                        placeholder={profession === 'outro' ? 'Opcional' : `Seu ${profession === 'engenheiro' ? 'CREA' : profession === 'arquiteto' ? 'CAU' : 'CRECI'}`}
                        value={formData.creci}
                        onChange={e => setFormData({...formData, creci: e.target.value})}
                        required={profession !== 'outro'}
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Senha</label>
                    <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full pl-10 pr-12 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500"
                        placeholder="Crie uma senha segura"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 mt-4 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Cadastrar e Testar <ArrowRight size={18} /></>}
                </button>
                </form>

                <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800 space-y-3">
                    <p className="text-slate-400 text-sm">
                        Já possui uma conta?{' '}
                        <button 
                        onClick={onSwitchToLogin}
                        className="text-amber-500 hover:text-amber-400 font-medium hover:underline"
                        >
                        Fazer Login
                        </button>
                    </p>
                    <button 
                        onClick={onViewPrivacy}
                        className="text-xs text-slate-600 hover:text-slate-400 underline"
                    >
                        Política de Privacidade
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
