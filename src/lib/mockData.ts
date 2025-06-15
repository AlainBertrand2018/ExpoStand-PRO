
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

export let mockQuotations: Quotation[] = [];

export let mockInvoices: Invoice[] = [];


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

// Function to explicitly clear data - useful for testing or reset
export const clearMockData = () => {
  mockQuotations = [];
  mockInvoices = [];
};
