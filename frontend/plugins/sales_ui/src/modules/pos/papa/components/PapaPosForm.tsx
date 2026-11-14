import { mutations } from '@/pos/graphql/mutations';
import { queries } from '@/pos/graphql/queries';
import { cleanData } from '@/pos/utils/cleanData';
import { useApolloClient, useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Checkbox, Form, Label, Select, Switch, toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  usePapaAddresses,
  usePapaReferences,
} from '../hooks/usePapaReferences';
import {
  PAPA_CAR_TYPE_GROUPS,
  PAPA_SIZES,
  parsePosPapaConfig,
  TPapaCarTypeGroup,
} from '../utils/papaJson';
import { PapaAddressForm } from './PapaAddressForm';
import { PapaReferenceSelect } from './PapaReferenceSelect';

const posPapaFormSchema = z
  .object({
    enabled: z.boolean(),
    addressId: z.string(),
    carTypeGroups: z.array(z.enum(PAPA_CAR_TYPE_GROUPS)),
    categoryId: z.string(),
    conditionId: z.string(),
    size: z.enum(PAPA_SIZES),
  })
  .superRefine((values, ctx) => {
    if (!values.enabled) {
      return;
    }

    (['addressId', 'categoryId', 'conditionId'] as const).forEach((key) => {
      if (!values[key]) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'Required' });
      }
    });

    if (!values.carTypeGroups.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['carTypeGroups'],
        message: 'Required',
      });
    }
  });

type TPosPapaForm = z.infer<typeof posPapaFormSchema>;

const DEFAULT_VALUES: TPosPapaForm = {
  enabled: false,
  addressId: '',
  carTypeGroups: ['car', 'light'],
  categoryId: '',
  conditionId: '',
  size: 'SMALL',
};

interface PapaPosFormProps {
  posId: string;
  deliveryConfig?: { papa?: unknown } | null;
  hasAccount: boolean;
}

/** Per-POS Papa settings, saved under `deliveryConfig.papa`. */
export const PapaPosForm = ({
  posId,
  deliveryConfig,
  hasAccount,
}: PapaPosFormProps) => {
  const { t } = useTranslation('sales');
  const client = useApolloClient();
  const [addingAddress, setAddingAddress] = useState(false);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const { references, loading: referencesLoading } =
    usePapaReferences(!hasAccount);
  const { addresses, loading: addressesLoading } =
    usePapaAddresses(!hasAccount);

  const form = useForm<TPosPapaForm>({
    resolver: zodResolver(posPapaFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const enabled = form.watch('enabled');

  useEffect(() => {
    const saved = parsePosPapaConfig(deliveryConfig?.papa);

    form.reset({
      enabled: !!saved.enabled,
      addressId: saved.addressId || '',
      carTypeGroups: saved.carTypeGroups?.length
        ? saved.carTypeGroups
        : DEFAULT_VALUES.carTypeGroups,
      categoryId: saved.categoryId || '',
      conditionId: saved.conditionId || '',
      size: saved.size || DEFAULT_VALUES.size,
    });
  }, [deliveryConfig, form]);

  const carGroupLabels: Record<TPapaCarTypeGroup, string> = {
    car: t('papa-car-passenger', 'Passenger car'),
    light: t('papa-car-light', 'On foot / Moped / Bicycle'),
  };

  const onSubmit = async (values: TPosPapaForm) => {
    try {
      // Read the latest saved configuration so the other delivery settings
      // saved from this page are never overwritten with stale values.
      const { data } = await client.query({
        query: queries.posDetail,
        variables: { _id: posId },
        fetchPolicy: 'network-only',
      });
      const current = data?.posDetail?.deliveryConfig;
      const existing =
        current && typeof current === 'object' ? cleanData(current) : {};

      await posEdit({
        variables: {
          _id: posId,
          deliveryConfig: { ...existing, papa: values },
        },
        refetchQueries: [
          { query: queries.posDetail, variables: { _id: posId } },
        ],
        awaitRefetchQueries: true,
      });

      form.reset(values);
      toast({
        title: t('success'),
        description: t('papa-pos-saved', 'Papa settings saved'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    }
  };

  if (!hasAccount) {
    return (
      <p className="text-sm text-muted-foreground">
        {t(
          'papa-connect-first',
          'Connect the Papa account above to set up this POS.',
        )}
      </p>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Form.Field
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <Form.Item>
              <div className="flex items-center gap-2">
                <Form.Control>
                  <Switch
                    id="papaEnabled"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Label htmlFor="papaEnabled">
                  {t(
                    'papa-enable-pos',
                    'Send this POS’s delivery orders to Papa',
                  )}
                </Label>
              </div>
            </Form.Item>
          )}
        />

        {enabled && (
          <>
            <Form.Field
              control={form.control}
              name="addressId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('papa-pickup-address', 'Pickup address')}
                  </Form.Label>
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1">
                      <PapaReferenceSelect
                        rows={addresses.map((address) => ({
                          id: address.id,
                          name: address.address,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        loading={addressesLoading}
                        placeholder={t(
                          'papa-choose-address',
                          'Choose an address',
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAddingAddress(true)}
                    >
                      <IconPlus />
                      {t('papa-new-address', 'New')}
                    </Button>
                  </div>
                  <Form.Message />
                </Form.Item>
              )}
            />

            {addingAddress && (
              <PapaAddressForm
                locations={references.locations}
                locationsLoading={referencesLoading}
                onCancel={() => setAddingAddress(false)}
                onCreated={(addressId) => {
                  form.setValue('addressId', addressId, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setAddingAddress(false);
                }}
              />
            )}

            <Form.Field
              control={form.control}
              name="carTypeGroups"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('papa-car-types', 'Vehicle types')}
                  </Form.Label>
                  <div className="flex flex-wrap gap-4">
                    {PAPA_CAR_TYPE_GROUPS.map((group) => (
                      <div key={group} className="flex items-center gap-2">
                        <Checkbox
                          id={`papaCar-${group}`}
                          checked={field.value.includes(group)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked === true
                                ? [...field.value, group]
                                : field.value.filter(
                                    (value) => value !== group,
                                  ),
                            )
                          }
                        />
                        <Label htmlFor={`papaCar-${group}`}>
                          {carGroupLabels[group]}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <Form.Field
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('papa-category', 'Goods category')}
                    </Form.Label>
                    <PapaReferenceSelect
                      rows={references.categories}
                      value={field.value}
                      onChange={field.onChange}
                      loading={referencesLoading}
                      placeholder={t('papa-choose', 'Choose')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="conditionId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('papa-condition', 'Handling condition')}
                    </Form.Label>
                    <PapaReferenceSelect
                      rows={references.conditions}
                      value={field.value}
                      onChange={field.onChange}
                      loading={referencesLoading}
                      placeholder={t('papa-choose', 'Choose')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="size"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('papa-default-size', 'Default package size')}
                    </Form.Label>
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
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={saving || !form.formState.isDirty}
          >
            {saving ? t('saving') : t('save-changes')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
