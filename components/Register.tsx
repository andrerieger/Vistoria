import React, { useState } from 'react';
import { CheckSquare, User, Lock, Mail, Phone, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';

interface Props {
  onRegister: (user: UserType) => void;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<Props> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new user
    const newUser: UserType = {
      id: Date.now().toString(),
      ...formData
    };

    // Save to local storage (Simulation)
    const storedUsers = localStorage.getItem('vistoriapro_users');
    const users: UserType[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Simple check if exists
    if (users.some(u => u.email === newUser.email)) {
      alert("Este email já está cadastrado.");
      return;
    }

    users.push(newUser);
    localStorage.setItem('vistoriapro_users', JSON.stringify(users));

    // Auto login
    onRegister(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-8 text-center border-b border-slate-800 bg-slate-900/50">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-amber-500 mb-2">
            <CheckSquare size={28} />
            VistoriaPro 360
          </div>
          <p className="text-slate-400 text-sm">Crie sua conta de vistoriador</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          
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
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 mt-4 transition-all active:scale-[0.98]"
          >
            Cadastrar
            <ArrowRight size={18} />
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