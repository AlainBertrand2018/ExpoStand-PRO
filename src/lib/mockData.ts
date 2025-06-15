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
      id: `item-${Date.now()}-${i}`,
      standTypeId: standType.id,
      description: standType.name,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    });
  }
  return items;
};

const calculateTotals = (items: import('./types').DocumentItem[]) => {
  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = subTotal * VAT_RATE;
  const grandTotal = subTotal + vatAmount;
  return { subTotal, vatAmount, grandTotal };
};

export const mockQuotations: Quotation[] = [
  {
    id: generateQuotationId("TechCorp"),
    clientName: "TechCorp Solutions",
    clientCompany: "TechCorp Ltd.",
    clientEmail: "contact@techcorp.com",
    quotationDate: today.toISOString(),
    expiryDate: nextWeek.toISOString(),
    items: createMockItems(2),
    ...calculateTotals(createMockItems(2)), // Recalculate with same items for consistency, or store items first
    status: "Sent",
    currency: "MUR",
    notes: "Early bird discount applied.",
  },
  {
    id: generateQuotationId("Foodies"),
    clientName: "Alice Wonderland",
    clientCompany: "Foodies Delight",
    clientEmail: "alice@foodies.com",
    quotationDate: new Date(today.setDate(today.getDate() - 5)).toISOString(),
    expiryDate: tomorrow.toISOString(),
    items: createMockItems(1),
    ...calculateTotals(createMockItems(1)),
    status: "Won",
    currency: "MUR",
  },
  {
    id: generateQuotationId("Innovate"),
    clientName: "Innovate Hub",
    clientEmail: "info@innovate.mu",
    quotationDate: new Date(today.setDate(today.getDate() - 10)).toISOString(),
    expiryDate: new Date(today.setDate(today.getDate() - 3)).toISOString(), // Expired
    items: createMockItems(3),
    ...calculateTotals(createMockItems(3)),
    status: "Rejected",
    currency: "MUR",
    notes: "Budget constraints.",
  },
];

// Update items to be consistent for mockQuotations
mockQuotations.forEach(q => {
  const { subTotal, vatAmount, grandTotal } = calculateTotals(q.items);
  q.subTotal = subTotal;
  q.vatAmount = vatAmount;
  q.grandTotal = grandTotal;
});


export const mockInvoices: Invoice[] = [
  {
    id: generateInvoiceId("Foodies"),
    quotationId: mockQuotations.find(q => q.status === "Won")?.id,
    clientName: "Alice Wonderland",
    clientCompany: "Foodies Delight",
    clientEmail: "alice@foodies.com",
    invoiceDate: new Date(today.setDate(today.getDate() - 4)).toISOString(), // Assuming won 4 days ago
    dueDate: nextMonth.toISOString(),
    items: mockQuotations.find(q => q.status === "Won")?.items || createMockItems(1),
    ...calculateTotals(mockQuotations.find(q => q.status === "Won")?.items || createMockItems(1)),
    paymentStatus: "Unpaid",
    currency: "MUR",
  },
  {
    id: generateInvoiceId("GlobalBiz"),
    clientName: "Global Biz Ltd.",
    invoiceDate: new Date(today.setDate(today.getDate() - 30)).toISOString(),
    dueDate: today.toISOString(), // Due today
    items: createMockItems(2),
    ...calculateTotals(createMockItems(2)),
    paymentStatus: "Unpaid",
    currency: "MUR",
    notes: "Payment reminder sent.",
  },
];

// Update items to be consistent for mockInvoices
mockInvoices.forEach(inv => {
  const { subTotal, vatAmount, grandTotal } = calculateTotals(inv.items);
  inv.subTotal = subTotal;
  inv.vatAmount = vatAmount;
  inv.grandTotal = grandTotal;
});


export const getMockQuotations = async (): Promise<Quotation[]> => {
  return new Promise(resolve => setTimeout(() => resolve(mockQuotations), 500));
};

export const getMockQuotationById = async (id: string): Promise<Quotation | undefined> => {
  return new Promise(resolve => setTimeout(() => resolve(mockQuotations.find(q => q.id === id)), 300));
};

export const addMockQuotation = async (quotation: Omit<Quotation, 'id' | 'quotationDate' | 'expiryDate'>): Promise<Quotation> => {
  const newQuotation: Quotation = {
    ...quotation,
    id: generateQuotationId(quotation.clientName),
    quotationDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days expiry
  };
  mockQuotations.unshift(newQuotation);
  return new Promise(resolve => setTimeout(() => resolve(newQuotation), 300));
};

export const updateMockQuotationStatus = async (id: string, status: import('./constants').QuotationStatus): Promise<Quotation | undefined> => {
  const quotation = mockQuotations.find(q => q.id === id);
  if (quotation) {
    quotation.status = status;
    if (status === 'Won' && !mockInvoices.find(inv => inv.quotationId === id)) {
      // Auto-generate invoice
      const newInvoice: Invoice = {
        id: generateInvoiceId(quotation.clientName),
        quotationId: quotation.id,
        clientName: quotation.clientName,
        clientCompany: quotation.clientCompany,
        clientEmail: quotation.clientEmail,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days due
        items: quotation.items,
        subTotal: quotation.subTotal,
        vatAmount: quotation.vatAmount,
        grandTotal: quotation.grandTotal,
        paymentStatus: 'Unpaid',
        currency: quotation.currency,
        notes: `Generated from Quotation ${quotation.id}`,
      };
      mockInvoices.unshift(newInvoice);
    }
  }
  return new Promise(resolve => setTimeout(() => resolve(quotation), 300));
};


export const getMockInvoices = async (): Promise<Invoice[]> => {
  return new Promise(resolve => setTimeout(() => resolve(mockInvoices), 500));
};

export const getMockInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  return new Promise(resolve => setTimeout(() => resolve(mockInvoices.find(inv => inv.id === id)), 300));
};
