import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, Sheet, Switch, toast } from 'erxes-ui';
import { Form } from 'erxes-ui/components/form';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useInvoiceCreate } from '~/modules/payment/hooks/useInvoiceCreate';

const schema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  currency: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  status: z.enum(['pending', 'paid']),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  description: z.string().optional(),
  sendBarcodeEmail: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const InvoiceAddForm = ({ onCancel }: { onCancel: () => void }) => {
  const { t } = useTranslation('payment');
  const { invoiceCreate, loading } = useInvoiceCreate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: undefined,
      currency: 'MNT',
      quantity: 1,
      status: 'pending',
      email: '',
      phone: '',
      description: '',
      sendBarcodeEmail: true,
    },
  });

  const onSubmit = (values: FormValues) => {
    const input = {
      amount: values.amount,
      currency: values.currency,
      status: values.status,
      email: values.email || undefined,
      phone: values.phone || undefined,
      description: values.description || undefined,
      paymentIds: [],
      data: {
        quantity: values.quantity,
        sendBarcodeEmail: values.sendBarcodeEmail,
      },
    };

    invoiceCreate({ variables: { input } })
      .then(() => {
        toast({ title: t('success'), description: t('invoice-created') });
        onCancel();
      })
      .catch((e) => {
        toast({ title: t('error'), description: e.message });
      });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col h-full overflow-hidden"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Sheet.Header className="gap-3 border-b">
          <Sheet.Title>{t('create-invoice')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="flex-auto overflow-auto">
          <div className="space-y-3 p-5">
            <Form.Field
              name="amount"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('amount')} *</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      type="number"
                      value={field.value ?? ''}
                      placeholder="0"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="currency"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('currency')}</Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="MNT" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="MNT">MNT</Select.Item>
                        <Select.Item value="USD">USD</Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Control>
                </Form.Item>
              )}
            />

            <Form.Field
              name="quantity"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('quantity')}</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      value={field.value ?? 1}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="status"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('status')}</Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder={t('select-status')} />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="pending">
                          {t('pending')}
                        </Select.Item>
                        <Select.Item value="paid">{t('paid')}</Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Control>
                </Form.Item>
              )}
            />

            <Form.Field
              name="email"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('email')}</Form.Label>
                  <Form.Control>
                    <Input {...field} type="email" placeholder="name@mail.mn" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="phone"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('phone')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                </Form.Item>
              )}
            />

            <Form.Field
              name="description"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('description')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                </Form.Item>
              )}
            />

            <Form.Field
              name="sendBarcodeEmail"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <Form.Label>{t('send-email-after-payment')}</Form.Label>
                      <p className="text-xs text-muted-foreground">
                        {t('send-email-description')}
                      </p>
                    </div>
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                  </div>
                </Form.Item>
              )}
            />
          </div>
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end gap-1 bg-muted p-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('saving') : t('create-invoice')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const InvoiceAddSheet = () => {
  const { t } = useTranslation('payment');
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Sheet.Trigger asChild>
        <Button variant="outline">{t('create-invoice')}</Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <InvoiceAddForm onCancel={() => setOpen(false)} />
      </Sheet.View>
    </Sheet>
  );
};
