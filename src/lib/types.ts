
import type { QuotationStatus, InvoicePaymentStatus, StandType } from "./constants";

export interface ClientDetails {
  clientName: string;
  clientCompany?: string;
  clientEmail: string; // Made mandatory
  clientPhone?: string; // Added
  clientAddress?: string; // Added
  clientBRN?: string; // Added
}

export interface DocumentItem {
  id: string; // Unique ID for the item line
  standTypeId: StandType['id'];
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation extends ClientDetails {
  id: string; // Q-YYYYMMDD-XXXX
  quotationDate: string; // ISO string
  expiryDate: string; // ISO string
  items: DocumentItem[];
  subTotal: number;
  vatAmount: number;
  grandTotal: number;
  status: QuotationStatus;
  notes?: string;
  currency: string;
}

export interface Invoice extends ClientDetails {
  id: string; // INV-YYYYMMDD-XXXX
  quotationId?: string; // Link to original quotation if any
  invoiceDate: string; // ISO string
  dueDate: string; // ISO string
  items: DocumentItem[];
  subTotal: number;
  vatAmount: number;
  grandTotal: number;
  paymentStatus: InvoicePaymentStatus;
  notes?: string;
  currency: string;
}
