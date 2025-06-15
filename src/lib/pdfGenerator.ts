
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Quotation, Invoice, DocumentItem } from './types';
import { COMPANY_DETAILS, VAT_RATE, STAND_TYPES } from './constants';
import { formatCurrency, formatDate, getStandTypeName } from './utils';

// Extend jsPDF with autoTable, otherwise TypeScript might complain
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const addDocumentHeader = (doc: jsPDF, type: 'Quotation' | 'Invoice', document: Quotation | Invoice) => {
  // Company Logo (Placeholder or use an actual image if available as base64)
  // For simplicity, using text. If you have a logo as a base64 string, you can use doc.addImage(...)
  doc.setFontSize(10);
  doc.setTextColor(100);
  // Placeholder for logo
  // doc.rect(14, 10, 10, 10); 
  // doc.text("Logo", 15, 15);


  // Company Details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40); // Dark Gray
  doc.text(COMPANY_DETAILS.name, 14, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(`BRN: ${COMPANY_DETAILS.brn} | VAT: ${COMPANY_DETAILS.vat}`, 14, 26);
  doc.text(COMPANY_DETAILS.address, 14, 31);
  doc.text(`Tel: ${COMPANY_DETAILS.tel} | Email: ${COMPANY_DETAILS.email}`, 14, 36);
  doc.text(`URL: ${COMPANY_DETAILS.url}`, 14, 41);


  // Document Type and Details
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 204); // Primary color
  doc.text(type.toUpperCase(), pageWidth - 14, 20, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`ID: ${document.id}`, pageWidth - 14, 28, { align: 'right' });
  doc.text(`${type === 'Quotation' ? 'Date' : 'Date Issued'}: ${formatDate(type === 'Quotation' ? document.quotationDate : (document as Invoice).invoiceDate)}`, pageWidth - 14, 33, { align: 'right' });
  doc.text(`${type === 'Quotation' ? 'Expires' : 'Due Date'}: ${formatDate(type === 'Quotation' ? document.expiryDate : (document as Invoice).dueDate)}`, pageWidth - 14, 38, { align: 'right' });
  
  if (type === 'Invoice' && (document as Invoice).quotationId) {
    doc.text(`Ref Quotation: ${(document as Invoice).quotationId}`, pageWidth - 14, 43, { align: 'right' });
  }

  doc.setLineWidth(0.5);
  doc.line(14, 48, pageWidth - 14, 48); // Horizontal line
  return 55; // Starting Y for next section
};

const addClientDetails = (doc: jsPDF, yPos: number, document: Quotation | Invoice) => {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Bill To:', 14, yPos);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  let currentY = yPos + 6;
  doc.text(document.clientName, 14, currentY);
  currentY += 5;
  if (document.clientCompany) {
    doc.text(document.clientCompany, 14, currentY);
    currentY += 5;
  }
  doc.text(`Email: ${document.clientEmail}`, 14, currentY);
  currentY += 5;
  if (document.clientPhone) {
    doc.text(`Phone: ${document.clientPhone}`, 14, currentY);
    currentY += 5;
  }
  if (document.clientAddress) {
    // Handle multi-line address if necessary
    const addressLines = doc.splitTextToSize(document.clientAddress, doc.internal.pageSize.getWidth() / 2 - 28);
    doc.text(addressLines, 14, currentY);
    currentY += (addressLines.length * 5);
  }
  if (document.clientBRN) {
    doc.text(`BRN: ${document.clientBRN}`, 14, currentY);
    currentY += 5;
  }
  return currentY + 5; // Starting Y for next section
};

