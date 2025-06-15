
"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { QuotationForm } from '@/components/quotations/QuotationForm';
import type { Quotation } from '@/lib/types';
import { getMockQuotationById, updateMockQuotation } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileSearch } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = typeof params.id === 'string' ? params.id : '';
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  
  const { currentUser, isLoading: authIsLoading } = useAuth();
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  useEffect(() => {
    if (authIsLoading) return; // Wait for auth state to resolve

    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to edit quotations.",
        variant: "destructive",
      });
      router.replace('/quotations'); // Or a generic access denied page
      return;
    }

    if (id) {
      setIsLoading(true);
      getMockQuotationById(id)
        .then(data => {
          if (data) {
            setQuotation(data);
            setIsNotFound(false);
          } else {
            setQuotation(null);
            setIsNotFound(true);
          }
        })
        .catch(error => {
          console.error("Failed to fetch quotation for editing:", error);
          setIsNotFound(true);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      setIsNotFound(true); // No ID provided
    }
  }, [id, authIsLoading, isSuperAdmin, router, toast]);

  const handleFormSubmit = async (updatedQuotationData: Quotation) => {
    if (!quotation) return;
    // The updateMockQuotation function will handle the actual update logic
    return updateMockQuotation(updatedQuotationData.id, updatedQuotationData);
  };

  if (isLoading || authIsLoading) {
    return <FullPageLoading message="Loading quotation for editing..." />;
  }

  if (isNotFound || !quotation) {
    return (
       <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotations
        </Button>
        <EmptyState
            icon={FileSearch}
            title="Quotation Not Found"
            description={`The quotation with ID "${id}" could not be found or you do not have permission to edit it.`}
            actionText="View All Quotations"
            actionHref="/quotations"
        />
       </div>
    );
  }

  if (!isSuperAdmin) {
     // This case should be handled by the redirect in useEffect, but as a fallback:
    return <FullPageLoading message="Access Denied. Redirecting..." />;
  }

  return (
    <>
      <PageHeader
        title={`Edit Quotation ${quotation.id}`}
        description="Modify the details of the quotation below."
        actions={
          <Button variant="outline" onClick={() => router.push(`/quotations/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel Edit
          </Button>
        }
      />
      <Card className="shadow-xl">
        <CardContent className="p-6 md:p-8">
          <QuotationForm 
            initialData={quotation} 
            saveQuotation={handleFormSubmit} 
            mode="edit" 
          />
        </CardContent>
      </Card>
    </>
  );
}
