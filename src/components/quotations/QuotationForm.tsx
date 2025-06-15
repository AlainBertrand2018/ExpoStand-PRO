
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { STAND_TYPES, VAT_RATE, QUOTATION_STATUSES } from '@/lib/constants';
import type { DocumentItem, Quotation, ClientDetails } from '@/lib/types';
import { formatCurrency, formatDate, generateQuotationId, getStandTypeName } from '@/lib/utils';
import { PlusCircle, Trash2, Save, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; 

const quotationItemSchema = z.object({
  id: z.string().optional(), // Existing item ID for updates
  standTypeId: z.string().min(1, "Stand type is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  total: z.number(),
});

const quotationFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientCompany: z.string().optional(),
  clientEmail: z.string().email("Invalid email address").min(1, "Client email is required"),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  clientBRN: z.string().optional(),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
  discount: z.coerce.number().min(0, "Discount cannot be negative").optional().default(0),
  notes: z.string().optional(),
  status: z.enum(QUOTATION_STATUSES), // Default is handled by form init
  currency: z.string().default('MUR'),
});

type QuotationFormValues = z.infer<typeof quotationFormSchema>;

interface QuotationFormProps {
  initialData?: Quotation; 
  saveQuotation: (data: Quotation) => Promise<Quotation | void | undefined>;
  mode: 'create' | 'edit';
}

