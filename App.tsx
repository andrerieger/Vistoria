import React, { useState, useEffect } from 'react';
import { InspectionList } from './components/InspectionList';
import { RoomDetail } from './components/RoomDetail';
import { FinalizeInspection } from './components/FinalizeInspection';
import { Inspection, Room, InspectionItem } from './types';
import { ROOM_TEMPLATES } from './constants';
import { ArrowLeft, LayoutGrid, Zap, CheckSquare, Pencil, X, Calendar, Clock } from 'lucide-react';

// Safe ID generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// Mock Initial Data
const INITIAL_INSPECTIONS: Inspection[] = [];

const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'finalize'>('rooms');
  
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

  const addRoom = (templateName: string) => {
    const template = ROOM_TEMPLATES.find(t => t.name === templateName);
    if (!template) return;

    const newRoom: Room = {
        id: generateId(),
        name: `${template.name} ${activeInspection?.rooms.filter(r => r.name.startsWith(template.name)).length ? (activeInspection.rooms.filter(r => r.name.startsWith(template.name)).length + 1) : ''}`.trim(),
        items: template.items.map(itemName => ({
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

  const updateRoom = (updatedRoom: Room) => {
    if (!activeInspection) return;
    updateInspection({
        rooms: activeInspection.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* List View */}
      {view === 'list' && (
        <>
            <nav className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-2 font-bold text-xl text-blue-700">
                    <CheckSquare />
                    VistoriaPro 360
                </div>
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
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
          <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-slate-800 leading-tight">{activeInspection.address}</h1>
                      <button 
                        onClick={handleOpenEditModal}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar endereço e cliente"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      {activeInspection.clientName} • <span className="uppercase">{activeInspection.type}</span> • {new Date(activeInspection.date).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="text-xs text-slate-400 hidden sm:block">
                ID: {activeInspection.id.slice(0, 8)}
            </div>
          </header>

          {/* Tabs */}
          <div className="flex bg-white border-b border-slate-200 px-4">
              <button 
                onClick={() => setActiveTab('rooms')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rooms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                  <LayoutGrid size={18} /> Cômodos
              </button>
              <button 
                onClick={() => setActiveTab('finalize')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'finalize' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                  <Zap size={18} /> Finalização
              </button>
          </div>

          {/* Content */}
          <main className="flex-grow p-4 md:p-6 max-w-4xl mx-auto w-full">
            {activeTab === 'rooms' && (
                <div className="space-y-6">
                    
                    {/* Add Room Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                        {ROOM_TEMPLATES.map(t => (
                            <button 
                                key={t.name}
                                onClick={() => addRoom(t.name)}
                                className="bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-700 py-2 px-3 rounded-lg text-sm font-medium transition-all shadow-sm"
                            >
                                + {t.name}
                            </button>
                        ))}
                    </div>

                    {/* Rooms List */}
                    <div className="space-y-6">
                        {activeInspection.rooms.map((room) => (
                            <RoomDetail key={room.id} room={room} onUpdateRoom={updateRoom} />
                        ))}
                        {activeInspection.rooms.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {formMode === 'create' ? 'Nova Vistoria' : 'Editar Dados'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço do Imóvel</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Rua das Flores, 123 - Apto 10"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-900"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cliente / Inquilino</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-900"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar size={16} className="text-slate-400" /> Data
                  </label>
                  <input 
                    type="date"
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-900"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <Clock size={16} className="text-slate-400" /> Hora
                  </label>
                  <input 
                    type="time"
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-900"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
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