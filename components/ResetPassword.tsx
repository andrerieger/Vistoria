import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Save, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Senha atualizada com sucesso! Redirecionando...' });
      
      // Redirect to home/login after short delay
      setTimeout(() => {
          window.location.href = '/';
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro ao atualizar senha. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-900/50">
                <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Redefinir Senha</h2>
            <p className="text-slate-400 text-sm mt-2">Digite sua nova senha abaixo.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
            {message && (
              <div className={`p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2 ${message.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {message.type === 'success' && <CheckCircle size={16} />}
                {message.text}
              </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nova Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100 placeholder-slate-500 transition-all"
                        placeholder="Nova senha segura"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        minLength={6}
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
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Salvar Nova Senha <Save size={18} /></>}
            </button>
        </form>
      </div>
    </div>
  );
};