"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { InvoicesTable } from '@/components/invoices/InvoicesTable';
import type { Invoice } from '@/lib/types';
import { getMockInvoices } from '@/lib/mockData'; // Assuming mock data or API call
import { useToast } from '@/hooks/use-toast';
import { InvoicePaymentStatus } from '@/lib/constants';


export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMockInvoices();
      setInvoices(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch invoices.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);
  
  // Placeholder for updating payment status - in a real app, this would be an API call
  const handleUpdatePaymentStatus = async (id: string, status: InvoicePaymentStatus) => {
    // Simulate API call
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setInvoices(prevInvoices => 
      prevInvoices.map(inv => inv.id === id ? { ...inv, paymentStatus: status } : inv)
    );
    toast({
      title: "Payment Status Updated",
      description: `Invoice ${id} payment status changed to ${status}.`,
    });
    setIsLoading(false);
  };


  return (
    <>
      <PageHeader
        title="Invoices"
        description="View and manage all generated invoices."
        // No create button for invoices as they are auto-generated
      />
      <InvoicesTable 
        invoices={invoices} 
        isLoading={isLoading} 
        onUpdatePaymentStatus={handleUpdatePaymentStatus} 
      />
    </>
  );
}
