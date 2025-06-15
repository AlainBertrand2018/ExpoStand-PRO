
import type { Quotation, Invoice } from './types';
import { STAND_TYPES, VAT_RATE } from './constants';
import { generateQuotationId, generateInvoiceId, formatDate } from './utils';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const nextMonth = new Date(today);
nextMonth.setMonth(today.getMonth() + 1);


const createMockItems = (numItems: number = 1): import('./types').DocumentItem[] => {
  const items: import('./types').DocumentItem[] = [];
  for (let i = 0; i < numItems; i++) {
    const standType = STAND_TYPES[Math.floor(Math.random() * STAND_TYPES.length)];
    const quantity = standType.id === 'regional_pavilions' || standType.id === 'gastronomic_pavilions' ? 1 : Math.floor(Math.random() * 3) + 1;
    const unitPrice = standType.unitPrice;
    items.push({
      id: `item-${Date.now()}-${i}-${Math.random().toString(36).substring(2,5)}`,
      standTypeId: standType.id,
      description: standType.name,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    });
  }
  return items;
};

const calculateTotals = (items: import('./types').DocumentItem[], discount: number = 0) => {
  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const amountBeforeVat = Math.max(0, subTotal - discount);
  const vatAmount = amountBeforeVat * VAT_RATE;
  const grandTotal = amountBeforeVat + vatAmount;
  return { subTotal, discount, vatAmount, grandTotal };
};

export const mockQuotations: Quotation[] = [
  {
    id: generateQuotationId("TechCorp"),
    clientName: "TechCorp Solutions",
    clientCompany: "TechCorp Ltd.",
    clientEmail: "contact@techcorp.com",
    clientPhone: "+230 5555 0101",
    clientAddress: "1 Cybercity, Ebene",
    clientBRN: "C10012345",
    quotationDate: today.toISOString(),
    expiryDate: nextWeek.toISOString(),
    items: createMockItems(2),
    ...calculateTotals(createMockItems(2), 500), 
    status: "To Send",
    currency: "MUR",
    notes: "Early bird discount applied.",
    discount: 500,
  },
  {
    id: generateQuotationId("Foodies"),
    clientName: "Alice Wonderland",
    clientCompany: "Foodies Delight",
    clientEmail: "alice@foodies.com",
    clientPhone: "+230 5555 0202",
    clientAddress: "2 Coast Road, Flic en Flac",
    clientBRN: "C20056789",
    quotationDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    expiryDate: tomorrow.toISOString(),
    items: createMockItems(1),
    ...calculateTotals(createMockItems(1), 0),
    status: "Won",
    currency: "MUR",
    discount: 0,
  },
  {
    id: generateQuotationId("Innovate"),
    clientName: "Innovate Hub",
    clientEmail: "info@innovate.mu",
    clientPhone: "+230 5555 0303",
    clientAddress: "3 Innovation Drive, Moka",
    clientBRN: "C30098765",
    quotationDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    expiryDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), 
    items: createMockItems(3),
    ...calculateTotals(createMockItems(3), 1000),
    status: "Rejected",
    currency: "MUR",
    notes: "Budget constraints.",
    discount: 1000,
  },
];

mockQuotations.forEach(q => {
  const tempItems = q.items.length > 0 ? q.items : createMockItems(1); // Ensure items exist before calc
  const { subTotal, discount, vatAmount, grandTotal } = calculateTotals(tempItems, q.discount);
  q.items = tempItems;
  q.subTotal = subTotal;
  q.discount = discount;
  q.vatAmount = vatAmount;
  q.grandTotal = grandTotal;
});

const wonQuotationForInvoice = mockQuotations.find(q => q.status === "Won");
let invoiceItems = createMockItems(1);
let invoiceClientDetails = {
    clientName: "Global Biz Ltd.",
    clientEmail: "global@biz.com",
    clientPhone: "+230 5555 0404",
    clientAddress: "4 Business Park, Port Louis",
    clientBRN: "C40011223",
    clientCompany: "Global Biz Co"
};
let invoiceDiscount = 0;

