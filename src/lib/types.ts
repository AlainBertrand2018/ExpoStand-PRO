
import type { QuotationStatus, InvoicePaymentStatus, StandType } from "./constants";

export interface ClientDetails {
  clientName: string;
  clientCompany?: string;
  clientEmail: string; 
  clientPhone?: string; 
  clientAddress?: string; 
  clientBRN?: string; 
}

export interface DocumentItem {
  id: string; 
  standTypeId: StandType['id'];
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation extends ClientDetails {
  id: string; 
  quotationDate: string; 
  expiryDate: string; 
  items: DocumentItem[];
  subTotal: number;
  discount?: number; 
  vatAmount: number;
  grandTotal: number;
  status: QuotationStatus;
  notes?: string;
  currency: string;
}

export interface Invoice extends ClientDetails {
  id: string; 
  quotationId?: string; 
  invoiceDate: string; 
  dueDate: string; 
  items: DocumentItem[];
  subTotal: number;
  discount?: number; 
  vatAmount: number;
  grandTotal: number;
  paymentStatus: InvoicePaymentStatus;
  notes?: string;
  currency: string;
}
