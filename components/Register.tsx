import React, { useState } from 'react';
import { Home, Check, User, Lock, Mail, Phone, ArrowRight, Loader2, CheckCircle, Award } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Props {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<Props> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    creci: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      // 1. Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            creci: formData.creci // Save optional CRECI to metadata
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
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-8 text-center border-b border-slate-800 bg-slate-900/50">
          <div className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
            <div className="relative">
                <Home className="text-blue-600" size={32} />
                <div className="absolute -bottom-1 -right-2 bg-slate-900 rounded-full border-2 border-slate-900 p-0.5">
                    <Check className="text-green-500" size={14} strokeWidth={4} />
                </div>
            </div>
            <span className="text-blue-500">Vistori<span className="text-orange-500">Lar</span></span>
          </div>
          <p className="text-slate-400 text-sm">Crie sua conta de vistoriador</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
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
                CRECI <span className="text-slate-500 text-[10px] font-normal ml-1">(Opcional)</span>
            </label>
            <div className="relative">
              <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500"
                placeholder="Ex: 12345-F"
                value={formData.creci}
                onChange={e => setFormData({...formData, creci: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500"
                placeholder="Crie uma senha segura"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 mt-4 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Cadastrar <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
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
    </div>
  );
};