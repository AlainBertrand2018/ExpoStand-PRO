export const COMPANY_DETAILS = {
  name: "Festival International Des Saveurs Ltd.",
  brn: "C24215222",
  vat: "28111871",
  address: "23, Floor 2, Block 4, The Docks, Port Louis",
  tel: "+230 215 3090",
  url: "www.fids-maurice.online",
  email: "info@fids-maurice.online",
};

export type StandType = {
  id: string;
  name: string;
  available: number;
  minArea: string;
  unitPrice: number;
  currency: string;
  remarks?: string;
};

export const STAND_TYPES: StandType[] = [
  { id: "sme_skybridge", name: "SME Skybridge", available: 60, minArea: "9m²", unitPrice: 15000, currency: "MUR" },
  { id: "souk_zone", name: "Souk Zone", available: 14, minArea: "9m²", unitPrice: 45000, currency: "MUR" },
  { id: "regional_pavilions", name: "Regional Pavilions", available: 6, minArea: "<200m² - 15 Stands Max", unitPrice: 1200000, currency: "MUR" },
  { id: "main_expo", name: "Main Expo", available: 30, minArea: "9m²", unitPrice: 90000, currency: "MUR" },
  { id: "foodcourt_stations", name: "Foodcourt Cooking Stations", available: 12, minArea: "9m²", unitPrice: 20000, currency: "MUR", remarks: "Revenue sharing 70/30" },
  { id: "gastronomic_pavilions", name: "Gastronomic Pavilions", available: 3, minArea: "<300m²", unitPrice: 1400000, currency: "MUR" },
];

export const VAT_RATE = 0.15; // 15%

export const QUOTATION_STATUSES = ["Sent", "Won", "Rejected"] as const;
export type QuotationStatus = typeof QUOTATION_STATUSES[number];

export const INVOICE_PAYMENT_STATUSES = ["Unpaid", "Paid", "Overdue"] as const;
export type InvoicePaymentStatus = typeof INVOICE_PAYMENT_STATUSES[number];

export const APP_NAME = "ExpoStand Pro";
