
"use client";
import React from 'react';
import type { Quotation } from '@/lib/types';
import { STAND_TYPES, VAT_RATE } from '@/lib/constants';
import { DocumentHeader } from '@/components/shared/DocumentHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { formatCurrency, formatDate, getStandTypeName } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface QuotationViewProps {
  quotation: Quotation;
}

export function QuotationView({ quotation }: QuotationViewProps) {
  const { toast } = useToast();

  const handleDownloadPdf = () => {
    toast({
      title: "PDF Download (Placeholder)",
      description: "Actual PDF generation would occur here.",
    });
  };
  
  const handlePrint = () => {
    toast({
      title: "Print (Placeholder)",
      description: "This would trigger the browser's print dialog.",
    });
    // window.print(); 
  }

  return (
    <Card className="shadow-xl w-full max-w-4xl mx-auto">
      <CardHeader className="bg-muted/30 p-6">
        <DocumentHeader />
        <div className="flex flex-col sm:flex-row justify-between items-start pt-4">
          <div>
            <CardTitle className="text-2xl font-bold text-primary mb-1">Quotation</CardTitle>
            <CardDescription>ID: {quotation.id}</CardDescription>
          </div>
          <div className="text-sm text-right mt-2 sm:mt-0 space-y-1">
            <p><strong>Date:</strong> {formatDate(quotation.quotationDate)}</p>
            <p><strong>Expires:</strong> {formatDate(quotation.expiryDate)}</p>
            <div><strong>Status:</strong> <Badge variant={quotation.status === 'Won' ? 'default' : quotation.status === 'Sent' ? 'secondary' : 'destructive'} className="capitalize text-sm ml-1">{quotation.status}</Badge></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-1">Bill To:</h3>
          <p className="font-medium">{quotation.clientName}</p>
          {quotation.clientCompany && <p>{quotation.clientCompany}</p>}
          <p>Email: {quotation.clientEmail}</p>
          {quotation.clientPhone && <p>Phone: {quotation.clientPhone}</p>}
          {quotation.clientAddress && <p>Address: {quotation.clientAddress}</p>}
          {quotation.clientBRN && <p>BRN: {quotation.clientBRN}</p>}
        </div>

        <Table className="mb-6">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Item Description</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotation.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className="font-medium">{getStandTypeName(item.standTypeId, STAND_TYPES)}</span>
                  {item.description && item.description !== getStandTypeName(item.standTypeId, STAND_TYPES) && <p className="text-xs text-muted-foreground">{item.description}</p>}
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unitPrice, quotation.currency)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.total, quotation.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end mb-6">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(quotation.subTotal, quotation.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT ({VAT_RATE * 100}%):</span>
              <span>{formatCurrency(quotation.vatAmount, quotation.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 border-primary">
              <span>Grand Total:</span>
              <span>{formatCurrency(quotation.grandTotal, quotation.currency)}</span>
            </div>
          </div>
        </div>

        {quotation.notes && (
          <div className="mb-6 p-4 bg-muted/50 rounded-md">
            <h4 className="font-semibold mb-1">Notes:</h4>
            <p className="text-sm whitespace-pre-wrap">{quotation.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          Thank you for your business! <br/> All prices are in {quotation.currency}. This quotation is valid until {formatDate(quotation.expiryDate)}.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={handleDownloadPdf} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
