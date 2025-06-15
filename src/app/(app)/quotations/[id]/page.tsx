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