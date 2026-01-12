import React, { useState } from 'react';
import { Room, InspectionItem, Photo } from '../types';
import { Camera, Sparkles, Trash2, ChevronDown, ChevronUp, Plus, X, Check, AlertCircle } from 'lucide-react';
import { analyzeInspectionImage } from '../services/geminiService';
import { CONDITION_OPTIONS } from '../constants';

interface Props {
  room: Room;
  onUpdateRoom: (updatedRoom: Room) => void;
}

// Safe ID generator compatible with all environments
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

export const RoomDetail: React.FC<Props> = ({ room, onUpdateRoom }) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null); // item ID being analyzed
  
  // State for creating new item
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  // State for delete confirmation
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleUpdateItem = (itemId: string, updates: Partial<InspectionItem>) => {
    const updatedItems = room.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    onUpdateRoom({ ...room, items: updatedItems });
  };

  const handleConfirmAddItem = () => {
    if (!newItemName.trim()) {
        setIsCreating(false);
        return;
    }

    const newItem: InspectionItem = {
        id: generateId(),
        name: newItemName.trim(),
        condition: 'novo',
        description: '',
        photos: []
    };

    onUpdateRoom({
        ...room,
        items: [...room.items, newItem]
    });
    
    // Reset state and expand new item
    setNewItemName('');
    setIsCreating(false);
    setExpandedItemId(newItem.id);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = room.items.filter(item => item.id !== itemId);
    onUpdateRoom({ ...room, items: updatedItems });
    setItemToDelete(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Find item early to ensure it exists
    const item = room.items.find(i => i.id === itemId);
    if (!item) return;

    setIsAnalyzing(itemId);

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Automatically analyze the image upon upload
      const analysis = await analyzeInspectionImage(base64, item.name);

      const newPhoto: Photo = {
        id: generateId(),
        url: base64,
        description: analysis,
        analyzed: true
      };
      
      // Append analysis to the main description automatically
      const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const analysisText = `[Foto ${timestamp}]: ${analysis}`;
      
      const newDescription = item.description 
         ? `${item.description}\n\n${analysisText}`
         : analysisText;

      handleUpdateItem(itemId, { 
          photos: [...item.photos, newPhoto],
          description: newDescription
      });

    } catch (err) {
      console.error("Error processing image:", err);
      alert("Erro ao processar e analisar a imagem.");
    } finally {
      setIsAnalyzing(null);
      // Reset input
      e.target.value = '';
    }
  };

  const handleAnalyzePhoto = async (itemId: string, photo: Photo) => {
    const item = room.items.find(i => i.id === itemId);
    if (!item) return;

    setIsAnalyzing(itemId);
    try {
      const analysis = await analyzeInspectionImage(photo.url, item.name);
      
      // Update photo description with AI analysis
      const updatedPhotos = item.photos.map(p => 
        p.id === photo.id ? { ...p, description: analysis, analyzed: true } : p
      );
      
      // Also append to main item description
      const analysisText = `[Reanálise]: ${analysis}`;
      const newDescription = item.description 
          ? `${item.description}\n\n${analysisText}` 
          : analysisText;

      handleUpdateItem(itemId, { photos: updatedPhotos, description: newDescription });
    } catch (err) {
      alert("Falha na análise IA.");
    } finally {
      setIsAnalyzing(null);
    }
  };

  const toggleExpand = (id: string) => {
    // If we are in delete mode for this item, don't toggle
    if (itemToDelete === id) return;
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">{room.name}</h2>
        {!isCreating && (
            <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
                <Plus size={16} /> Adicionar Item
            </button>
        )}
      </div>

      {/* Inline Create Form */}
      {isCreating && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-semibold text-blue-800 mb-1">Nome do Novo Item</label>
              <div className="flex gap-2">
                  <input 
                      autoFocus
                      type="text" 
                      className="flex-grow p-2 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      placeholder="Ex: Rodapé, Cortina, Ar Condicionado..."
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleConfirmAddItem()}
                  />
                  <button 
                    onClick={handleConfirmAddItem} 
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                    title="Salvar"
                  >
                      <Check size={18} />
                  </button>
                   <button 
                    onClick={() => setIsCreating(false)} 
                    className="bg-white text-slate-500 border border-slate-300 p-2 rounded hover:bg-slate-50 transition-colors"
                    title="Cancelar"
                  >
                      <X size={18} />
                  </button>
              </div>
          </div>
      )}

      {room.items.length === 0 && !isCreating && (
          <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-500 text-sm">Nenhum item neste cômodo.</p>
              <button onClick={() => setIsCreating(true)} className="text-blue-600 text-sm font-medium hover:underline mt-1">Adicionar primeiro item</button>
          </div>
      )}

      {room.items.map((item) => {
        const isExpanded = expandedItemId === item.id;
        const isLoading = isAnalyzing === item.id;
        const isDeleting = itemToDelete === item.id;
        
        return (
          <div key={item.id} className={`bg-white rounded-lg border ${isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'} transition-all`}>
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-t-lg relative"
              onClick={() => toggleExpand(item.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${CONDITION_OPTIONS.find(c => c.value === item.condition)?.color.split(' ')[0] || 'bg-slate-200'}`} />
                <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800 truncate">{item.name}</h3>
                        {isLoading && (
                            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">
                                <Sparkles size={10} /> Analisando...
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                        {CONDITION_OPTIONS.find(c => c.value === item.condition)?.label} • {item.photos.length} fotos
                    </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pl-2">
                  {isDeleting ? (
                    <div className="flex items-center bg-red-50 rounded-lg p-1 animate-in slide-in-from-right-2 fade-in duration-200 absolute right-4 top-3 shadow-md border border-red-100 z-10">
                        <span className="text-xs font-bold text-red-600 mr-2 px-1">Excluir?</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(item.id);
                            }}
                            className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors mr-1"
                        >
                            <Check size={14} />
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete(null);
                            }}
                            className="p-1.5 bg-white text-slate-500 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                  ) : (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(item.id);
                        }}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors relative z-0"
                        title="Remover item"
                    >
                        <Trash2 size={18} />
                    </button>
                  )}
                  
                  {isExpanded ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="p-4 pt-0 border-t border-slate-100 mt-2 space-y-4">
                
                {/* Condition Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 pt-4">
                    {CONDITION_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handleUpdateItem(item.id, { condition: opt.value as any })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                                ${item.condition === opt.value 
                                    ? 'ring-2 ring-offset-1 ring-blue-500 ' + opt.color 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Description */}
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Observações</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                    className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[100px] bg-white text-slate-800 placeholder-slate-400"
                    placeholder="Descreva o estado do item..."
                  />
                </div>

                {/* Photos */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium text-slate-500">Evidências Visuais</label>
                    <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {isLoading ? (
                            <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                        ) : (
                            <Camera size={14} />
                        )}
                        {isLoading ? 'Analisando...' : 'Adicionar Foto'}
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => !isLoading && handleFileUpload(e, item.id)} 
                            disabled={isLoading}
                        />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {item.photos.map((photo, idx) => (
                      <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                        <img src={photo.url} alt="Item" className="w-full h-full object-cover" />
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-2">
                           <button 
                             onClick={() => handleAnalyzePhoto(item.id, photo)}
                             disabled={isLoading}
                             className="w-full bg-indigo-600/90 text-white py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 backdrop-blur-sm hover:bg-indigo-700 disabled:opacity-50"
                           >
                             <Sparkles size={12} />
                             Re-analisar
                           </button>
                           <button 
                             onClick={() => {
                                 const newPhotos = item.photos.filter(p => p.id !== photo.id);
                                 handleUpdateItem(item.id, { photos: newPhotos });
                             }}
                             className="w-full bg-red-500/80 text-white py-1.5 px-2 rounded text-xs flex items-center justify-center gap-1 hover:bg-red-600"
                           >
                             <Trash2 size={12} /> Excluir
                           </button>
                        </div>

                        {photo.analyzed && (
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                                <Sparkles size={8} /> IA
                            </div>
                        )}
                      </div>
                    ))}
                    {item.photos.length === 0 && (
                        <div className="col-span-full py-4 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                            Nenhuma foto adicionada.
                        </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};