import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, ScrollArea, Select, Sheet, toast } from 'erxes-ui';
import { Form } from 'erxes-ui/components/form';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { usePaymentAdd } from '~/modules/payment/hooks/usePaymentAdd';
import { usePaymentEdit } from '~/modules/payment/hooks/usePaymentEdit';
import { IPayment, IPaymentDocument } from '~/modules/payment/types/Payment';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';
import { paymentKind } from '~/modules/payment/utils';
import QuickQrForm from '~/modules/settings/payment/components/QuickQrForm';

type Props = {
  payment: any;
  onCancel: () => void;
};

// Base validation schema
const baseSchema = z.object({
  kind: z.string().min(1, 'Payment method is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  status: z.enum(['active', 'inactive'], {
    required_error: 'Status is required',
  }),
});

const quickQrSchema = z.object({
  kind: z.string().min(1, 'Payment method is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  status: z.enum(['active', 'inactive'], {
    required_error: 'Status is required',
  }),
  type: z.string().min(1, 'Type is required'),
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  registerNumber: z.string().optional(),
  mccCode: z.string().optional(),
  city: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  businessName: z.string().min(1, 'Business name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().min(1, 'Email is required'),
  bankAccount: z.string().min(1, 'Bank account is required'),
  bankCode: z.string().min(1, 'Bank code is required'),
  ibanNumber: z.string().min(1, 'IBAN number is required'),
  bankAccountName: z.string().min(1, 'Bank account name is required'),
});

// Dynamic schema generator based on payment kind
const createPaymentSchema = (selectedKind: string) => {
  if (!selectedKind) {
    return baseSchema;
  }

  const payment = paymentKind(selectedKind);
  if (!payment?.fields) {
    return baseSchema;
  }

  // Create dynamic fields schema
  const dynamicFields: Record<string, z.ZodType> = {};

  payment.fields.forEach((field) => {
    let fieldSchema: z.ZodType;

    switch (field.type) {
      case 'number':
        fieldSchema = z
          .string()
          .regex(/^\d+$/, `${field.label} must be a valid number`);
        break;
      case 'password':
        fieldSchema = z
          .string()
          .min(
            field.validation.value,
            `${field.label} must be at least ${field.validation.value} characters`,
          );
        break;
      default:
        fieldSchema = z.string().min(1, `${field.label} is required`);
    }

    // Apply optional/required based on field configuration

    dynamicFields[field.key] = fieldSchema;

    // Add custom validation if specified
    if (field.validation) {
      switch (field.validation.type) {
        case 'minLength':
          dynamicFields[field.key] = (
            dynamicFields[field.key] as z.ZodString
          ).min(
            field.validation.value,
            `${field.label} must be at least ${field.validation.value} characters`,
          );
          break;
        case 'maxLength':
          dynamicFields[field.key] = (
            dynamicFields[field.key] as z.ZodString
          ).max(
            field.validation.value,
            `${field.label} must be less than ${field.validation.value} characters`,
          );
          break;
      }
    }
  });

  if (selectedKind === PaymentKind.QUICKQR) {
    return quickQrSchema;
  }

  return baseSchema.extend(dynamicFields);
};

