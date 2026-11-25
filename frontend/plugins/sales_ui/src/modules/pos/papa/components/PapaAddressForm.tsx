import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  SALES_PAPA_ADDRESSES,
  SALES_PAPA_ADDRESS_CREATE,
} from '../graphql/papaDocuments';
import { papaAddressSchema, TPapaReferenceRow } from '../utils/papaJson';
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
    );

const addressFormSchema = z.object({
  locationId: z.string().min(1),
  address: z.string().trim().min(1).max(500),
  latitude: coordinate(90),
  longitude: coordinate(180),
});

type TAddressForm = z.infer<typeof addressFormSchema>;

interface PapaAddressFormProps {
  locations: TPapaReferenceRow[];
  locationsLoading?: boolean;
  onCreated: (addressId: string) => void;
  onCancel: () => void;
}

/** Registers a new pickup address (a POS branch) with Papa. */
export const PapaAddressForm = ({
  locations,
  locationsLoading,
  onCreated,
  onCancel,
}: PapaAddressFormProps) => {
  const { t } = useTranslation('sales');
  const [createAddress, { loading }] = useMutation(SALES_PAPA_ADDRESS_CREATE, {
    refetchQueries: [SALES_PAPA_ADDRESSES],
    awaitRefetchQueries: true,
  });
  const form = useForm<TAddressForm>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { locationId: '', address: '', latitude: '', longitude: '' },
  });

  const onSubmit = async (values: TAddressForm) => {
    try {
      const { data } = await createAddress({ variables: values });
      const created = papaAddressSchema.safeParse(data?.salesPapaAddressCreate);

      if (!created.success) {
        throw new Error(t('papa-address-invalid', 'Papa returned no address'));
      }

      toast({
        title: t('success'),
        description: t('papa-address-created', 'Pickup address added'),
      });
      onCreated(created.data.id);
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-4 rounded-lg border p-4">
        <Form.Field
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('papa-district', 'District')}</Form.Label>
              <PapaReferenceSelect
                rows={locations}
                nested
                value={field.value}
                onChange={field.onChange}
                loading={locationsLoading}
                placeholder={t('papa-choose-district', 'Choose a district')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="address"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('address')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('papa-latitude', 'Latitude')}</Form.Label>
                <Form.Control>
                  <Input {...field} inputMode="decimal" placeholder="47.9185" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('papa-longitude', 'Longitude')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    inputMode="decimal"
                    placeholder="106.9176"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {loading ? t('saving') : t('papa-add-address', 'Add address')}
          </Button>
        </div>
      </div>
    </Form>
  );
};
