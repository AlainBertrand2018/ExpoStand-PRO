"use client";
import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Send, CreditCard } from 'lucide-react';
import type { Invoice } from '@/lib/types';
import { INVOICE_PAYMENT_STATUSES, InvoicePaymentStatus } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';


interface InvoicesTableProps {
  invoices: Invoice[];
  onUpdatePaymentStatus?: (id: string, status: InvoicePaymentStatus) => void; // Optional for now
  isLoading?: boolean;
}

export function InvoicesTable({ invoices, onUpdatePaymentStatus, isLoading }: InvoicesTableProps) {
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
                            {status === 'Unpaid' && <Send className="mr-2 h-4 w-4" />} {/* Icon for unpaid could be Send (reminder) */}
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
