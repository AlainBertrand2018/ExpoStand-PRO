
"use client";
import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit3, MoreHorizontal, CheckCircle, XCircle, Send as SendIcon, Mail, Info } from 'lucide-react';
import type { Quotation } from '@/lib/types';
import { QUOTATION_STATUSES, QuotationStatus, COMPANY_DETAILS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMockQuotationById } from '@/lib/mockData';
import { generatePdfDocument } from '@/lib/pdfGenerator';

interface QuotationsTableProps {
  quotations: Quotation[];
  onUpdateStatus: (id: string, status: QuotationStatus) => void;
  isLoading?: boolean;
}

export function QuotationsTable({ quotations, onUpdateStatus, isLoading }: QuotationsTableProps) {
  const { toast } = useToast();

  if (!isLoading && quotations.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Quotations Found"
        description="You haven't created any quotations yet. Get started by creating a new one."
        actionText="Create New Quotation"
        actionHref="/quotations/new"
      />
    );
  }

  const handleSendQuotationPdf = async (quotationId: string, clientEmail: string | undefined, clientName: string) => {
    if (!clientEmail) {
      toast({
        title: "Cannot Prepare Email",
        description: `Client email is missing for quotation ${quotationId}. Please edit the quotation to add an email address.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const quotation = await getMockQuotationById(quotationId);
      if (!quotation) {
        toast({
          title: "Error",
          description: `Quotation ${quotationId} not found.`,
          variant: "destructive",
        });
        return;
      }

      // Generate and trigger download of the PDF
      generatePdfDocument(quotation, 'Quotation');
      toast({
        title: "PDF Downloading",
        description: `Quotation ${quotation.id}.pdf is downloading. Please attach it to the email.`,
        duration: 7000,
      });

      // Prepare mailto link
      const subject = encodeURIComponent(`Quotation ${quotation.id} from ${COMPANY_DETAILS.name}`);
      const body = encodeURIComponent(
`Dear ${clientName},

Please find our quotation ${quotation.id} attached.

If the PDF did not download automatically, please check your browser's downloads.

We look forward to hearing from you.

Best regards,
The Team at ${COMPANY_DETAILS.name}
(via ExpoStand Pro)
${COMPANY_DETAILS.email}`
      );
      
      window.location.href = `mailto:${clientEmail}?subject=${subject}&body=${body}`;

    } catch (error) {
      console.error("Error preparing quotation email:", error);
      toast({
        title: "Error",
        description: "Could not prepare the email for the quotation.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: QuotationStatus) => {
    switch (status) {
      case 'Won':
        return 'default';
      case 'Sent':
      case 'To Send':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };


  return (
    <div className="rounded-lg border overflow-hidden bg-card shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`loading-${i}`}>
              <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24"></div></TableCell>
              <TableCell><div className="h-4 bg-muted rounded animate-pulse w-32"></div></TableCell>
              <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20"></div></TableCell>
              <TableCell className="text-right"><div className="h-4 bg-muted rounded animate-pulse w-16 ml-auto"></div></TableCell>
              <TableCell><div className="h-6 bg-muted rounded animate-pulse w-20"></div></TableCell>
              <TableCell className="text-center"><div className="h-8 bg-muted rounded animate-pulse w-8 mx-auto"></div></TableCell>
            </TableRow>
          ))}
          {!isLoading && quotations.map((quotation) => (
            <TableRow key={quotation.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">
                <Link href={`/quotations/${quotation.id}`} className="hover:underline text-primary">
                  {quotation.id}
                </Link>
              </TableCell>
              <TableCell>{quotation.clientName} {quotation.clientCompany && `(${quotation.clientCompany})`}</TableCell>
              <TableCell>{formatDate(quotation.quotationDate)}</TableCell>
              <TableCell className="text-right">{formatCurrency(quotation.grandTotal, quotation.currency)}</TableCell>
              <TableCell>
                <Badge 
                  variant={getStatusBadgeVariant(quotation.status)}
                  className="capitalize"
                >
                  {quotation.status}
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
                      <Link href={`/quotations/${quotation.id}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendQuotationPdf(quotation.id, quotation.clientEmail, quotation.clientName)}>
                      <Mail className="mr-2 h-4 w-4" /> Send PDF
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem disabled> 
                      <Edit3 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    {QUOTATION_STATUSES.map(status => (
                      <DropdownMenuItem 
                        key={status} 
                        onClick={() => onUpdateStatus(quotation.id, status)}
                        disabled={quotation.status === status}
                        className="capitalize"
                      >
                        {status === 'To Send' && <Info className="mr-2 h-4 w-4" />}
                        {status === 'Sent' && <SendIcon className="mr-2 h-4 w-4" />}
                        {status === 'Won' && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                        {status === 'Rejected' && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                        Mark as {status}
                      </DropdownMenuItem>
                    ))}
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
