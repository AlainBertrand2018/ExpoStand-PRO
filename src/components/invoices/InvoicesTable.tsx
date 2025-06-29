
"use client";
import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Send, CreditCard, Mail } from 'lucide-react';
import type { Invoice } from '@/lib/types';
import { INVOICE_PAYMENT_STATUSES, InvoicePaymentStatus, COMPANY_DETAILS, APP_NAME } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMockInvoiceById } from '@/lib/mockData';
import { generatePdfDocument } from '@/lib/pdfGenerator';
import { useAuth } from '@/context/AuthContext';


interface InvoicesTableProps {
  invoices: Invoice[];
  onUpdatePaymentStatus?: (id: string, status: InvoicePaymentStatus) => void;
  isLoading?: boolean;
}

export function InvoicesTable({ invoices, onUpdatePaymentStatus, isLoading }: InvoicesTableProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth(); // Although not used for RBAC here yet, good to have if needed

  if (!isLoading && invoices.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Invoices Found"
        description="There are no invoices to display. Invoices are typically generated when quotations are marked as 'Won'."
        actionText="View Quotations"
        actionHref="/quotations"
      />
    );
  }

  const handleSendInvoicePdf = async (invoiceId: string, clientEmail: string | undefined, clientName: string) => {
    if (!clientEmail) {
      toast({
        title: "Cannot Prepare Email",
        description: `Client email is missing for invoice ${invoiceId}. Please check the original quotation or client details.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const invoice = await getMockInvoiceById(invoiceId);
      if (!invoice) {
        toast({
          title: "Error",
          description: `Invoice ${invoiceId} not found.`,
          variant: "destructive",
        });
        return;
      }

      generatePdfDocument(invoice, 'Invoice'); // This triggers the download
      toast({
        title: "PDF Downloading",
        description: `Invoice ${invoice.id}.pdf is downloading. Please attach it to the email.`,
        duration: 7000,
      });

      const subject = encodeURIComponent(`Invoice ${invoice.id} from ${COMPANY_DETAILS.name}`);
      const body = encodeURIComponent(
`Dear ${clientName},

Please find your invoice ${invoice.id} attached.

If the PDF did not download automatically, please check your browser's downloads.

Thank you for your business.

Sincerely,
The Team at ${COMPANY_DETAILS.name}
(marketing@fids-maurice.online via ${APP_NAME})`
      );

      window.location.href = `mailto:${clientEmail}?subject=${subject}&body=${body}`;

    } catch (error) {
      console.error("Error preparing invoice email:", error);
      toast({
        title: "Error",
        description: "Could not prepare the email for the invoice.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden bg-card shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && Array.from({ length: 5 }).map((_, i) => (
             <TableRow key={`loading-${i}`}>
              <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24"></div></TableCell>
              <TableCell><div className="h-4 bg-muted rounded animate-pulse w-32"></div></TableCell>
              <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20"></div></TableCell>
              <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20"></div></TableCell>
              <TableCell className="text-right"><div className="h-4 bg-muted rounded animate-pulse w-16 ml-auto"></div></TableCell>
              <TableCell><div className="h-6 bg-muted rounded animate-pulse w-20"></div></TableCell>
              <TableCell className="text-center"><div className="h-8 bg-muted rounded animate-pulse w-8 mx-auto"></div></TableCell>
            </TableRow>
          ))}
          {!isLoading && invoices.map((invoice) => (
            <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">
                <Link href={`/invoices/${invoice.id}`} className="hover:underline text-primary">
                  {invoice.id}
                </Link>
              </TableCell>
              <TableCell>{invoice.clientName} {invoice.clientCompany && `(${invoice.clientCompany})`}</TableCell>
              <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
              <TableCell>{formatDate(invoice.dueDate)}</TableCell>
              <TableCell className="text-right">{formatCurrency(invoice.grandTotal, invoice.currency)}</TableCell>
              <TableCell>
                <Badge
                  variant={invoice.paymentStatus === 'Paid' ? 'default' : invoice.paymentStatus === 'Unpaid' ? 'secondary' : 'destructive'}
                  className="capitalize"
                >
                  {invoice.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                       <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/invoices/${invoice.id}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendInvoicePdf(invoice.id, invoice.clientEmail, invoice.clientName)}>
                      <Mail className="mr-2 h-4 w-4" /> Send PDF
                    </DropdownMenuItem>
                    {/* Add Edit/Delete for Invoices here if needed, similar to QuotationsTable, checking for isSuperAdmin */}
                    {onUpdatePaymentStatus && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
                        {INVOICE_PAYMENT_STATUSES.map(status => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => onUpdatePaymentStatus(invoice.id, status)}
                            disabled={invoice.paymentStatus === status}
                            className="capitalize"
                          >
                            {status === 'Paid' && <CreditCard className="mr-2 h-4 w-4 text-green-500" />}
                            {status === 'Unpaid' && <Send className="mr-2 h-4 w-4" />}
                            {status === 'Overdue' && <CreditCard className="mr-2 h-4 w-4 text-red-500" />}
                            Mark as {status}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
