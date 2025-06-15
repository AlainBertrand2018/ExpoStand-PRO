"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { InvoiceView } from '@/components/invoices/InvoiceView';
import type { Invoice } from '@/lib/types';
import { getMockInvoiceById } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileSearch } from 'lucide-react';


export default function ViewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getMockInvoiceById(id)
        .then(data => {
          if (data) {
            setInvoice(data);
          } else {
            setInvoice(null);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return <FullPageLoading message="Loading invoice details..." />;
  }

  if (!invoice) {
     return (
       <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
        <EmptyState
            icon={FileSearch}
            title="Invoice Not Found"
            description={`The invoice with ID "${id}" could not be found. It might have been deleted or the ID is incorrect.`}
            actionText="View All Invoices"
            actionHref="/invoices"
        />
       </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Invoice ${invoice.id}`}
        description={`Details for invoice to ${invoice.clientName}.`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
      <InvoiceView invoice={invoice} />
    </>
  );
}
