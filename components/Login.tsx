import React, { useState } from 'react';
import { CheckSquare, User, Lock, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';

interface Props {
  onLogin: (user: UserType) => void;
  onSwitchToRegister: () => void;
}

export const Login: React.FC<Props> = ({ onLogin, onSwitchToRegister }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simulate authentication against localStorage
    const storedUsers = localStorage.getItem('vistoriapro_users');
    const users: UserType[] = storedUsers ? JSON.parse(storedUsers) : [];

    const user = users.find(u => 
      (u.email === identifier || u.name === identifier) && u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Credenciais inválidas. Verifique seus dados ou cadastre-se.');
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
            <label className="text-sm font-medium text-slate-300">Email ou Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500 transition-all"
                placeholder="Digite seu acesso"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
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
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            Entrar
            <ArrowRight size={18} />
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