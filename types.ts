export type InspectionType = 'entrada' | 'saida' | 'periodica';
export type InspectionStatus = 'agendada' | 'em_andamento' | 'sincronizada' | 'concluida';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  creci?: string; // Campo opcional para registro profissional
  password?: string; // In a real app, this would be hashed or handled by backend
}

export interface Photo {
  id: string;
  url: string; // Base64 or Object URL
  description: string;
  analyzed?: boolean;
}

export interface InspectionItem {
  id: string;
  name: string; // e.g., "Paredes", "Piso", "Tomadas"
  condition: 'novo' | 'bom' | 'regular' | 'ruim' | 'danificado' | 'nao_se_aplica';
  description: string;
  photos: Photo[];
}

export interface Room {
  id: string;
  name: string; // e.g., "Sala de Estar", "Cozinha"
  items: InspectionItem[];
}

export interface MeterReading {
  type: 'agua' | 'energia' | 'gas';
  currentValue: string;
  photo?: Photo;
}

export interface KeySet {
  id: string;
  description: string;
  quantity: number;
  location: string; // "Portaria", "Imobiliária", "Proprietário"
  photo?: Photo;
}

export interface Inspection {
  id: string;
  address: string;
  clientName: string;
  clientEmail: string;
  date: string;
  type: InspectionType;
  status: InspectionStatus;
  rooms: Room[];
  meters: MeterReading[];
  keys: KeySet[];
  tenantSignature?: string; // Base64 representation of signature
  notes?: string;
  pdfUrl?: string; // URL of the finalized PDF in Supabase Storage
}