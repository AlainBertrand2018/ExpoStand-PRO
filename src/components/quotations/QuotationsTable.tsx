
"use client";
import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit3, MoreHorizontal, CheckCircle, XCircle, Send as SendIcon, Mail, Info, Trash2 } from 'lucide-react';
import type { Quotation } from '@/lib/types';
import { QUOTATION_STATUSES, QuotationStatus, COMPANY_DETAILS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMockQuotationById } from '@/lib/mockData';
import { generatePdfDocument } from '@/lib/pdfGenerator';
import { useAuth } from '@/context/AuthContext';

interface QuotationsTableProps {
  quotations: Quotation[];
  onUpdateStatus: (id: string, status: QuotationStatus) => void;
  isLoading?: boolean;
}

export function QuotationsTable({ quotations, onUpdateStatus, isLoading }: QuotationsTableProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'Super Admin';

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

      generatePdfDocument(quotation, 'Quotation');
      toast({
        title: "PDF Downloading",
        description: `Quotation ${quotation.id}.pdf is downloading. Please attach it to the email.`,
        duration: 7000,
      });

      const subject = encodeURIComponent(`Quotation ${quotation.id} from ${COMPANY_DETAILS.name}`);
      const body = encodeURIComponent(
`Dear ${clientName},

Please find our quotation ${quotation.id} attached.

If the PDF did not download automatically, please check your browser's downloads.

We look forward to hearing from you.

Best regards,
The Team at ${COMPANY_DETAILS.name}
(via ${APP_NAME} - ${COMPANY_DETAILS.email})`
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

  const handleDeleteQuotation = (quotationId: string) => {
    // Placeholder for actual delete logic
    toast({
      title: "Delete Action (Super Admin)",
      description: `Quotation ${quotationId} would be deleted. (Not implemented yet)`,
      variant: isSuperAdmin ? "default" : "destructive",
    });
    console.log(`Super Admin trying to delete quotation: ${quotationId}`);
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
                    
                    {isSuperAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                           <Link href={`/quotations/${quotation.id}/edit`} className="flex items-center">
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteQuotation(quotation.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </>
                    )}

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

```></content>
  </change>
  <change>
    <file>/src/app/(app)/quotations/[id]/page.tsx</file>
    <content><![CDATA[
"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { QuotationView } from '@/components/quotations/QuotationView';
import type { Quotation } from '@/lib/types';
import { getMockQuotationById } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileSearch } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ViewQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getMockQuotationById(id)
        .then(data => {
          if (data) {
            setQuotation(data);
          } else {
            setQuotation(null); // Explicitly set to null if not found
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return <FullPageLoading message="Loading quotation details..." />;
  }

  if (!quotation) {
    return (
       <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotations
        </Button>
        <EmptyState
            icon={FileSearch}
            title="Quotation Not Found"
            description={`The quotation with ID "${id}" could not be found. It might have been deleted or the ID is incorrect.`}
            actionText="View All Quotations"
            actionHref="/quotations"
        />
       </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Quotation ${quotation.id}`}
        description={`Details for quotation to ${quotation.clientName}.`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {isSuperAdmin && (
              <Link href={`/quotations/${id}/edit`}>
                <Button variant="default">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </Link>
            )}
          </div>
        }
      />
      <QuotationView quotation={quotation} />
    </>
  );
}

```