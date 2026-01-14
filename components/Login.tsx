import React, { useState } from 'react';
import { CheckSquare, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Props {
  onLogin: () => void; // Parent component handles state update via session listener
  onSwitchToRegister: () => void;
}

export const Login: React.FC<Props> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // onLogin is not strictly needed as App.tsx listens to auth state changes,
      // but we keep it for consistency if needed in future
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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-8 text-center border-b border-slate-800 bg-slate-900/50">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-amber-500 mb-2">
            <CheckSquare size={28} />
            VistoriaPro 360
          </div>
          <p className="text-slate-400 text-sm">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500 transition-all"
                placeholder="Sua senha secreta"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
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

        <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
          <p className="text-slate-400 text-sm">
            Não tem uma conta?{' '}
            <button 
              onClick={onSwitchToRegister}
              className="text-amber-500 hover:text-amber-400 font-medium hover:underline"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};