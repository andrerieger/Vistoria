import React, { useState, useEffect } from 'react';
import { InspectionList } from './components/InspectionList';
import { RoomDetail } from './components/RoomDetail';
import { FinalizeInspection } from './components/FinalizeInspection';
import { Inspection, Room } from './types';
import { ROOM_TEMPLATES } from './constants';
import { ArrowLeft, LayoutGrid, Zap, CheckSquare, Pencil, X, Calendar, Clock, Plus, Check } from 'lucide-react';

// Safe ID generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// Mock Initial Data
const INITIAL_INSPECTIONS: Inspection[] = [];

const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'finalize'>('rooms');
  
  // Custom Room State
  const [isAddingCustomRoom, setIsAddingCustomRoom] = useState(false);
  const [customRoomName, setCustomRoomName] = useState('');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  // formData now handles date and time separately
  const [formData, setFormData] = useState({ address: '', clientName: '', date: '', time: '' });

  // Persistence Mock
  const [inspections, setInspections] = useState<Inspection[]>(() => {
    const saved = localStorage.getItem('vistoriapro_data');
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  useEffect(() => {
    localStorage.setItem('vistoriapro_data', JSON.stringify(inspections));
  }, [inspections]);

  // Sort inspections by date (Ascending - Nearest/Oldest first)
  const sortedInspections = [...inspections].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const activeInspection = inspections.find(i => i.id === activeInspectionId);

  const handleSelectInspection = (id: string) => {
    setActiveInspectionId(id);
    setView('detail');
  };

  // Helper to get local date parts
  const getLocalDateParts = (isoString?: string) => {
    const dateObj = isoString ? new Date(isoString) : new Date();
    // Adjust for timezone to get local YYYY-MM-DD and HH:MM
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
        date,
        time
      });
      setFormMode('edit');
      setIsFormOpen(true);
    }
  };

  // Handle Form Submit (Create or Edit)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address.trim() || !formData.clientName.trim() || !formData.date || !formData.time) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // Combine date and time
    const inspectionDate = new Date(`${formData.date}T${formData.time}`).toISOString();

    if (formMode === 'create') {
      const newId = generateId();
      const newInspection: Inspection = {
        id: newId,
        address: formData.address,
        clientName: formData.clientName,
        date: inspectionDate,
        type: 'entrada',
        status: 'em_andamento',
        rooms: [],
        meters: [],
        keys: []
      };
      setInspections([newInspection, ...inspections]);
      setActiveInspectionId(newId);
      setView('detail');
    } else {
      // Edit mode
      if (activeInspectionId) {
        setInspections(prev => prev.map(i => 
          i.id === activeInspectionId 
            ? { ...i, address: formData.address, clientName: formData.clientName, date: inspectionDate } 
            : i
        ));
      }
    }
    setIsFormOpen(false);
  };

  const updateInspection = (updates: Partial<Inspection>) => {
    if (!activeInspectionId) return;
    setInspections(prev => prev.map(i => 
      i.id === activeInspectionId ? { ...i, ...updates } : i
    ));
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

  const handleFinish = () => {
    if (confirm('Deseja concluir a vistoria e gerar o laudo PDF?')) {
        updateInspection({ status: 'concluida' });
        setView('list');
    }
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      
      {/* List View */}
      {view === 'list' && (
        <>
            <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-10">
                <div className="flex items-center gap-2 font-bold text-xl text-amber-500">
                    <CheckSquare />
                    VistoriaPro 360
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-amber-500 font-bold border border-slate-700">
                    VS
                </div>
            </nav>
            <div className="flex-grow">
              <InspectionList 
                  inspections={sortedInspections} 
                  onSelect={handleSelectInspection} 
                  onNew={handleOpenCreateModal} 
              />
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
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Cliente / Inquilino</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  className="w-full p-2.5 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-slate-800 text-slate-100 placeholder-slate-500"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                />
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