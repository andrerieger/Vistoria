import React, { useState } from 'react';
import { Home, Check, User, Lock, ArrowRight, Loader2, Eye, EyeOff, Key, ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Props {
  onLogin: () => void;
  onSwitchToRegister: () => void;
  onViewPrivacy: () => void;
  onAdminLogin: () => void; // Nova prop para login de admin
}

export const Login: React.FC<Props> = ({ onSwitchToRegister, onViewPrivacy, onAdminLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isRecovering, setIsRecovering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Regular Supabase Login
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // onLogin is handled by auth state listener in App.tsx
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Email not confirmed') {
        setError('Email pendente de confirmação. Verifique sua caixa de entrada.');
      } else if (err.message === 'Invalid login credentials') {
        setError('Email ou senha incorretos.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });

        if (error) throw error;

        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada (e spam) para redefinir sua senha.');
    } catch (err: any) {
        console.error(err);
        setError('Erro ao enviar email de recuperação. Verifique se o email está correto.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header Section */}
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
          <p className="text-slate-400 text-sm">
            {isRecovering ? 'Recupere o acesso à sua conta' : 'Acesse sua conta para continuar'}
          </p>
        </div>

        {/* --- RECOVERY FORM --- */}
        {isRecovering ? (
             <form onSubmit={handleRecovery} className="p-8 space-y-6">
                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-sm p-3 rounded-lg text-center">
                    {error}
                    </div>
                )}
                {success && (
                    <div className="bg-emerald-900/20 border border-emerald-900/50 text-emerald-400 text-sm p-3 rounded-lg text-center">
                    {success}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email Cadastrado</label>
                    <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="email"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500 transition-all"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading || !!success}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Enviar Link de Recuperação <Key size={18} /></>}
                </button>

                <button 
                    type="button"
                    onClick={() => setIsRecovering(false)}
                    className="w-full text-slate-400 hover:text-white text-sm font-medium flex items-center justify-center gap-2 py-2"
                >
                    <ArrowLeft size={16} /> Voltar para o Login
                </button>
             </form>
        ) : (
        /* --- LOGIN FORM --- */
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
                <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-sm p-3 rounded-lg text-center">
                {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email ou Usuário</label>
                <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500 transition-all"
                    placeholder="email@exemplo.com ou usuario"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoCapitalize="none"
                />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-300">Senha</label>
                    <button 
                        type="button"
                        onClick={() => setIsRecovering(true)}
                        className="text-xs text-amber-500 hover:text-amber-400 hover:underline"
                    >
                        Esqueci minha senha
                    </button>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500 transition-all"
                        placeholder="Sua senha secreta"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
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
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Entrar <ArrowRight size={18} /></>}
            </button>
            </form>
        )}

        {/* Footer */}
        {!isRecovering && (
            <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800 space-y-3">
            <p className="text-slate-400 text-sm">
                Não tem uma conta?{' '}
                <button 
                onClick={onSwitchToRegister}
                className="text-amber-500 hover:text-amber-400 font-medium hover:underline"
                >
                Criar conta
                </button>
            </p>
            <button 
                onClick={onViewPrivacy}
                className="text-xs text-slate-600 hover:text-slate-400 underline"
            >
                Política de Privacidade
            </button>
            </div>
        )}
      </div>
    </div>
  );
};