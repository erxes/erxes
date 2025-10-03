import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select } from 'erxes-ui';
import { Form } from 'erxes-ui/components/form';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import QuickQrForm from '~/modules/settings/payment/components/QuickQrForm';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { IPayment } from '~/modules/payment/types/Payment';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';
import { paymentKind } from '~/modules/payment/utils';

type Props = {
  payment: any;
  onSave: (payment: any) => void;
  onCancel: () => void;
};

// Base validation schema
const baseSchema = z.object({
  kind: z.string().min(1, 'Payment method is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
});

const quickQrSchema = z.object({
  kind: z.string().min(1, 'Payment method is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
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

const PaymentForm = ({ payment, onSave, onCancel }: Props) => {
  const [selectedKind, setSelectedKind] = useState(payment?.kind || '');

  // Create dynamic schema based on selected payment kind
  const validationSchema = useMemo(
    () => createPaymentSchema(selectedKind),
    [selectedKind],
  );

  // Get default values from payment prop
  const getDefaultValues = useMemo(() => {
    if (!payment) {
      return { kind: '', name: '' };
    }

    const defaultValues: Record<string, any> = {
      kind: payment.kind || '',
      name: payment.name || '',
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
      config: {},
    };

    const config: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'kind' && key !== 'name') {
        config[key] = value;
      }
    });
    input.config = config;

    try {
      onSave(input);
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
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        {/* Payment Kind Selection */}
        <form className="space-y-4 p-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                            <span className="text-sm font-medium text-center truncate text-muted-foreground">
                              {'Select payment method'}
                            </span>
                          }
                        >
                          <span className="text-sm font-medium text-foreground">
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
                      className="border p-0 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2"
                      align="start"
                    >
                      <Select.Group>
                        {Object.entries(PAYMENT_KINDS).map(([key, method]) => (
                          <Select.Item
                            key={key}
                            className="text-xs h-7"
                            value={key}
                          >
                            {method.name}
                          </Select.Item>
                        ))}
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

          {/* Action Buttons */}
          <div className="sticky bottom-0 left-0 w-full bg-white p-4 z-10">
            <div className="flex gap-3 pt-6 ">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : payment ? 'Update' : 'Save'}{' '}
                Payment Method
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentForm;