const addItemsTable = (doc: jsPDF, yPos: number, items: DocumentItem[], currency: string) => {
  const tableColumn = ["Item Description", "Quantity", "Unit Price", "Total"];
  const tableRows: any[][] = [];

  items.forEach(item => {
    const itemData = [
      getStandTypeName(item.standTypeId, STAND_TYPES) + (item.description && item.description !== getStandTypeName(item.standTypeId, STAND_TYPES) ? `\n(${item.description})` : ''),
      item.quantity,
      formatCurrency(item.unitPrice, currency),
      formatCurrency(item.total, currency),
    ];
    tableRows.push(itemData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: yPos,
    theme: 'grid', // 'striped', 'grid', 'plain'
    headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' }, // Teal header
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    didDrawPage: (data) => {
      // You can add headers/footers to each page if the table spans multiple pages
    }
  });

  return (doc as any).lastAutoTable.finalY + 10; // Starting Y for next section
};

const addTotals = (doc: jsPDF, yPos: number, document: Quotation | Invoice) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightAlignX = pageWidth - 14;
  const labelX = rightAlignX - 50;
  let currentY = yPos;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50,50,50);

  doc.text('Subtotal:', labelX, currentY, { align: 'left' });
  doc.text(formatCurrency(document.subTotal, document.currency), rightAlignX, currentY, { align: 'right' });
  currentY += 7;

  if ((document.discount || 0) > 0) {
    doc.setTextColor(200, 0, 0); // Red for discount
    doc.text('Discount:', labelX, currentY, { align: 'left' });
    doc.text(`-${formatCurrency(document.discount!, document.currency)}`, rightAlignX, currentY, { align: 'right' });
    doc.setTextColor(50,50,50);
    currentY += 7;
  }
  
  const amountBeforeVat = Math.max(0, document.subTotal - (document.discount || 0));
  doc.text('Amount before VAT:', labelX, currentY, { align: 'left' });
  doc.text(formatCurrency(amountBeforeVat, document.currency), rightAlignX, currentY, { align: 'right' });
  currentY += 7;

  doc.text(`VAT (${VAT_RATE * 100}%):`, labelX, currentY, { align: 'left' });
  doc.text(formatCurrency(document.vatAmount, document.currency), rightAlignX, currentY, { align: 'right' });
  currentY += 7;

  doc.setLineWidth(0.3);
  doc.line(labelX - 2, currentY - 3, rightAlignX, currentY - 3);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 204); // Primary color for grand total
  doc.text('Grand Total:', labelX, currentY + 4, { align: 'left' });
  doc.text(formatCurrency(document.grandTotal, document.currency), rightAlignX, currentY + 4, { align: 'right' });
  
  return currentY + 15;
};

const addNotesAndFooter = (doc: jsPDF, yPos: number, document: Quotation | Invoice, type: 'Quotation' | 'Invoice') => {
  let currentY = yPos;
  const pageWidth = doc.internal.pageSize.getWidth();

  if (document.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40,40,40);
    doc.text('Notes:', 14, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80,80,80);
    const notesLines = doc.splitTextToSize(document.notes, pageWidth - 28);
    doc.text(notesLines, 14, currentY);
    currentY += (notesLines.length * 5) + 10;
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  
  let footerY = pageHeight - 20;
  if (currentY > footerY - 10) { // If content is too close to default footer position, add a new page
      // This simple check might need refinement for more complex layouts
      // For now, let's assume if notes push content down, footer goes at bottom of current page.
      // If table itself pushes to new page, autoTable handles page breaks.
      if (!document.notes && (doc as any).lastAutoTable.finalY > pageHeight - 40) {
        // If table ended close to bottom and no notes, we might be on a new page already.
      } else {
         // currentY = 20; // Reset Y for new page if we manually add a page
      }
  }


  const thankYouText = type === 'Quotation'
    ? `Thank you for your business! This quotation is valid until ${formatDate(document.expiryDate)}.`
    : `Please make payment by ${formatDate((document as Invoice).dueDate)}.`;
  
  doc.text(thankYouText, 14, pageHeight - 15);
  doc.text(`All prices are in ${document.currency}.`, 14, pageHeight - 10);
  
  doc.text(`Powered by ExpoStand Pro`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  
  return currentY;
};


export const generatePdfDocument = (document: Quotation | Invoice, type: 'Quotation' | 'Invoice'): void => {
  const doc = new jsPDF();
  
  let yPos = addDocumentHeader(doc, type, document);
  yPos = addClientDetails(doc, yPos, document);
  yPos = addItemsTable(doc, yPos, document.items, document.currency);
  yPos = addTotals(doc, yPos, document);
  addNotesAndFooter(doc, yPos, document, type);

  doc.save(`${type}_${document.id.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

