import React, { useState, useEffect } from 'react';
import { InspectionList } from './components/InspectionList';
import { RoomDetail } from './components/RoomDetail';
import { FinalizeInspection } from './components/FinalizeInspection';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Inspection, Room, InspectionType, User } from './types';
import { ROOM_TEMPLATES } from './constants';
import { ArrowLeft, LayoutGrid, Zap, Pencil, X, Calendar, Clock, Plus, Check, Trash2, Mail, FileText, LogOut, Loader2, Home } from 'lucide-react';
import { generateInspectionPDF, getInspectionPDFBlob } from './services/pdfGenerator';
import { supabase } from './services/supabase';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

// Safe ID generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [view, setView] = useState<'list' | 'detail'>('list');
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'finalize'>('rooms');
  
  // Custom Room State
  const [isAddingCustomRoom, setIsAddingCustomRoom] = useState(false);
  const [customRoomName, setCustomRoomName] = useState('');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Delete Confirmation State
  const [inspectionToDelete, setInspectionToDelete] = useState<string | null>(null);

  // formData now handles date and time separately
  const [formData, setFormData] = useState({ 
    address: '', 
    clientName: '', 
    clientEmail: '',
    type: 'entrada' as InspectionType,
    date: '', 
    time: '' 
  });

  // Data State
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // --- SUPABASE AUTH & DATA FETCHING ---

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data.session;
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Usuário',
          phone: session.user.user_metadata.phone || '',
          creci: session.user.user_metadata.creci || ''
        };
        setCurrentUser(user);
        fetchInspections();
      }
      setIsLoadingAuth(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Usuário',
              phone: session.user.user_metadata.phone || '',
              creci: session.user.user_metadata.creci || ''
            };
            setCurrentUser(user);
            fetchInspections();
        } else {
            setCurrentUser(null);
            setInspections([]);
        }
        setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInspections = async () => {
    setIsLoadingData(true);
    try {
        const { data, error } = await supabase
            .from('inspections')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
            // Map Supabase columns to app Inspection type
            const mapped: Inspection[] = data.map((item: any) => ({
                id: item.id,
                address: item.address,
                clientName: item.client_name,
                clientEmail: item.client_email,
                date: item.date,
                type: item.type as InspectionType,
                status: item.status,
                pdfUrl: item.pdf_url,
                rooms: item.rooms || [],
                meters: item.meters || [],
                keys: item.keys || []
            }));
            setInspections(mapped);
        }
    } catch (error) {
        console.error("Error fetching inspections:", error);
    } finally {
        setIsLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthView('login');
  };

  // --- APP LOGIC ---

  // Sort inspections by date (Ascending - Nearest/Oldest first)
  const sortedInspections = [...inspections].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const activeInspection = inspections.find(i => i.id === activeInspectionId);

  const handleSelectInspection = (id: string) => {
    setActiveInspectionId(id);
    setView('detail');
  };

  const handleDeleteInspection = (id: string) => {
    setInspectionToDelete(id);
  };

  const confirmDelete = async () => {
    if (inspectionToDelete) {
      // Optimistic Update
      setInspections(prev => prev.filter(i => i.id !== inspectionToDelete));
      
      try {
          const { error } = await supabase.from('inspections').delete().eq('id', inspectionToDelete);
          if(error) throw error;
      } catch (err) {
          console.error("Error deleting", err);
          alert("Erro ao excluir. Recarregue a página.");
          fetchInspections(); // Revert on error
      }

      if (activeInspectionId === inspectionToDelete) {
        setActiveInspectionId(null);
        setView('list');
      }
      setInspectionToDelete(null);
    }
  };

  // Helper to get local date parts
  const getLocalDateParts = (isoString?: string) => {
    const dateObj = isoString ? new Date(isoString) : new Date();
    dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
    const isoLocal = dateObj.toISOString();
    return {
        date: isoLocal.slice(0, 10),
        time: isoLocal.slice(11, 16)
    };
  };

  // Open modal for creation
  const handleOpenCreateModal = () => {
    const { date, time } = getLocalDateParts();
    setFormData({ 
      address: '', 
      clientName: '', 
      clientEmail: '',
      type: 'entrada',
      date, 
      time 
    });
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = () => {
    if (activeInspection) {
      const { date, time } = getLocalDateParts(activeInspection.date);
      setFormData({ 
        address: activeInspection.address, 
        clientName: activeInspection.clientName,
        clientEmail: activeInspection.clientEmail || '',
        type: activeInspection.type,
        date,
        time
      });
      setFormMode('edit');
      setIsFormOpen(true);
    }
  };

  // Handle Form Submit (Create or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address.trim() || !formData.clientName.trim() || !formData.date || !formData.time) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!currentUser) return;

    const inspectionDate = new Date(`${formData.date}T${formData.time}`).toISOString();

    try {
        if (formMode === 'create') {
            const newId = generateId();
            const newInspection: Inspection = {
                id: newId,
                address: formData.address,
                clientName: formData.clientName,
                clientEmail: formData.clientEmail,
                date: inspectionDate,
                type: formData.type,
                status: 'em_andamento',
                rooms: [],
                meters: [],
                keys: []
            };

            // DB Insert
            const { error } = await supabase.from('inspections').insert({
                id: newId,
                user_id: currentUser.id,
                address: newInspection.address,
                client_name: newInspection.clientName,
                client_email: newInspection.clientEmail,
                date: newInspection.date,
                type: newInspection.type,
                status: newInspection.status,
                rooms: [],
                meters: [],
                keys: []
            });

            if (error) throw error;

            setInspections([newInspection, ...inspections]);
            setActiveInspectionId(newId);
            setView('detail');
        } else {
            if (activeInspectionId) {
                // Optimistic Update
                setInspections(prev => prev.map(i => 
                    i.id === activeInspectionId 
                    ? { 
                        ...i, 
                        address: formData.address, 
                        clientName: formData.clientName, 
                        clientEmail: formData.clientEmail,
                        type: formData.type,
                        date: inspectionDate 
                        } 
                    : i
                ));

                // DB Update
                const { error } = await supabase.from('inspections').update({
                    address: formData.address,
                    client_name: formData.clientName,
                    client_email: formData.clientEmail,
                    date: inspectionDate,
                    type: formData.type
                }).eq('id', activeInspectionId);

                if(error) throw error;
            }
        }
        setIsFormOpen(false);
    } catch (err: any) {
        console.error("Error saving:", err);
        alert(`Erro ao salvar: ${err.message}`);
    }
  };

  // Generic Update Function used by sub-components
  const updateInspection = async (updates: Partial<Inspection>) => {
    if (!activeInspectionId) return;

    // Optimistic Update
    setInspections(prev => prev.map(i => 
      i.id === activeInspectionId ? { ...i, ...updates } : i
    ));

    // Prepare DB updates object (mapping camelCase to snake_case if needed)
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.pdfUrl) dbUpdates.pdf_url = updates.pdfUrl; // Handle PDF URL update
    if (updates.rooms) dbUpdates.rooms = updates.rooms; // JSONB
    if (updates.meters) dbUpdates.meters = updates.meters; // JSONB
    if (updates.keys) dbUpdates.keys = updates.keys; // JSONB

    if (Object.keys(dbUpdates).length > 0) {
        try {
            const { error } = await supabase
                .from('inspections')
                .update(dbUpdates)
                .eq('id', activeInspectionId);
            
            if (error) console.error("Background sync error:", error);
        } catch (err) {
            console.error("Update error:", err);
        }
    }
  };

  const addRoom = (templateName: string, items: string[] = []) => {
    const count = activeInspection?.rooms.filter(r => r.name.startsWith(templateName)).length || 0;
    const displayName = count > 0 ? `${templateName} ${count + 1}` : templateName;

    const newRoom: Room = {
        id: generateId(),
        name: displayName,
        items: items.map(itemName => ({
            id: generateId(),
            name: itemName,
            condition: 'novo',
            description: '',
            photos: []
        }))
    };

    if (activeInspection) {
        updateInspection({ rooms: [...activeInspection.rooms, newRoom] });
    }
  };
  
  const handleAddCustomRoom = () => {
    if(!customRoomName.trim()) {
        setIsAddingCustomRoom(false);
        return;
    }
    addRoom(customRoomName.trim(), []);
    setCustomRoomName('');
    setIsAddingCustomRoom(false);
  };

  const updateRoom = (updatedRoom: Room) => {
    if (!activeInspection) return;
    updateInspection({
        rooms: activeInspection.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
    });
  };

  const removeRoom = (roomId: string) => {
    if (!activeInspection) return;
    updateInspection({
        rooms: activeInspection.rooms.filter(r => r.id !== roomId)
    });
  };

  const handleFinish = async () => {
    if (!currentUser) {
        alert("Sessão inválida ou expirada. Recarregue a página.");
        return;
    }
    if (!activeInspection) return;
    
    // START LOADING IMMEDIATELY
    setIsLoadingData(true);

    try {
        // 1. GENERATE PDF LOCALLY FIRST (Ensure user gets the file no matter what)
        try {
           generateInspectionPDF(activeInspection, currentUser);
        } catch (pdfErr: any) {
           console.error("Local PDF gen error:", pdfErr);
           // Continue anyway to try saving status
        }

        let publicUrl: string | undefined = undefined;
        let uploadSuccess = false;

        // 2. ATTEMPT CLOUD UPLOAD (Best Effort)
        try {
            const pdfBlob = getInspectionPDFBlob(activeInspection, currentUser);
            const fileName = `${activeInspection.type}_${activeInspection.id}_${Date.now()}.pdf`;
            
            // Try upload
            const { error: uploadError } = await supabase.storage
                .from('reports')
                .upload(fileName, pdfBlob, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (!uploadError) {
                const { data: urlData } = supabase.storage
                    .from('reports')
                    .getPublicUrl(fileName);
                publicUrl = urlData.publicUrl;
                uploadSuccess = true;
            }
        } catch (storageErr) {
            console.warn("Storage upload skipped/failed:", storageErr);
        }

        // 3. UPDATE DATABASE
        // Try to save PDF URL, if that fails (e.g. column missing), save just status
        let dbUpdated = false;
        
        if (publicUrl) {
            const { error } = await supabase
                .from('inspections')
                .update({ status: 'concluida', pdf_url: publicUrl })
                .eq('id', activeInspection.id);
            if (!error) dbUpdated = true;
        }

        if (!dbUpdated) {
             const { error } = await supabase
                .from('inspections')
                .update({ status: 'concluida' })
                .eq('id', activeInspection.id);
             
             if (error) throw error; // If this fails, we have a real problem
        }
        
        // 4. UPDATE UI STATE
        setInspections(prev => prev.map(i => 
            i.id === activeInspection.id 
            ? { ...i, status: 'concluida', pdfUrl: publicUrl } 
            : i
        ));
        
        setView('list');

        if (!uploadSuccess) {
            alert("Vistoria concluída! O PDF foi salvo no seu dispositivo (Sincronização na nuvem indisponível no momento).");
        } else {
            alert("Vistoria concluída e sincronizada com sucesso!");
        }

    } catch (error: any) {
        console.error("Critical finish error:", error);
        alert(`Erro ao finalizar vistoria: ${error.message || "Erro desconhecido"}`);
    } finally {
        setIsLoadingData(false);
    }
  };

  // --- RENDER ---

  if (isLoadingAuth) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-500" size={48} />
        </div>
    );
  }

  if (!currentUser) {
    if (authView === 'login') {
      return <Login onLogin={() => {}} onSwitchToRegister={() => setAuthView('register')} />;
    } else {
      return <Register onRegister={() => {}} onSwitchToLogin={() => setAuthView('login')} />;
    }
  }

  // Loading Overlay for PDF generation
  if (isLoadingData && view === 'detail') {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center z-50">
            <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-100">Finalizando Vistoria...</h2>
            <p className="text-slate-400">Gerando PDF e salvando dados.</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      
      {/* List View */}
      {view === 'list' && (
        <>
            <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-10">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="relative">
                        <Home className="text-blue-600" size={24} />
                        <Check className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full text-green-500 border border-slate-900" size={12} strokeWidth={4} />
                    </div>
                    <span className="text-blue-500">Vistori<span className="text-orange-500">Lar</span></span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="hidden md:flex flex-col items-end mr-2">
                      <span className="text-sm text-slate-200 font-medium">{currentUser.name}</span>
                      <span className="text-xs text-slate-500">Vistoriador</span>
                   </div>
                   <button 
                      onClick={handleLogout}
                      className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                      title="Sair"
                   >
                     <LogOut size={18} />
                   </button>
                </div>
            </nav>
            <div className="flex-grow">
              {isLoadingData ? (
                   <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-amber-500" size={32} />
                   </div>
              ) : (
                <InspectionList 
                    currentUser={currentUser}
                    inspections={sortedInspections} 
                    onSelect={handleSelectInspection} 
                    onNew={handleOpenCreateModal}
                    onDelete={handleDeleteInspection}
                />
              )}
            </div>
        </>
      )}

      {/* Detail View */}
      {view === 'detail' && activeInspection && (
        <>
          {/* Header */}
          <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-20 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={() => setView('list')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-slate-100 leading-tight">{activeInspection.address}</h1>
                      <button 
                        onClick={handleOpenEditModal}
                        className="p-1 text-slate-500 hover:text-amber-500 hover:bg-slate-800 rounded transition-colors"
                        title="Editar endereço e cliente"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      {activeInspection.clientName} • <span className="uppercase text-amber-500/80">{activeInspection.type}</span> • {new Date(activeInspection.date).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="text-xs text-slate-600 hidden sm:block font-mono">
                ID: {activeInspection.id.slice(0, 8)}
            </div>
          </header>

          {/* Tabs */}
          <div className="flex bg-slate-900 border-b border-slate-800 px-4">
              <button 
                onClick={() => setActiveTab('rooms')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rooms' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                  <LayoutGrid size={18} /> Cômodos
              </button>
              <button 
                onClick={() => setActiveTab('finalize')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'finalize' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                  <Zap size={18} /> Finalização
              </button>
          </div>

          {/* Content */}
          <main className="flex-grow p-4 md:p-6 max-w-4xl mx-auto w-full">
            {activeTab === 'rooms' && (
                <div className="space-y-6">
                    
                    {/* Add Room Quick Actions */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {ROOM_TEMPLATES.map(t => (
                            <button 
                                key={t.name}
                                onClick={() => addRoom(t.name, t.items)}
                                className="bg-slate-900 border border-slate-700 hover:border-amber-500 hover:bg-slate-800 text-slate-300 hover:text-amber-400 py-2 px-3 rounded-lg text-sm font-medium transition-all shadow-sm flex-grow md:flex-grow-0 whitespace-nowrap"
                            >
                                + {t.name}
                            </button>
                        ))}
                        
                        {/* Custom Room Button */}
                        {isAddingCustomRoom ? (
                            <div className="flex items-center gap-1 bg-slate-900 border border-amber-500 rounded-lg p-1 shadow-sm animate-in fade-in zoom-in duration-200">
                                <input 
                                    autoFocus
                                    className="px-2 py-1 text-sm outline-none w-32 text-slate-200 bg-transparent placeholder-slate-600"
                                    placeholder="Nome do cômodo"
                                    value={customRoomName}
                                    onChange={(e) => setCustomRoomName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomRoom()}
                                />
                                <button 
                                    onClick={handleAddCustomRoom}
                                    className="p-1 bg-amber-600 text-slate-900 rounded hover:bg-amber-500"
                                >
                                    <Check size={14} />
                                </button>
                                <button 
                                    onClick={() => setIsAddingCustomRoom(false)}
                                    className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                             <button 
                                onClick={() => setIsAddingCustomRoom(true)}
                                className="bg-slate-900 border border-dashed border-slate-600 text-slate-400 hover:bg-slate-800 hover:border-amber-500 hover:text-amber-400 py-2 px-3 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-1"
                            >
                                <Plus size={14} /> Outro
                            </button>
                        )}
                    </div>

                    {/* Rooms List */}
                    <div className="space-y-6">
                        {activeInspection.rooms.map((room) => (
                            <RoomDetail 
                                key={room.id} 
                                room={room} 
                                onUpdateRoom={updateRoom} 
                                onRemove={removeRoom}
                            />
                        ))}
                        {activeInspection.rooms.length === 0 && (
                            <div className="text-center py-12 text-slate-600">
                                <LayoutGrid className="mx-auto mb-2 opacity-20" size={48} />
                                <p>Nenhum cômodo adicionado. Selecione acima para começar.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'finalize' && (
                <FinalizeInspection 
                    inspection={activeInspection} 
                    onUpdate={updateInspection}
                    onFinish={handleFinish}
                />
            )}
          </main>
        </>
      )}

      <footer className="mt-auto py-6 border-t border-slate-900/50 bg-slate-950 text-center">
        <div className="text-slate-500 text-sm">
            <p className="mb-1 font-medium">Desenvolvido por <span className="text-amber-600">Rieger Developer</span></p>
            <div className="flex items-center justify-center gap-3 text-xs opacity-70">
                <a href="tel:67998866610" className="hover:text-amber-500 transition-colors flex items-center gap-1">
                    (67) 99886-6610
                </a>
                <span>|</span>
                <a href="mailto:andreriegerso@gmail.com" className="hover:text-amber-500 transition-colors">
                    andreriegerso@gmail.com
                </a>
            </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {inspectionToDelete && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-900/50">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Excluir Vistoria?</h3>
            <p className="text-slate-400 mb-6 text-sm">
              Esta ação removerá permanentemente a vistoria e todos os dados associados. Não é possível desfazer.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setInspectionToDelete(null)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors font-medium border border-slate-700"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-red-900/20"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Create/Edit Inspection */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="font-bold text-lg text-amber-500">
                {formMode === 'create' ? 'Nova Vistoria' : 'Editar Dados'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-500 hover:text-slate-200 p-1 rounded-full hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Endereço do Imóvel</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Rua das Flores, 123 - Apto 10"
                  className="w-full p-2.5 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-slate-800 text-slate-100 placeholder-slate-500"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Cliente / Locatário</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  className="w-full p-2.5 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-slate-800 text-slate-100 placeholder-slate-500"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <Mail size={16} className="text-slate-500" /> Email do Cliente
                </label>
                <input 
                  type="email"
                  required
                  placeholder="Ex: joao@email.com"
                  className="w-full p-2.5 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-slate-800 text-slate-100 placeholder-slate-500"
                  value={formData.clientEmail}
                  onChange={e => setFormData({...formData, clientEmail: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <FileText size={16} className="text-slate-500" /> Tipo de Vistoria
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'entrada'})}
                        className={`p-2 rounded-lg text-sm font-medium border transition-all ${formData.type === 'entrada' ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                    >
                        Entrada
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'saida'})}
                        className={`p-2 rounded-lg text-sm font-medium border transition-all ${formData.type === 'saida' ? 'bg-amber-900/40 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                    >
                        Saída
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar size={16} className="text-slate-500" /> Data
                  </label>
                  <input 
                    type="date"
                    required
                    className="w-full p-2.5 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-slate-800 text-slate-100 scheme-dark"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <Clock size={16} className="text-slate-500" /> Hora
                  </label>
                  <input 
                    type="time"
                    required
                    className="w-full p-2.5 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-slate-800 text-slate-100 scheme-dark"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-slate-400 font-medium hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                >
                  {formMode === 'create' ? 'Agendar Vistoria' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;