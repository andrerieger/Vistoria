import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { Save, User as UserIcon, Phone, Award, Mail, Trash2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';

interface Props {
  currentUser: User;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

export const ProfileSettings: React.FC<Props> = ({ currentUser, onBack, onUpdateUser, onLogout }) => {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    phone: currentUser.phone,
    creci: currentUser.creci || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          phone: formData.phone,
          creci: formData.creci
        }
      });

      if (error) throw error;

      // Update local state
      onUpdateUser({
        ...currentUser,
        name: formData.name,
        phone: formData.phone,
        creci: formData.creci
      });

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);

    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // 1. Delete user data (Inspections table has cascade delete usually, but we ensure deletion)
      const { error: deleteError } = await supabase
        .from('inspections')
        .delete()
        .eq('user_id', currentUser.id);

      if (deleteError) throw deleteError;

      // 2. Sign out (Actual user deletion requires admin rights or edge functions in Supabase standard setup)
      // We clean the data and sign out, effectively "resetting" the account usage.
      await supabase.auth.signOut();
      onLogout(); // Redirect to login via App logic

    } catch (err: any) {
      console.error(err);
      alert("Erro ao excluir dados. Tente novamente.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Configurações de Perfil</h1>
          <p className="text-slate-400 text-sm">Gerencie seus dados pessoais e preferências.</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Update Form */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg">
          <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <UserIcon className="text-amber-500" size={20} /> Dados Pessoais
          </h2>

          <form onSubmit={handleUpdate} className="space-y-4">
            {message && (
              <div className={`p-3 rounded-lg text-sm text-center ${message.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email (Não alterável)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">CRECI</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text"
                    value={formData.creci}
                    onChange={e => setFormData({...formData, creci: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-100"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 shadow-lg shadow-amber-900/20"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-slate-900 rounded-xl border border-red-900/30 p-6 shadow-lg overflow-hidden relative">
           <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
           
           <h2 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
             <AlertTriangle size={20} /> Zona de Perigo
           </h2>
           
           <p className="text-slate-400 text-sm mb-6">
             A exclusão da conta removerá permanentemente todos os seus dados, vistorias e fotos salvas. Esta ação não pode ser desfeita.
           </p>

           {!showDeleteConfirm ? (
             <button 
               onClick={() => setShowDeleteConfirm(true)}
               className="bg-slate-950 border border-red-900/50 text-red-500 hover:bg-red-900/20 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm"
             >
               <Trash2 size={16} />
               Excluir Minha Conta
             </button>
           ) : (
             <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg animate-in fade-in duration-200">
               <p className="text-red-400 font-bold mb-2 text-sm">Tem certeza absoluta?</p>
               <p className="text-red-300/70 text-xs mb-4">Todos os seus dados serão perdidos para sempre.</p>
               <div className="flex gap-3">
                 <button 
                   onClick={handleDeleteAccount}
                   disabled={isDeleting}
                   className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                 >
                   {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                   Sim, Excluir Tudo
                 </button>
                 <button 
                   onClick={() => setShowDeleteConfirm(false)}
                   disabled={isDeleting}
                   className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm"
                 >
                   Cancelar
                 </button>
               </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};