if (wonQuotationForInvoice) {
    invoiceItems = wonQuotationForInvoice.items;
    invoiceClientDetails = {
        clientName: wonQuotationForInvoice.clientName,
        clientCompany: wonQuotationForInvoice.clientCompany,
        clientEmail: wonQuotationForInvoice.clientEmail,
        clientPhone: wonQuotationForInvoice.clientPhone,
        clientAddress: wonQuotationForInvoice.clientAddress,
        clientBRN: wonQuotationForInvoice.clientBRN,
    };
    invoiceDiscount = wonQuotationForInvoice.discount || 0;
}


export const mockInvoices: Invoice[] = [
  {
    id: generateInvoiceId(invoiceClientDetails.clientName),
    quotationId: wonQuotationForInvoice?.id,
    ...invoiceClientDetails,
    invoiceDate: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    dueDate: nextMonth.toISOString(),
    items: invoiceItems,
    ...calculateTotals(invoiceItems, invoiceDiscount),
    paymentStatus: "Unpaid",
    currency: "MUR",
    discount: invoiceDiscount,
  },
  {
    id: generateInvoiceId("General Electrics"),
    clientName: "General Electrics Ltd.",
    clientEmail: "contact@generalelectrics.com",
    clientPhone: "+230 5555 0505",
    clientAddress: "5 Industrial Zone, Pailles",
    clientBRN: "C50033445",
    clientCompany: "GE Inc.",
    invoiceDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    dueDate: today.toISOString(), 
    items: createMockItems(2),
    ...calculateTotals(createMockItems(2), 250), 
    paymentStatus: "Unpaid",
    currency: "MUR",
    notes: "Payment reminder sent.",
    discount: 250,
  },
];

mockInvoices.forEach(inv => {
  const tempItems = inv.items.length > 0 ? inv.items : createMockItems(1); // Ensure items exist
  const { subTotal, discount, vatAmount, grandTotal } = calculateTotals(tempItems, inv.discount);
  inv.items = tempItems;
  inv.subTotal = subTotal;
  inv.discount = discount;
  inv.vatAmount = vatAmount;
  inv.grandTotal = grandTotal;
});


export const getMockQuotations = async (): Promise<Quotation[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...mockQuotations]), 500));
};

export const getMockQuotationById = async (id: string): Promise<Quotation | undefined> => {
  return new Promise(resolve => setTimeout(() => resolve(mockQuotations.find(q => q.id === id)), 300));
};

export const addMockQuotation = async (quotation: Omit<Quotation, 'id' | 'quotationDate' | 'expiryDate'>): Promise<Quotation> => {
  const newQuotation: Quotation = {
    ...quotation,
    id: generateQuotationId(quotation.clientName),
    quotationDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
    discount: quotation.discount || 0,
  };
  mockQuotations.unshift(newQuotation);
  return new Promise(resolve => setTimeout(() => resolve(newQuotation), 300));
};

export const updateMockQuotationStatus = async (id: string, status: import('./constants').QuotationStatus): Promise<Quotation | undefined> => {
  const quotationIndex = mockQuotations.findIndex(q => q.id === id);
  if (quotationIndex > -1) {
    mockQuotations[quotationIndex].status = status;
    const quotation = mockQuotations[quotationIndex];
    if (status === 'Won' && !mockInvoices.find(inv => inv.quotationId === id)) {
      const newInvoice: Invoice = {
        id: generateInvoiceId(quotation.clientName),
        quotationId: quotation.id,
        clientName: quotation.clientName,
        clientCompany: quotation.clientCompany,
        clientEmail: quotation.clientEmail,
        clientPhone: quotation.clientPhone,
        clientAddress: quotation.clientAddress,
        clientBRN: quotation.clientBRN,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
        items: quotation.items,
        subTotal: quotation.subTotal,
        discount: quotation.discount,
        vatAmount: quotation.vatAmount,
        grandTotal: quotation.grandTotal,
        paymentStatus: 'Unpaid',
        currency: quotation.currency,
        notes: `Generated from Quotation ${quotation.id}`,
      };
      mockInvoices.unshift(newInvoice);
    }
    return new Promise(resolve => setTimeout(() => resolve(quotation), 300));
  }
  return new Promise(resolve => setTimeout(() => resolve(undefined), 300));
};


export const getMockInvoices = async (): Promise<Invoice[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...mockInvoices]), 500));
};

export const getMockInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  return new Promise(resolve => setTimeout(() => resolve(mockInvoices.find(inv => inv.id === id)), 300));
};
