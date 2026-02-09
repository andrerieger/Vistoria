import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<Props> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulating a check delay
    setTimeout(() => {
        if (username === 'andre_rieger' && password === '12131415') {
            onLoginSuccess();
        } else {
            setError('Credenciais inválidas.');
            setIsLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-800 shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-900/50">
                <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Acesso Admin</h2>
            <p className="text-slate-400 text-sm mt-2">Área restrita para gestão.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Usuário</label>
                <input 
                    type="text"
                    required
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 font-mono text-sm"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="andre_rieger"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input 
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 font-mono text-sm"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
            >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Entrar no Painel <ArrowRight size={18} /></>}
            </button>

            <button 
                type="button"
                onClick={onBack}
                className="w-full text-slate-500 hover:text-slate-300 text-sm py-2 flex items-center justify-center gap-2"
            >
                <ArrowLeft size={14} /> Voltar para o App
            </button>
        </form>
      </div>
    </div>
  );
};