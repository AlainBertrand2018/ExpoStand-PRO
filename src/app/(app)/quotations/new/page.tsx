import { PageHeader } from '@/components/shared/PageHeader';
import { QuotationForm } from '@/components/quotations/QuotationForm';
import { Card, CardContent } from '@/components/ui/card';

export default function NewQuotationPage() {
  return (
    <>
      <PageHeader
        title="Create New Quotation"
        description="Fill in the details below to generate a new quotation."
      />
      <Card className="shadow-xl">
        <CardContent className="p-6 md:p-8">
          <QuotationForm />
        </CardContent>
      </Card>
    </>
  );
}
