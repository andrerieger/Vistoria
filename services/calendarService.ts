
import { Inspection } from "../types";

export const downloadCalendarEvent = (inspection: Inspection) => {
  const startDate = new Date(inspection.date);
  // Assume duração padrão de 2 horas se não especificado
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  // Formata data para o padrão iCalendar: YYYYMMDDTHHmmSSZ
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  const nowStr = formatDate(new Date());

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VistoriLar//App//PT-BR
BEGIN:VEVENT
UID:${inspection.id}@vistorilar.app
DTSTAMP:${nowStr}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:Vistoria: ${inspection.address}
DESCRIPTION:Cliente: ${inspection.clientName}\\nTipo: ${inspection.type}\\nGerado via VistoriLar.
LOCATION:${inspection.address}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  
  // Cria link temporário para download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `vistoria_${inspection.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
