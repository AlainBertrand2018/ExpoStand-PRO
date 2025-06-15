"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { QuotationsTable } from '@/components/quotations/QuotationsTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import type { Quotation } from '@/lib/types';
import { QuotationStatus } from '@/lib/constants';
import { getMockQuotations, updateMockQuotationStatus } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMockQuotations();
      setQuotations(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch quotations.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleUpdateStatus = async (id: string, status: QuotationStatus) => {
    try {
      const updatedQuotation = await updateMockQuotationStatus(id, status);
      if (updatedQuotation) {
        setQuotations(prev => prev.map(q => q.id === id ? updatedQuotation : q));
        toast({
          title: "Status Updated",
          description: `Quotation ${id} status changed to ${status}.`,
        });
        if (status === 'Won') {
          // Potentially refresh invoices list or navigate if an invoice was auto-generated and needs viewing
          // For now, just a toast. A real app might re-fetch invoices or redirect.
          toast({
            title: "Invoice Generated",
            description: `An invoice has been automatically generated for quotation ${id}.`,
            duration: 5000,
            action: <Button variant="outline" size="sm" onClick={() => router.push('/invoices')}>View Invoices</Button>
          });
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  return (
    <>
      <PageHeader
        title="Quotations"
        description="Manage all your quotations and their statuses."
        actions={
          <Link href="/quotations/new">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Quotation
            </Button>
          </Link>
        }
      />
      <QuotationsTable quotations={quotations} onUpdateStatus={handleUpdateStatus} isLoading={isLoading} />
    </>
  );
}
