import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Form, Input, Label, Textarea } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

/** Digits only, without a +976 prefix; Papa validates 8-digit numbers. */
const normalizePhone = (value: string) =>
  value.replace(/\D/g, '').replace(/^976(?=\d{8}$)/, '');

const sendSchema = z.object({
  receiverPhone: z
    .string()
    .refine(
      (value) => /^\d{8}$/.test(normalizePhone(value)),
      'Enter an 8-digit phone number',
    ),
  description: z.string().max(500),
  receiverPays: z.boolean(),
});

export type TPapaSendForm = z.infer<typeof sendSchema>;

interface PapaDeliverySendFormProps {
  defaults: { phone: string; description: string };
  busy: boolean;
  retry: boolean;
  onSubmit: (values: TPapaSendForm) => Promise<boolean>;
}

/** Step 2: check the receiver and announce the order to Papa's drivers. */
export const PapaDeliverySendForm = ({
  defaults,
  busy,
  retry,
  onSubmit,
}: PapaDeliverySendFormProps) => {
  const { t } = useTranslation('sales');
  const form = useForm<TPapaSendForm>({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      receiverPhone: defaults.phone,
      description: defaults.description.slice(0, 500),
      receiverPays: false,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit({
            ...values,
            receiverPhone: normalizePhone(values.receiverPhone),
          }),
        )}
        className="space-y-3"
        noValidate
      >
        <Form.Field
          control={form.control}
          name="receiverPhone"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('papa-receiver-phone', 'Receiver phone')}
              </Form.Label>
              <Form.Control>
                <Input {...field} inputMode="tel" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('papa-driver-note', 'Note for the driver')}
              </Form.Label>
              <Form.Control>
                <Textarea {...field} rows={2} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="receiverPays"
          render={({ field }) => (
            <Form.Item>
              <div className="flex items-center gap-2">
                <Form.Control>
                  <Checkbox
                    id="papaReceiverPays"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                </Form.Control>
                <Label htmlFor="papaReceiverPays">
                  {t('papa-receiver-pays', 'Receiver pays the driver')}
                </Label>
              </div>
            </Form.Item>
          )}
        />
        <Button type="submit" disabled={busy} className="w-full">
          {retry
            ? t('papa-retry-send', 'Retry sending to Papa')
            : t('papa-send', 'Send to Papa')}
        </Button>
      </form>
    </Form>
  );
};
