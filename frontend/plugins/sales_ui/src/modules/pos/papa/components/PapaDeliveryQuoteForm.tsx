import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Select } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { usePapaReferences } from '../hooks/usePapaReferences';
import { PAPA_SIZES, TPapaDelivery } from '../utils/papaJson';
import { PapaReferenceSelect } from './PapaReferenceSelect';

const coordinate = (limit: number) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value !== '' &&
        Number.isFinite(Number(value)) &&
        Math.abs(Number(value)) <= limit,
      'Invalid coordinate',
    );

const quoteSchema = z.object({
  toLocationId: z.string().min(1, 'Required'),
  toAddress: z.string().trim().min(1, 'Required').max(500),
  toLatitude: coordinate(90),
  toLongitude: coordinate(180),
  size: z.enum(PAPA_SIZES),
});

export type TPapaQuoteForm = z.infer<typeof quoteSchema>;

interface PapaDeliveryQuoteFormProps {
  defaults: { address: string; lat: string; lng: string };
  previous: TPapaDelivery | null;
  busy: boolean;
  onSubmit: (values: TPapaQuoteForm) => Promise<boolean>;
}

/** Step 1: confirm the customer's district and pin, then ask Papa for a price. */
export const PapaDeliveryQuoteForm = ({
  defaults,
  previous,
  busy,
  onSubmit,
}: PapaDeliveryQuoteFormProps) => {
  const { t } = useTranslation('sales');
  const { references, loading } = usePapaReferences();
  const previousSize = PAPA_SIZES.find((size) => size === previous?.size);

  const form = useForm<TPapaQuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      toLocationId: previous?.toLocationId || '',
      toAddress: previous?.toAddress || defaults.address,
      toLatitude: String(previous?.toLatitude ?? defaults.lat ?? ''),
      toLongitude: String(previous?.toLongitude ?? defaults.lng ?? ''),
      size: previousSize || 'SMALL',
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3"
        noValidate
      >
        <Form.Field
          control={form.control}
          name="toLocationId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('papa-district', 'District')}</Form.Label>
              <PapaReferenceSelect
                rows={references.locations}
                nested
                value={field.value}
                onChange={field.onChange}
                loading={loading}
                placeholder={t('papa-choose-district', 'Choose a district')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="toAddress"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('papa-delivery-address', 'Delivery address')}
              </Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <Form.Field
            control={form.control}
            name="toLatitude"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('papa-latitude', 'Latitude')}</Form.Label>
                <Form.Control>
                  <Input {...field} inputMode="decimal" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="toLongitude"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('papa-longitude', 'Longitude')}</Form.Label>
                <Form.Control>
                  <Input {...field} inputMode="decimal" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <Form.Field
          control={form.control}
          name="size"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('papa-size', 'Package size')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {PAPA_SIZES.map((size) => (
                    <Select.Item key={size} value={size}>
                      {t(`papa-size-${size.toLowerCase()}`, size)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button type="submit" disabled={busy} className="w-full">
          {t('papa-get-price', 'Get delivery price')}
        </Button>
      </form>
    </Form>
  );
};
