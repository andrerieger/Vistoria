
import React, { useState } from 'react';
import { Inspection, KeySet, Photo } from '../types';
import { METER_TYPES } from '../constants';
import { Camera, Key, Zap, Check, MapPin, Loader2, MapPinOff } from 'lucide-react';

interface Props {
  inspection: Inspection;
  onUpdate: (data: Partial<Inspection>) => void;
  onFinish: (finalUpdates?: Partial<Inspection>) => void;
}

// Safe ID generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

// Image compression helper
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; // Limit width to prevent memory crash
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG at 70% quality
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
            resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const FinalizeInspection: React.FC<Props> = ({ inspection, onUpdate, onFinish }) => {
  const [isFinishing, setIsFinishing] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [useGeolocation, setUseGeolocation] = useState(true);
  
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
        // Compress image before saving to avoid memory crash
        const base64 = await compressImage(file);

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
        alert("Erro ao processar a foto. Tente novamente.");
    } finally {
        e.target.value = ''; // Reset input
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

  const handleFinishClick = () => {
    setIsFinishing(true);

    // Se o usuário desligou a geolocalização, finaliza direto
    if (!useGeolocation) {
        onFinish();
        return;
    }

    setGeoStatus('locating');

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    timestamp: new Date().toISOString()
                };
                setGeoStatus('success');
                // Chama onFinish passando os dados de geolocalização
                onFinish({ geolocation });
            },
            (error) => {
                // Log detalhado para debug
                console.error("Erro de Geolocalização:", error.code, error.message);
                setGeoStatus('error');
                
                // Se o erro for permissão negada (code 1), avisa o usuário
                if (error.code === 1) {
                     alert("Atenção: Permissão de localização negada. O laudo será gerado sem as coordenadas geográficas.");
                } else if (error.code === 3) {
                     console.warn("Timeout ao obter localização.");
                }

                // Prossegue com a finalização mesmo sem geo para não bloquear o fluxo
                onFinish();
            },
            { 
                enableHighAccuracy: true, // Tenta GPS primeiro
                timeout: 20000,           // Aumentado para 20s para garantir sinal
                maximumAge: 0 
            }
        );
    } else {
        console.warn("Navegador não suporta Geolocalização");
        onFinish();
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Meters Section */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
        <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Zap className="text-amber-500" size={20} /> Leituras de Medidores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {METER_TYPES.map(type => {
                const photo = getMeterPhoto(type.id);
                return (
                    <div key={type.id} className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                            <span>{type.icon}</span> {type.label}
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                className="w-full p-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-slate-800 text-slate-100 placeholder-slate-500"
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
                                className={`p-2 border rounded-lg transition-colors flex-shrink-0 ${photo ? 'bg-amber-900/20 border-amber-500/50 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-amber-500 hover:border-amber-500'}`}
                                title={photo ? "Foto anexada (clique para alterar)" : "Anexar foto do medidor"}
                            >
                                {photo ? <Check size={20} /> : <Camera size={20} />}
                            </button>
                        </div>
                        {photo && (
                            <div className="text-xs text-amber-500 flex items-center gap-1">
                                <Check size={10} /> Foto registrada
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* Keys Section */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Key className="text-amber-500" size={20} /> Gestão de Chaves
            </h3>
            <button onClick={addKey} className="text-sm text-amber-500 hover:text-amber-400 font-medium hover:underline">
                + Adicionar Chave
            </button>
        </div>
        
        <div className="space-y-3">
            {inspection.keys.map((key) => (
                <div key={key.id} className="flex flex-wrap md:flex-nowrap gap-3 items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <input 
                        className="flex-grow p-2 text-sm border border-slate-600 rounded bg-slate-900 text-slate-100 placeholder-slate-500" 
                        value={key.description} 
                        onChange={(e) => updateKey(key.id, { description: e.target.value })}
                        placeholder="Descrição (ex: Portão Principal)"
                    />
                    <input 
                        type="number"
                        className="w-20 p-2 text-sm border border-slate-600 rounded bg-slate-900 text-slate-100" 
                        value={key.quantity}
                        onChange={(e) => updateKey(key.id, { quantity: parseInt(e.target.value) })}
                    />
                    <select 
                        className="p-2 text-sm border border-slate-600 rounded bg-slate-900 text-slate-100"
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
             {inspection.keys.length === 0 && <p className="text-slate-500 text-sm italic">Nenhuma chave registrada.</p>}
        </div>
      </div>

      {/* Geolocation Toggle */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${useGeolocation ? 'bg-emerald-900/30 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                 {useGeolocation ? <MapPin size={24} /> : <MapPinOff size={24} />}
              </div>
              <div>
                  <h4 className="font-bold text-slate-200">Localização GPS</h4>
                  <p className="text-xs text-slate-400">Registrar coordenadas no laudo</p>
              </div>
          </div>
          
          <button 
            onClick={() => setUseGeolocation(!useGeolocation)}
            className={`w-14 h-7 rounded-full transition-colors relative flex items-center ${useGeolocation ? 'bg-emerald-600' : 'bg-slate-700'}`}
          >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute transition-all ${useGeolocation ? 'right-1' : 'left-1'}`} />
          </button>
      </div>

      {/* Actions */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
        <p className="text-sm text-slate-400 mb-4">
           {useGeolocation 
             ? <>Ao finalizar, registraremos sua <strong>localização atual</strong> e a vistoria será marcada como concluída.</> 
             : <>Ao finalizar, a vistoria será marcada como concluída <strong>sem</strong> registro de localização.</>
           }
        </p>

        <button 
            type="button"
            onClick={handleFinishClick}
            disabled={isFinishing}
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isFinishing ? (
                <>
                    <Loader2 className="animate-spin" size={24} />
                    {geoStatus === 'locating' ? 'Obtendo Localização...' : 'Finalizando...'}
                </>
            ) : (
                <>
                    <Check size={24} />
                    Finalizar Vistoria
                </>
            )}
        </button>
      </div>

    </div>
  );
};
