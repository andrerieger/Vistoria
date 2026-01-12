import React, { useRef, useState, useEffect } from 'react';
import { Inspection, MeterReading, KeySet, Photo } from '../types';
import { METER_TYPES } from '../constants';
import { Camera, Key, Droplet, Zap, Flame, PenTool, Check, RotateCcw, X } from 'lucide-react';

interface Props {
  inspection: Inspection;
  onUpdate: (data: Partial<Inspection>) => void;
  onFinish: () => void;
}

// Safe ID generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

export const FinalizeInspection: React.FC<Props> = ({ inspection, onUpdate, onFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const updateMeter = (type: string, val: string) => {
    const existing = inspection.meters.find(m => m.type === type);
    let newMeters = [...inspection.meters];
    if (existing) {
        newMeters = newMeters.map(m => m.type === type ? { ...m, currentValue: val } : m);
    } else {
        newMeters.push({ type: type as any, currentValue: val });
    }
    onUpdate({ meters: newMeters });
  };

  const handleMeterPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });

        const newPhoto: Photo = {
            id: generateId(),
            url: base64,
            description: `Leitura do medidor de ${type}`,
            analyzed: false
        };

        const existing = inspection.meters.find(m => m.type === type);
        let newMeters = [...inspection.meters];
        
        // Ensure meter record exists or update it with photo
        if (existing) {
            newMeters = newMeters.map(m => m.type === type ? { ...m, photo: newPhoto } : m);
        } else {
            newMeters.push({ type: type as any, currentValue: '', photo: newPhoto });
        }
        
        onUpdate({ meters: newMeters });

    } catch (err) {
        console.error("Error upload meter photo", err);
    }
  };

  const triggerMeterFileInput = (type: string) => {
      document.getElementById(`meter-file-${type}`)?.click();
  };

  const getMeterValue = (type: string) => inspection.meters.find(m => m.type === type)?.currentValue || '';
  const getMeterPhoto = (type: string) => inspection.meters.find(m => m.type === type)?.photo;

  const addKey = () => {
    const newKey: KeySet = {
        id: generateId(),
        description: 'Chave Principal',
        quantity: 1,
        location: 'Imobiliária'
    };
    onUpdate({ keys: [...inspection.keys, newKey] });
  };

  const updateKey = (id: string, updates: Partial<KeySet>) => {
      onUpdate({ keys: inspection.keys.map(k => k.id === id ? { ...k, ...updates } : k) });
  };

  // --- Signature Logic ---

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = (event as React.MouseEvent).clientX;
        clientY = (event as React.MouseEvent).clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent scrolling while drawing on mobile
    if(isDrawing) e.preventDefault(); 
    
    if (!isDrawing || !canvasRef.current) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL();
        onUpdate({ tenantSignature: dataUrl });
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    onUpdate({ tenantSignature: undefined });
    // If canvas exists immediately after state update (unlikely due to conditional render, but safe to try)
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Meters Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="text-yellow-500" size={20} /> Leituras de Medidores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {METER_TYPES.map(type => {
                const photo = getMeterPhoto(type.id);
                return (
                    <div key={type.id} className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                            <span>{type.icon}</span> {type.label}
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={getMeterValue(type.id)}
                                onChange={(e) => updateMeter(type.id, e.target.value)}
                                placeholder="000000"
                            />
                            
                            <input 
                                type="file" 
                                id={`meter-file-${type.id}`} 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleMeterPhotoUpload(e, type.id)}
                            />
                            
                            <button 
                                onClick={() => triggerMeterFileInput(type.id)}
                                className={`p-2 border rounded-lg transition-colors flex-shrink-0 ${photo ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-slate-50 border-slate-300 text-slate-500 hover:text-blue-600'}`}
                                title={photo ? "Foto anexada (clique para alterar)" : "Anexar foto do medidor"}
                            >
                                {photo ? <Check size={20} /> : <Camera size={20} />}
                            </button>
                        </div>
                        {photo && (
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                                <Check size={10} /> Foto registrada
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* Keys Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Key className="text-amber-500" size={20} /> Gestão de Chaves
            </h3>
            <button onClick={addKey} className="text-sm text-blue-600 hover:underline font-medium">
                + Adicionar Chave
            </button>
        </div>
        
        <div className="space-y-3">
            {inspection.keys.map((key) => (
                <div key={key.id} className="flex flex-wrap md:flex-nowrap gap-3 items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <input 
                        className="flex-grow p-2 text-sm border border-slate-300 rounded bg-white" 
                        value={key.description} 
                        onChange={(e) => updateKey(key.id, { description: e.target.value })}
                        placeholder="Descrição (ex: Portão Principal)"
                    />
                    <input 
                        type="number"
                        className="w-20 p-2 text-sm border border-slate-300 rounded bg-white" 
                        value={key.quantity}
                        onChange={(e) => updateKey(key.id, { quantity: parseInt(e.target.value) })}
                    />
                    <select 
                        className="p-2 text-sm border border-slate-300 rounded bg-white"
                        value={key.location}
                        onChange={(e) => updateKey(key.id, { location: e.target.value })}
                    >
                        <option>Imobiliária</option>
                        <option>Portaria</option>
                        <option>Proprietário</option>
                        <option>Inquilino</option>
                    </select>
                </div>
            ))}
             {inspection.keys.length === 0 && <p className="text-slate-400 text-sm italic">Nenhuma chave registrada.</p>}
        </div>
      </div>

      {/* Signature */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <PenTool className="text-blue-500" size={20} /> Assinatura Digital
            </h3>
            {inspection.tenantSignature && (
                <button 
                    onClick={clearSignature}
                    className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                >
                    <RotateCcw size={12} /> Redefinir
                </button>
            )}
        </div>
        
        <div className="border border-slate-300 rounded-xl overflow-hidden bg-white mb-4 relative touch-none">
            {inspection.tenantSignature ? (
                <div className="h-48 w-full bg-white flex items-center justify-center relative">
                    <img src={inspection.tenantSignature} alt="Assinatura" className="max-h-full max-w-full" />
                    <div className="absolute bottom-2 right-2 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Check size={10} /> ASSINADO
                    </div>
                </div>
            ) : (
                <>
                    <canvas 
                        ref={canvasRef}
                        width={600}
                        height={200}
                        className="w-full h-48 bg-white cursor-crosshair block touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                     <div className="absolute top-2 right-2 pointer-events-none">
                         <span className="text-[10px] text-slate-300 bg-white/80 px-1 rounded">Área de desenho</span>
                     </div>
                </>
            )}
        </div>

        <div className="flex items-center gap-3 mb-6">
            <input type="checkbox" id="confirm" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" />
            <label htmlFor="confirm" className="text-sm text-slate-600 cursor-pointer select-none">
                Declaro que as informações acima são verdadeiras e conferem com o estado atual do imóvel.
            </label>
        </div>

        <button 
            onClick={onFinish}
            disabled={!inspection.tenantSignature}
            className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]
                ${inspection.tenantSignature 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
        >
            <Check size={24} />
            Finalizar Vistoria e Sincronizar
        </button>
        {!inspection.tenantSignature && (
            <p className="text-center text-xs text-red-400 mt-2">Assinatura obrigatória para finalizar.</p>
        )}
      </div>

    </div>
  );
};