const PaymentForm = ({ payment, onCancel }: Props) => {
  const [selectedKind, setSelectedKind] = useState(payment?.kind || '');
  const [paymentState, setPayment] = useState<
    IPayment | IPaymentDocument | null
  >(payment);

  const { addPayment } = usePaymentAdd();
  const { editPayment } = usePaymentEdit();

  // Create dynamic schema based on selected payment kind
  const validationSchema = useMemo(
    () => createPaymentSchema(selectedKind),
    [selectedKind],
  );

  // Get default values from payment prop
  const getDefaultValues = useMemo(() => {
    if (!payment) {
      return { kind: '', name: '', status: 'active' };
    }

    const defaultValues: Record<string, any> = {
      kind: payment.kind || '',
      name: payment.name || '',
      status: payment.status || 'active',
    };

    // Add payment config values
    if (payment.config) {
      Object.entries(payment.config).forEach(([key, value]) => {
        if (value !== undefined) {
          defaultValues[key] = value;
        }
      });
    }

    if (selectedKind === PaymentKind.QUICKQR) {
      defaultValues.type = 'person';
      defaultValues.city = '11000';
    }

    return defaultValues;
  }, [payment, selectedKind]);

  // Initialize form with react-hook-form and zod resolver
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: getDefaultValues,
    mode: 'onBlur',
  });

  const {
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // Watch for kind changes to update schema
  const watchedKind = watch('kind');

  React.useEffect(() => {
    if (watchedKind !== selectedKind) {
      setSelectedKind(watchedKind);

      // Clear previous payment-specific fields when kind changes
      if (selectedKind) {
        const prevPayment = paymentKind(selectedKind);
        prevPayment?.fields.forEach((field) => {
          setValue(field.key as any, '');
        });
      }
    }
  }, [watchedKind, selectedKind, setValue]);

  React.useEffect(() => {
    if (payment) {
      setSelectedKind(payment.kind || '');
      // Reset form with payment values when payment prop changes
      form.reset(getDefaultValues);
    }
  }, [payment, form, getDefaultValues]);

  const onSubmit = (data: any) => {
    const input: IPayment = {
      name: data.name,
      kind: data.kind,
      status: data.status,
      config: {},
    };

    const config: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'kind' && key !== 'name' && key !== 'status') {
        config[key] = value;
      }
    });
    input.config = config;

    try {
      if (paymentState) {
        // Update existing payment
        editPayment({
          variables: {
            _id: payment._id,
            input,
          },
        })
          .then(() => {
            toast({
              title: 'Success',
              description: 'Payment method updated successfully',
            });
          })
          .catch((e) => {
            toast({
              title: 'Error',
              description: e.message,
            });
          });
      } else {
        addPayment({
          variables: {
            input,
          },
        })
          .then(() => {
            toast({
              title: 'Success',
              description: 'Payment method added successfully',
            });
          })
          .catch((e) => {
            toast({
              title: 'Error',
              description: e.message,
            });
          });
      }

      onCancel();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const currentPaymentKind = paymentKind(selectedKind);

  const renderQuickQr = () => {
    if (selectedKind !== PaymentKind.QUICKQR) {
      return null;
    }

    return <QuickQrForm payment={payment} form={form} Form={Form} />;
  };

  return (
    <Form {...form}>
      {/* Payment Kind Selection */}
      <form
        className="flex flex-col h-full overflow-hidden"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Sheet.Header className="gap-3 border-b">
          <Sheet.Title>{payment ? 'Edit Payment' : 'Add Payment'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="flex-auto overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-3 p-5">
              <Form.Field
                name="kind"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Payment Method *</Form.Label>
                    <Form.Control>
                      <Select
                        disabled={payment}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      >
                        <Form.Control>
                          <Select.Trigger>
                            <Select.Value
                              placeholder={
                                <span className="font-medium text-muted-foreground text-sm text-center truncate">
                                  {'Select payment method'}
                                </span>
                              }
                            >
                              <span className="font-medium text-foreground text-sm">
                                {
                                  Object.entries(PAYMENT_KINDS).find(
                                    ([key, method]) => key === field.value,
                                  )?.[1].name
                                }
                              </span>
                            </Select.Value>
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content
                          className="[&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 p-0 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 border [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto"
                          align="start"
                        >
                          <Select.Group>
                            {Object.entries(PAYMENT_KINDS).map(
                              ([key, method]) => (
                                <Select.Item
                                  key={key}
                                  className="h-7 text-xs"
                                  value={key}
                                >
                                  {method.name}
                                </Select.Item>
                              ),
                            )}
                          </Select.Group>
                        </Select.Content>
                      </Select>
                    </Form.Control>
                  </Form.Item>
                )}
              />

              {/* Display Name */}
              <Form.Field
                name="name"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Display Name *</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder="Enter a name for this payment method"
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />

              {/* Status */}
              <Form.Field
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Status *</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      >
                        <Form.Control>
                          <Select.Trigger>
                            <Select.Value
                              placeholder={
                                <span className="font-medium text-muted-foreground text-sm text-center truncate">
                                  {'Select status'}
                                </span>
                              }
                            >
                              <span className="font-medium text-foreground text-sm capitalize">
                                {field.value}
                              </span>
                            </Select.Value>
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content className="p-0 border" align="start">
                          <Select.Group>
                            <Select.Item
                              className="h-7 text-xs capitalize"
                              value="active"
                            >
                              Active
                            </Select.Item>
                            <Select.Item
                              className="h-7 text-xs capitalize"
                              value="inactive"
                            >
                              Inactive
                            </Select.Item>
                          </Select.Group>
                        </Select.Content>
                      </Select>
                    </Form.Control>
                  </Form.Item>
                )}
              />

              {/* Dynamic Payment-Specific Fields */}
              {currentPaymentKind?.fields.map((fieldConfig) => (
                <Form.Field
                  key={fieldConfig.key}
                  name={fieldConfig.key as any}
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{fieldConfig.label} *</Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          type={fieldConfig.type || 'text'}
                          placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                          autoComplete={
                            fieldConfig.type === 'password' ? '' : 'off'
                          }
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              ))}

              {renderQuickQr()}
            </div>
          </ScrollArea>
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end gap-1 bg-muted p-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? 'Saving...' : payment ? 'Update' : 'Save'} Payment
            Method
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export default PaymentForm;
