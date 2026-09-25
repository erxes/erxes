import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Input,
  ScrollArea,
  Select,
  Sheet,
  Textarea,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { INVOICE_STATUS_OPTIONS } from '~/modules/payment/constants';
import { useInvoiceEdit } from '~/modules/payment/hooks/useInvoiceEdit';
import { IInvoice } from '~/modules/payment/types/Payment';

const invoiceEditSchema = z.object({
  description: z.string(),
  amount: z.coerce.number().positive(),
  status: z
    .string()
    .refine((status) =>
      INVOICE_STATUS_OPTIONS.some((option) => option.value === status),
    ),
});

type TInvoiceEditForm = z.infer<typeof invoiceEditSchema>;

export const InvoiceEditForm = ({
  invoice,
  onCancel,
}: {
  invoice: IInvoice;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('payment');
  const { editInvoice, loading } = useInvoiceEdit();

  const form = useForm<TInvoiceEditForm>({
    resolver: zodResolver(invoiceEditSchema),
    defaultValues: {
      description: invoice.description ?? '',
      amount: invoice.amount,
      status: invoice.status,
    },
  });

  const onSubmit = async (values: TInvoiceEditForm) => {
    const result = await editInvoice(invoice._id, {
      description: values.description,
      amount: values.amount,
      status: values.status,
    });

    if (result?.data?.invoiceEdit) {
      onCancel();
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col h-full overflow-hidden"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Sheet.Header className="gap-3 border-b">
          <Sheet.Title>
            {t('edit')} · {invoice.invoiceNumber}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="flex-auto overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-3 p-5">
              <Form.Field
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control>
                      <Textarea {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="amount"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('amount')} ({invoice.currency})
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} type="number" min={0} step="any" />
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder={t('select-status')}>
                            <span className="font-medium text-foreground text-sm capitalize">
                              {t(field.value)}
                            </span>
                          </Select.Value>
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content className="p-0 border" align="start">
                        <Select.Group>
                          {INVOICE_STATUS_OPTIONS.map((option) => (
                            <Select.Item
                              key={option.value}
                              className="h-7 text-xs capitalize"
                              value={option.value}
                            >
                              {t(option.label)}
                            </Select.Item>
                          ))}
                        </Select.Group>
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </ScrollArea>
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
            {loading ? t('saving') : t('edit')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
