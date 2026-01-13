import { jsPDF } from "jspdf";
import { Inspection, User } from "../types";
import { CONDITION_OPTIONS, METER_TYPES } from "../constants";

export const generateInspectionPDF = (inspection: Inspection, inspector: User) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Helper to check page break
  const checkPageBreak = (heightNeeded: number) => {
    if (yPos + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // --- HEADER ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Laudo de Vistoria de Imóvel", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Gerado via VistoriaPro 360", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // --- INFO TABLE ---
  // Adjusted height for extra rows (Inspector info)
  const headerHeight = 70; 
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, pageWidth - (margin * 2), headerHeight, "FD");
  
  const col1 = margin + 5;
  const col2 = pageWidth / 2 + 5;
  const lineH = 8;
  let localY = yPos + 8;

  // --- COLUMN 1 ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  doc.text("Imóvel:", col1, localY);
  doc.setFont("helvetica", "normal");
  doc.text(inspection.address, col1 + 25, localY);
  
  localY += lineH;
  doc.setFont("helvetica", "bold");
  doc.text("Cliente:", col1, localY);
  doc.setFont("helvetica", "normal");
  doc.text(inspection.clientName, col1 + 25, localY);

  localY += lineH;
  doc.setFont("helvetica", "bold");
  doc.text("Email Cli:", col1, localY);
  doc.setFont("helvetica", "normal");
  doc.text(inspection.clientEmail || '-', col1 + 25, localY);
  
  localY += lineH;
  doc.setFont("helvetica", "bold");
  doc.text("Tipo:", col1, localY);
  doc.setFont("helvetica", "normal");
  doc.text(inspection.type.toUpperCase(), col1 + 25, localY);

  // Inspector Info in Column 1 (Bottom part)
  localY += lineH * 1.5;
  doc.setFont("helvetica", "bold");
  doc.text("Vistoriador Responsável:", col1, localY);
  localY += lineH;
  doc.setFont("helvetica", "normal");
  doc.text(inspector.name, col1, localY);
  localY += lineH;
  doc.text(`Email: ${inspector.email}`, col1, localY);

  // --- COLUMN 2 ---
  localY = yPos + 8;
  doc.setFont("helvetica", "bold");
  doc.text("Data:", col2, localY);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(inspection.date).toLocaleDateString('pt-BR'), col2 + 25, localY);

  localY += lineH;
  doc.setFont("helvetica", "bold");
  doc.text("ID:", col2, localY);
  doc.setFont("helvetica", "normal");
  doc.text(inspection.id.slice(0, 8), col2 + 25, localY);

  // Inspector Phone in Column 2 (aligned with inspector block)
  localY += lineH * 3.5;
  doc.text(`Tel: ${inspector.phone}`, col2, localY);


  yPos += headerHeight + 10;

  // --- METERS & KEYS ---
  
  // Meters
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Leituras de Medidores", margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  if (inspection.meters.length === 0) {
      doc.text("- Nenhuma leitura registrada.", margin + 5, yPos);
      yPos += 8;
  } else {
    inspection.meters.forEach(meter => {
        const label = METER_TYPES.find(t => t.id === meter.type)?.label || meter.type;
        const text = `${label}: ${meter.currentValue}`;
        doc.text(`• ${text}`, margin + 5, yPos);
        yPos += 6;
        
        // Meter Photo
        if (meter.photo) {
            checkPageBreak(50);
            try {
                // Aspect ratio fit
                const imgW = 40;
                const imgH = 40;
                doc.addImage(meter.photo.url, 'JPEG', margin + 10, yPos, imgW, imgH);
                yPos += imgH + 5;
            } catch (e) {
                console.error("Error adding meter photo", e);
            }
        }
    });
  }
  yPos += 5;

  // Keys
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Chaves Entregues", margin, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (inspection.keys.length === 0) {
    doc.text("- Nenhuma chave registrada.", margin + 5, yPos);
    yPos += 8;
  } else {
    inspection.keys.forEach(key => {
        checkPageBreak(10);
        doc.text(`• ${key.description} (${key.quantity} un) - Local: ${key.location}`, margin + 5, yPos);
        yPos += 6;
    });
  }
  yPos += 10;

  // --- ROOMS DETAILS ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  
  checkPageBreak(20);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  doc.text("Detalhamento por Cômodo", margin, yPos);
  yPos += 15;

  if (inspection.rooms.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("Nenhum cômodo vistoriado.", margin, yPos);
  }

  inspection.rooms.forEach((room, index) => {
    checkPageBreak(40);
    
    // Room Header
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, yPos, pageWidth - (margin*2), 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${room.name}`, margin + 5, yPos + 7);
    yPos += 15;

    if (room.items.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text("Nenhum item adicionado neste cômodo.", margin + 5, yPos);
        yPos += 10;
    }

    room.items.forEach(item => {
        checkPageBreak(30);

        // Item Title and Condition
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`• ${item.name}`, margin + 5, yPos);
        
        const conditionLabel = CONDITION_OPTIONS.find(c => c.value === item.condition)?.label || item.condition;
        
        // Color coding for condition (text)
        if (item.condition === 'novo' || item.condition === 'bom') doc.setTextColor(0, 100, 0);
        else if (item.condition === 'regular') doc.setTextColor(200, 140, 0);
        else doc.setTextColor(200, 0, 0);
        
        doc.setFont("helvetica", "bold");
        doc.text(`[ ${conditionLabel.toUpperCase()} ]`, pageWidth - margin - 30, yPos);
        doc.setTextColor(0, 0, 0); // Reset black

        yPos += 6;

        // Description
        if (item.description) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const splitDesc = doc.splitTextToSize(item.description, pageWidth - (margin * 2) - 10);
            checkPageBreak(splitDesc.length * 5);
            doc.text(splitDesc, margin + 10, yPos);
            yPos += (splitDesc.length * 5) + 2;
        }

        // Photos
        if (item.photos.length > 0) {
            yPos += 2;
            const photoSize = 45; // mm
            const photosPerRow = 3;
            let colCount = 0;
            
            // Check if we have space for at least one row of photos
            checkPageBreak(photoSize + 10);

            item.photos.forEach((photo) => {
                // If we need a new page in the middle of photos
                if (checkPageBreak(photoSize + 5)) {
                    colCount = 0;
                }

                const xLoc = margin + 10 + (colCount * (photoSize + 5));
                
                try {
                    doc.addImage(photo.url, 'JPEG', xLoc, yPos, photoSize, photoSize);
                    doc.setDrawColor(200, 200, 200);
                    doc.rect(xLoc, yPos, photoSize, photoSize); // Border
                } catch (e) {
                   // Ignore image errors
                }

                colCount++;
                if (colCount >= photosPerRow) {
                    colCount = 0;
                    yPos += photoSize + 5;
                    checkPageBreak(photoSize + 5); // Check for next row
                }
            });

            // Adjust yPos if the last row wasn't full
            if (colCount > 0) {
                yPos += photoSize + 10;
            } else {
                yPos += 5;
            }
        } else {
            yPos += 5;
        }
        
        // Separator between items
        doc.setDrawColor(240, 240, 240);
        doc.line(margin + 5, yPos - 2, pageWidth - margin, yPos - 2);
        yPos += 4;
    });

    yPos += 10; // Space between rooms
  });

  // --- SIGNATURES ---
  // Ensure we have space for signatures (approx 40 units height)
  checkPageBreak(50);
  
  yPos += 15;
  doc.setDrawColor(0, 0, 0);
  
  // Inspector Signature Line
  doc.line(margin, yPos, margin + 80, yPos);
  
  // Client Signature Line
  doc.line(pageWidth - margin - 80, yPos, pageWidth - margin, yPos);
  
  yPos += 5;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  
  // Inspector Name
  doc.text(inspector.name, margin, yPos);
  // Client Name
  doc.text(inspection.clientName, pageWidth - margin - 80, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  
  doc.text("Vistoriador Responsável", margin, yPos);
  doc.text("Cliente / Responsável", pageWidth - margin - 80, yPos);


  // Footer Page Numbers
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount} - VistoriaPro 360`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  // Save the PDF
  const filename = `vistoria_${inspection.address.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(filename);
};