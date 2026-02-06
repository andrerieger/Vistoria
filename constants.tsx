// Common Room Templates

export const RESIDENTIAL_TEMPLATES = [
  { name: 'Sala de Estar', items: ['Paredes', 'Piso', 'Teto', 'Portas', 'Janelas', 'Iluminação', 'Tomadas'] },
  { name: 'Cozinha', items: ['Paredes', 'Piso', 'Armários', 'Pia/Bancada', 'Torneiras', 'Iluminação'] },
  { name: 'Banheiro Social', items: ['Paredes', 'Piso', 'Espelho', 'Box', 'Chuveiro', 'Vaso Sanitário', 'Pia'] },
  { name: 'Quarto', items: ['Paredes', 'Piso', 'Guarda-roupas', 'Porta', 'Janela'] },
  { name: 'Área de Serviço', items: ['Tanque', 'Instalação Máquina', 'Piso', 'Varal'] },
];

export const COMMERCIAL_TEMPLATES = [
  { name: 'Hall de Entrada', items: ['Porta Principal', 'Piso', 'Paredes', 'Teto', 'Iluminação', 'Recepção', 'Interfone/Controle de Acesso'] },
  { name: 'Sala Comercial', items: ['Porta', 'Piso', 'Paredes', 'Teto', 'Iluminação', 'Janelas/Persianas', 'Ar Condicionado', 'Tomadas/Rede'] },
  { name: 'Copa', items: ['Pia', 'Armários', 'Piso', 'Paredes', 'Iluminação', 'Tomadas'] },
  { name: 'Banheiro', items: ['Porta', 'Piso', 'Paredes', 'Pia/Cuba', 'Vaso Sanitário', 'Espelho', 'Acessórios'] },
  { name: 'Mezanino', items: ['Escada', 'Guarda-corpo', 'Piso', 'Paredes', 'Iluminação'] },
];

// Fallback default
export const ROOM_TEMPLATES = RESIDENTIAL_TEMPLATES;

export const METER_TYPES = [
  { id: 'energia', label: 'Energia Elétrica (kWh)', icon: '⚡' },
  { id: 'agua', label: 'Água (m³)', icon: '💧' },
  { id: 'gas', label: 'Gás (m³)', icon: '🔥' },
];

export const CONDITION_OPTIONS = [
  { value: 'novo', label: 'Novo', color: 'bg-green-900/40 text-green-400 border border-green-800' },
  { value: 'bom', label: 'Bom', color: 'bg-blue-900/40 text-blue-400 border border-blue-800' },
  { value: 'regular', label: 'Regular', color: 'bg-yellow-900/40 text-yellow-400 border border-yellow-800' },
  { value: 'ruim', label: 'Ruim', color: 'bg-orange-900/40 text-orange-400 border border-orange-800' },
  { value: 'danificado', label: 'Danificado', color: 'bg-red-900/40 text-red-400 border border-red-800' },
  { value: 'nao_se_aplica', label: 'N/A', color: 'bg-slate-800 text-slate-400 border border-slate-700' },
];