
import { Inspection } from '../types';

// Solicita permissão ao usuário para enviar notificações
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações de desktop.');
    return;
  }
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    await Notification.requestPermission();
  }
};

// Envia a notificação visual
export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    try {
      // Casting to any because 'vibrate' might not be in the TS NotificationOptions definition
      // depending on the project configuration, although it is a valid option in modern browsers.
      const options: any = {
        body,
        icon: 'https://raw.githubusercontent.com/andrerieger/vistorilar/main/logo-removebg-preview%20(1)%20(1).png',
        vibrate: [200, 100, 200],
        tag: 'vistorilar-notification' // Agrupa notificações para não spammar
      };
      new Notification(title, options);
    } catch (e) {
      console.error("Erro ao enviar notificação:", e);
    }
  }
};

// Função principal que verifica a lista de vistorias
export const checkInspectionReminders = (inspections: Inspection[]) => {
  const now = new Date();

  inspections.forEach(inspection => {
    // Ignora vistorias já concluídas para o lembrete de tempo, mas mantém para o de dia (caso precise)
    
    const inspectionDate = new Date(inspection.date);
    const inspectionId = inspection.id;

    // --- LÓGICA 1: Faltando 30 MINUTOS para a vistoria ---
    if (inspection.status !== 'concluida') {
        const timeDiff = inspectionDate.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60); // Diferença em minutos

        // Verifica se faltam entre 25 e 35 minutos (aprox 30 minutos)
        // Usamos um intervalo para garantir que o setInterval de 1 minuto pegue esse momento
        if (minutesDiff >= 25 && minutesDiff <= 35) {
            const key = `notif_30min_${inspectionId}`;
            // Verifica se já enviamos esta notificação específica para não repetir
            if (!localStorage.getItem(key)) {
                sendNotification(
                    "⏳ Vistoria em 30 Minutos",
                    `Prepare-se! A vistoria em ${inspection.address} começa em breve (${inspectionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}).`
                );
                localStorage.setItem(key, 'true');
            }
        }
    }

    // --- LÓGICA 2: Às 08:00 (8 AM) do dia da vistoria ---
    const isSameDay = now.getDate() === inspectionDate.getDate() &&
                      now.getMonth() === inspectionDate.getMonth() &&
                      now.getFullYear() === inspectionDate.getFullYear();

    if (isSameDay) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Verifica se são 08h (entre 08:00 e 08:15 para garantir o disparo)
        if (currentHour === 8 && currentMinute < 15) {
            const key = `notif_08h_${inspectionId}`;
            if (!localStorage.getItem(key)) {
                 sendNotification(
                    "📅 Vistoria Hoje!",
                    `Bom dia! Você tem uma vistoria agendada hoje em ${inspection.address} às ${inspectionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`
                );
                localStorage.setItem(key, 'true');
            }
        }
    }
  });
};
