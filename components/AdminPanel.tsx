
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Inspection } from '../types';
import { LayoutDashboard, FileText, Users, LogOut, Search, Download, RefreshCw, Terminal, Check, Mail, Lock, Database, Clock, ChevronRight, ShieldAlert, MapPin } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

export const AdminPanel: React.FC<Props> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inspections' | 'users'>('dashboard');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // User Tools State
  const [targetEmail, setTargetEmail] = useState('');
  const [generatedSql, setGeneratedSql] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setConnectionStatus('checking');
    try {
        const { data, error } = await supabase
            .from('inspections')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            setConnectionStatus('error');
            throw error;
        }

        setConnectionStatus('connected');

        if (data) {
             const mapped: Inspection[] = data.map((item: any) => ({
                id: item.id,
                inspectorName: item.inspector_name || 'Desconhecido',
                address: item.address,
                clientName: item.client_name,
                clientEmail: item.client_email,
                date: item.date,
                type: item.type,
                propertyType: item.property_type || 'residencial',
                status: item.status,
                pdfUrl: item.pdf_url,
                rooms: item.rooms || [],
                meters: [],
                keys: []
            }));
            setInspections(mapped);
        }
    } catch (err) {
        console.error("Erro ao buscar dados:", err);
    } finally {
        setIsLoading(false);
    }
  };

  const filteredInspections = inspections.filter(i => 
    i.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.inspectorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Split for Dashboard
  const activeInspections = inspections.filter(i => i.status !== 'concluida');
  const completedInspections = inspections.filter(i => i.status === 'concluida');

  // --- USER TOOLS LOGIC ---
  const sendPasswordReset = async () => {
    if (!targetEmail) return;
    setActionLoading(true);
    setActionMessage('');
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
            redirectTo: window.location.origin,
        });
        if (error) throw error;
        setActionMessage('✅ Email de redefinição enviado com sucesso!');
    } catch (err: any) {
        setActionMessage(`❌ Erro: ${err.message}`);
    } finally {
        setActionLoading(false);
    }
  };

  const generateConfirmEmailSql = () => {
      if (!targetEmail) return;
      const sql = `UPDATE auth.users SET email_confirmed_at = now() WHERE email = '${targetEmail}';`;
      setGeneratedSql(sql);
  };

  const generateProPlanSql = () => {
      if (!targetEmail) return;
      const sql = `UPDATE auth.users SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{subscription_status}', '"paid"') WHERE email = '${targetEmail}';`;
      setGeneratedSql(sql);
  };

  const generateTrialResetSql = () => {
      if (!targetEmail) return;
      const sql = `UPDATE auth.users SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{subscription_status}', '"trial"'), raw_user_meta_data = jsonb_set(raw_user_meta_data, '{trial_start}', to_jsonb(to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))) WHERE email = '${targetEmail}';`;
      setGeneratedSql(sql);
  };

  const generateAddGeoColumnSql = () => {
      const sql = `ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS geolocation jsonb;`;
      setGeneratedSql(sql);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setActionMessage('✅ Copiado! Execute no Supabase > SQL Editor.');
      setTimeout(() => setActionMessage(''), 3000);
  };

  // SQL SEGURANÇA CORRETA
  const secureRlsSql = `-- 1. Remove a política pública insegura (MUITO IMPORTANTE)
DROP POLICY IF EXISTS "Permitir leitura publica (Admin)" ON "public"."inspections";

-- 2. Permite que usuários vejam APENAS seus próprios dados
DROP POLICY IF EXISTS "Usuarios veem proprios dados" ON "public"."inspections";
CREATE POLICY "Usuarios veem proprios dados" ON "public"."inspections"
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- 3. Permite que o email do Admin veja TUDO
DROP POLICY IF EXISTS "Admin ve tudo" ON "public"."inspections";
CREATE POLICY "Admin ve tudo" ON "public"."inspections"
FOR SELECT TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@vistorilar.com');`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-100">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold flex items-center gap-2">
                <span className="bg-indigo-600 text-white p-1 rounded text-sm">AD</span> 
                VistoriLar
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                <p className="text-xs text-slate-500">
                    {connectionStatus === 'connected' ? 'Banco Conectado' : 'Verificando Conexão...'}
                </p>
            </div>
        </div>

        <nav className="flex-grow p-4 space-y-2">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-900' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
                onClick={() => setActiveTab('inspections')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inspections' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-900' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                <FileText size={18} /> Vistorias (PDFs)
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-900' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                <Users size={18} /> Gestão de Usuários
            </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
            >
                <LogOut size={18} /> Sair
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto h-screen bg-slate-950">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-100">Visão Geral</h2>
                        <p className="text-slate-400 text-sm mt-1">Bem-vindo, Administrador.</p>
                    </div>
                    <button onClick={fetchData} className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Atualizar Dados">
                        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* Security Warning Box */}
                <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-xl relative overflow-hidden shadow-lg">
                    <div className="flex items-start gap-4 z-10 relative">
                        <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0">
                            <ShieldAlert size={24} />
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg text-slate-100">Segurança do Banco de Dados</h3>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                <strong>Atenção:</strong> Se você usou o comando SQL anterior ("Permitir leitura publica"), seus dados estão expostos. 
                                Copie e execute o código abaixo no Supabase para garantir que <strong>apenas o admin</strong> veja tudo e os <strong>usuários vejam apenas seus próprios dados</strong>.
                            </p>
                            
                            <div className="mt-4 bg-black/50 rounded-lg border border-indigo-500/20 p-4 font-mono text-xs text-indigo-300 relative group">
                                <pre>{secureRlsSql}</pre>
                                <button 
                                    onClick={() => copyToClipboard(secureRlsSql)}
                                    className="absolute top-2 right-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white px-2 py-1 rounded text-xs transition-colors"
                                >
                                    Copiar SQL Seguro
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">
                                * Certifique-se de que o usuário 'admin@vistorilar.com' existe no Authentication do Supabase.
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText size={80} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total de Vistorias</p>
                        <h3 className="text-4xl font-bold text-slate-100 mt-2">{inspections.length}</h3>
                        <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-full"></div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Check size={80} className="text-emerald-500" />
                        </div>
                        <p className="text-emerald-500/80 text-sm font-medium uppercase tracking-wider">Concluídas</p>
                        <h3 className="text-4xl font-bold text-slate-100 mt-2">{completedInspections.length}</h3>
                        <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: inspections.length ? `${(completedInspections.length / inspections.length) * 100}%` : '0%' }}></div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock size={80} className="text-amber-500" />
                        </div>
                        <p className="text-amber-500/80 text-sm font-medium uppercase tracking-wider">Em Andamento</p>
                        <h3 className="text-4xl font-bold text-slate-100 mt-2">{activeInspections.length}</h3>
                        <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: inspections.length ? `${(activeInspections.length / inspections.length) * 100}%` : '0%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Active Inspections Table */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                    <Clock size={20} />
                                </div>
                                Em Progresso
                            </h3>
                            <span className="bg-amber-900/30 text-amber-400 text-xs px-2 py-1 rounded-full font-bold">{activeInspections.length}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-400">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Data</th>
                                        <th className="px-6 py-4 font-medium">Imóvel & Cliente</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {activeInspections.length > 0 ? activeInspections.slice(0, 5).map(insp => (
                                        <tr key={insp.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                                                {new Date(insp.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-200">{insp.address}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{insp.clientName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                                    {insp.inspectorName}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-600 italic">Nenhuma vistoria pendente no momento.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {activeInspections.length > 0 && (
                            <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
                                <button onClick={() => setActiveTab('inspections')} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1">
                                    Ver todas <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Completed Inspections Table */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                    <Check size={20} />
                                </div>
                                Finalizadas
                            </h3>
                            <span className="bg-emerald-900/30 text-emerald-400 text-xs px-2 py-1 rounded-full font-bold">{completedInspections.length}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-400">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Data</th>
                                        <th className="px-6 py-4 font-medium">Imóvel</th>
                                        <th className="px-6 py-4 font-medium text-right">Laudo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {completedInspections.length > 0 ? completedInspections.slice(0, 5).map(insp => (
                                        <tr key={insp.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                                                {new Date(insp.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-200">
                                                {insp.address}
                                                <div className="text-xs text-emerald-500/70 mt-0.5 flex items-center gap-1">
                                                    <Check size={10} /> Concluída
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                 {insp.pdfUrl ? (
                                                    <a 
                                                        href={insp.pdfUrl} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg transition-colors border border-indigo-500/20 text-xs font-medium"
                                                    >
                                                        <FileText size={14} /> Abrir PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-600 text-xs italic">Local</span>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-600 italic">Nenhum histórico disponível.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {completedInspections.length > 0 && (
                            <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
                                <button onClick={() => setActiveTab('inspections')} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1">
                                    Ver todas <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* ... (rest of the file remains similar but updated to remove the unsafe sql prompt) ... */}
        {activeTab === 'inspections' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-100">Todas as Vistorias</h2>
                    <button onClick={fetchData} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por endereço, cliente ou vistoriador..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                 {/* ...Table... */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-300 uppercase bg-slate-800/80 border-b border-slate-700">
                                <tr>
                                    <th className="px-4 py-4 font-semibold">Data</th>
                                    <th className="px-4 py-4 font-semibold">Endereço</th>
                                    <th className="px-4 py-4 font-semibold">Cliente</th>
                                    <th className="px-4 py-4 font-semibold">Vistoriador</th>
                                    <th className="px-4 py-4 font-semibold">Tipo</th>
                                    <th className="px-4 py-4 font-semibold">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredInspections.map(insp => (
                                    <tr key={insp.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap text-slate-300">{new Date(insp.date).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-4 font-medium text-slate-200">{insp.address}</td>
                                        <td className="px-4 py-4">{insp.clientName}</td>
                                        <td className="px-4 py-4 text-indigo-400">{insp.inspectorName}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wide ${insp.type === 'entrada' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-amber-900/30 text-amber-400'}`}>
                                                {insp.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {insp.pdfUrl ? (
                                                <a 
                                                    href={insp.pdfUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-slate-300 hover:text-white hover:underline"
                                                >
                                                    <Download size={16} /> <span className="hidden sm:inline">Baixar</span>
                                                </a>
                                            ) : (
                                                <span className="text-slate-600 italic text-xs">Sem PDF</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredInspections.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                            Nenhuma vistoria encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
        
        {/* Users Tab remains as is */}
        {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold text-slate-100">Ferramentas de Usuário</h2>
                
                <div className="bg-indigo-900/10 border border-indigo-900/30 p-4 rounded-xl text-indigo-400 text-sm flex items-start gap-3">
                    <Database className="flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="font-bold mb-1">Painel SQL Helper</p>
                        <p className="opacity-80">
                            Use estas ferramentas para gerar comandos de manutenção.
                        </p>
                    </div>
                </div>
                 <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-lg">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email do Usuário</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="email"
                            placeholder="usuario@exemplo.com"
                            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 font-mono"
                            value={targetEmail}
                            onChange={e => setTargetEmail(e.target.value)}
                        />
                    </div>
                    {/* ... (keeping existing user tools buttons) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                         <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/30 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                                    <Lock size={18} className="text-amber-500" /> Redefinir Senha
                                </h3>
                                <p className="text-xs text-slate-400 mb-4">Envia um email automático.</p>
                            </div>
                            <button onClick={sendPasswordReset} disabled={!targetEmail || actionLoading} className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <Mail size={16} />} Enviar
                            </button>
                        </div>
                        <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/30">
                             <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2"><Terminal size={18} /> SQL</h3>
                             <div className="grid grid-cols-1 gap-3">
                                <button onClick={generateConfirmEmailSql} disabled={!targetEmail} className="w-full py-2 px-3 bg-slate-700 rounded-lg text-xs">Confirmar Email</button>
                                <button onClick={generateProPlanSql} disabled={!targetEmail} className="w-full py-2 px-3 bg-slate-700 rounded-lg text-xs">Plano PRO</button>
                                <button onClick={generateTrialResetSql} disabled={!targetEmail} className="w-full py-2 px-3 bg-slate-700 rounded-lg text-xs">Reset Trial</button>
                                <button onClick={generateAddGeoColumnSql} className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1">
                                    <MapPin size={12} /> Add Geo Column
                                </button>
                            </div>
                        </div>
                    </div>
                    {generatedSql && (
                        <div className="mt-8 bg-black/50 p-4 rounded-lg border border-slate-700 relative group">
                            <code className="font-mono text-xs text-emerald-400 break-all block">{generatedSql}</code>
                            <button 
                                onClick={() => copyToClipboard(generatedSql)}
                                className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-xs px-2 py-1 rounded text-white"
                            >
                                Copiar
                            </button>
                        </div>
                    )}
                    {actionMessage && <div className="mt-4 text-emerald-400 text-center text-sm">{actionMessage}</div>}
                </div>
            </div>
        )}

      </main>
    </div>
  );
};
