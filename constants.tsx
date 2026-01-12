import React from 'react';

// Common Room Templates
export const ROOM_TEMPLATES = [
  { name: 'Sala de Estar', items: ['Paredes', 'Piso', 'Teto', 'Portas', 'Janelas', 'Iluminação', 'Tomadas'] },
  { name: 'Cozinha', items: ['Paredes', 'Piso', 'Armários', 'Pia/Bancada', 'Torneiras', 'Iluminação'] },
  { name: 'Banheiro Social', items: ['Paredes', 'Piso', 'Espelho', 'Box', 'Chuveiro', 'Vaso Sanitário', 'Pia'] },
  { name: 'Quarto', items: ['Paredes', 'Piso', 'Guarda-roupas', 'Porta', 'Janela'] },
  { name: 'Área de Serviço', items: ['Tanque', 'Instalação Máquina', 'Piso', 'Varal'] },
];

export const METER_TYPES = [
  { id: 'energia', label: 'Energia Elétrica (kWh)', icon: '⚡' },
  { id: 'agua', label: 'Água (m³)', icon: '💧' },
  { id: 'gas', label: 'Gás (m³)', icon: '🔥' },
];

export const CONDITION_OPTIONS = [
  { value: 'novo', label: 'Novo', color: 'bg-green-100 text-green-800' },
  { value: 'bom', label: 'Bom', color: 'bg-blue-100 text-blue-800' },
  { value: 'regular', label: 'Regular', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ruim', label: 'Ruim', color: 'bg-orange-100 text-orange-800' },
  { value: 'danificado', label: 'Danificado', color: 'bg-red-100 text-red-800' },
  { value: 'nao_se_aplica', label: 'N/A', color: 'bg-gray-100 text-gray-800' },
];
