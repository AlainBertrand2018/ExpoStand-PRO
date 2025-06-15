
"use client";
import { PageHeader } from '@/components/shared/PageHeader';
import { QuotationForm } from '@/components/quotations/QuotationForm';
import { Card, CardContent } from '@/components/ui/card';
import { addMockQuotation } from '@/lib/mockData';
import type { Quotation } from '@/lib/types';

export default function NewQuotationPage() {
  const handleFormSubmit = async (quotationData: Quotation) => {
    // addMockQuotation now expects the full Quotation object
    return addMockQuotation(quotationData);
  };

  return (
    <>
      <PageHeader
        title="Create New Quotation"
        description="Fill in the details below to generate a new quotation."
      />
      <Card className="shadow-xl">
        <CardContent className="p-6 md:p-8">
          <QuotationForm 
            saveQuotation={handleFormSubmit} 
            mode="create" 
          />
        </CardContent>
      </Card>
    </>
  );
}