export function QuotationForm({ initialData, saveQuotation, mode }: QuotationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      discount: initialData.discount || 0,
      items: initialData.items.map(item => ({
        id: item.id, // Important for edit mode
        standTypeId: item.standTypeId,
        description: item.description || getStandTypeName(item.standTypeId, STAND_TYPES) || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      // status will be set from initialData.status
    } : {
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientBRN: '',
      items: [{ standTypeId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }], // id will be undefined for new items
      discount: 0,
      notes: '',
      status: 'To Send', // Default for new quotations
      currency: 'MUR',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("discount");

  const calculateTotals = useCallback(() => {
    const subTotal = watchedItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const discountAmount = watchedDiscount || 0;
    const amountBeforeVat = Math.max(0, subTotal - discountAmount);
    const vatAmount = amountBeforeVat * VAT_RATE;
    const grandTotal = amountBeforeVat + vatAmount;
    return { subTotal, discountAmount, vatAmount, grandTotal };
  }, [watchedItems, watchedDiscount]);

  const [totals, setTotals] = useState(calculateTotals());

  useEffect(() => {
    setTotals(calculateTotals());
  }, [watchedItems, watchedDiscount, calculateTotals]);

  const handleStandTypeChange = (index: number, standTypeId: string) => {
    const selectedStand = STAND_TYPES.find(s => s.id === standTypeId);
    if (selectedStand) {
      const currentItem = form.getValues(`items.${index}`);
      const quantity = currentItem?.quantity || 1;
      form.setValue(`items.${index}.standTypeId`, selectedStand.id);
      form.setValue(`items.${index}.description`, selectedStand.name);
      form.setValue(`items.${index}.unitPrice`, selectedStand.unitPrice);
      form.setValue(`items.${index}.total`, quantity * selectedStand.unitPrice);
    }
  };

  const handleQuantityChange = (index: number, quantityInput: string | number) => {
    const numQuantity = Number(quantityInput);
    const validQuantity = isNaN(numQuantity) || numQuantity < 1 ? 1 : numQuantity;
    const currentItem = form.getValues(`items.${index}`);
    const unitPrice = currentItem?.unitPrice || 0;
    form.setValue(`items.${index}.quantity`, validQuantity);
    form.setValue(`items.${index}.total`, validQuantity * unitPrice);
  };
  
  const handleUnitPriceChange = (index: number, unitPriceInput: string | number) => {
    const numUnitPrice = Number(unitPriceInput);
    const validUnitPrice = isNaN(numUnitPrice) || numUnitPrice < 0 ? 0 : numUnitPrice;
    const currentItem = form.getValues(`items.${index}`);
    const quantity = currentItem?.quantity || 0;
    form.setValue(`items.${index}.unitPrice`, validUnitPrice);
    form.setValue(`items.${index}.total`, quantity * validUnitPrice);
  };

  async function onSubmit(data: QuotationFormValues) {
    setIsLoading(true);
    const { subTotal, discountAmount, vatAmount, grandTotal } = calculateTotals();
    
    const quotationData: Quotation = {
      id: initialData?.id || generateQuotationId(data.clientName),
      quotationDate: initialData?.quotationDate || new Date().toISOString(),
      expiryDate: initialData?.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      clientName: data.clientName,
      clientCompany: data.clientCompany,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      clientAddress: data.clientAddress,
      clientBRN: data.clientBRN,
      items: data.items.map((item): DocumentItem => ({
        id: item.id || `item-new-${Date.now()}-${Math.random().toString(36).substring(2,5)}`, // Ensure every item has an ID
        standTypeId: item.standTypeId,
        description: item.description || getStandTypeName(item.standTypeId, STAND_TYPES) || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      subTotal,
      discount: discountAmount,
      vatAmount,
      grandTotal,
      status: data.status, // Status comes from the form (which was initialized by initialData.status if editing)
      notes: data.notes,
      currency: data.currency,
    };

    try {
      const result = await saveQuotation(quotationData);
      const resultId = result ? (result as Quotation).id : quotationData.id;

      toast({
        title: mode === 'create' ? "Quotation Created" : "Quotation Updated",
        description: `Quotation ${resultId} has been successfully ${mode === 'create' ? 'created' : 'updated'}.`,
      });
      router.push(`/quotations/${resultId}`);
    } catch (error) {
      console.error(`Failed to ${mode} quotation:`, error);
      toast({
        title: "Error",
        description: `Failed to ${mode} quotation. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Email*</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter client email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="clientBRN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client BRN</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client BRN (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter mobile number (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientAddress"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter client address (optional)" {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quotation Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => ( // field here is the react-hook-form field object, not the data item directly
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border rounded-lg relative">
                 <FormField
                  control={form.control}
                  name={`items.${index}.standTypeId`}
                  render={({ field: controllerField }) => ( // Renamed to avoid confusion with outer field
                    <FormItem className="md:col-span-4">
                      <FormLabel>Stand Type*</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          controllerField.onChange(value);
                          handleStandTypeChange(index, value);
                        }} 
                        defaultValue={controllerField.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stand type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAND_TYPES.map(stand => (
                            <SelectItem key={stand.id} value={stand.id} disabled={stand.available <=0 && (!initialData || initialData.items.find(i=>i.standTypeId === stand.id)?.standTypeId !== stand.id )}>
                              {stand.name} ({stand.available > 0 || (initialData && initialData.items.find(i=>i.standTypeId === stand.id)) ? `${stand.available} available` : 'Sold out'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field: controllerField }) => (
                    <FormItem className="md:col-span-3 hidden md:block">
                      <FormLabel>Description</FormLabel>
                       <FormControl>
                        <Input placeholder="Stand description" {...controllerField} readOnly />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field: controllerField }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Qty*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...controllerField} 
                          value={controllerField.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            controllerField.onChange(value === '' ? undefined : parseInt(value, 10));
                            handleQuantityChange(index, value === '' ? 1 : parseInt(value, 10));
                          }}
                          min="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.unitPrice`}
                  render={({ field: controllerField }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Unit Price*</FormLabel>
                       <FormControl>
                         <Input 
                          type="number" 
                          placeholder="0.00" 
                          step="any"
                          {...controllerField} 
                          value={controllerField.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            controllerField.onChange(value === '' ? undefined : parseFloat(value));
                            handleUnitPriceChange(index, value === '' ? 0 : parseFloat(value));
                          }}
                          readOnly={!STAND_TYPES.find(st => st.id === watchedItems[index]?.standTypeId)?.remarks?.includes("Revenue sharing")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-1 text-right font-medium self-center pt-7">
                   {formatCurrency(watchedItems[index]?.total || 0, form.getValues('currency'))}
                </div>
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="md:col-span-1 text-destructive hover:text-destructive-foreground hover:bg-destructive/90 absolute top-2 right-2 md:static md:self-center"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ standTypeId: '', description:'', quantity: 1, unitPrice: 0, total: 0 })} // New items won't have an 'id' here
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary & Notes</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any notes for the client (optional)" {...field} rows={4}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount ({form.getValues('currency')})</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="any"
                        {...field} 
                        value={field.value ?? ''} // Use ?? instead of || to allow 0
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) || value < 0 ? 0 : value); // Ensure non-negative
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2 text-right bg-muted/30 p-4 rounded-lg self-start">
              <div className="flex justify-between"><span>Subtotal:</span> <span>{formatCurrency(totals.subTotal, form.getValues('currency'))}</span></div>
              { (totals.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Discount:</span> 
                  <span>-{formatCurrency(totals.discountAmount, form.getValues('currency'))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Amount before VAT:</span> 
                <span>{formatCurrency(Math.max(0, totals.subTotal - (totals.discountAmount || 0)), form.getValues('currency'))}</span>
              </div>
              <div className="flex justify-between"><span>VAT ({VAT_RATE * 100}%):</span> <span>{formatCurrency(totals.vatAmount, form.getValues('currency'))}</span></div>
              <div className="flex justify-between font-bold text-lg text-primary border-t pt-2 mt-2"><span>Grand Total:</span> <span>{formatCurrency(totals.grandTotal, form.getValues('currency'))}</span></div>
            </div>
             <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Status</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QUOTATION_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? <><Save className="mr-2 h-4 w-4 animate-pulse" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> {mode === 'create' ? 'Save Quotation' : 'Update Quotation'}</>}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
