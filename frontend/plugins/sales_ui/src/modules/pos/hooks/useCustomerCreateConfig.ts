import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  POS_CUSTOMER_DEFAULT_LAYOUT,
  POS_CUSTOMER_IDENTITY_CODES,
} from '@/pos/components/customerCreate/constants';
import mutations from '@/pos/graphql/mutations';
import { useCustomerFormFields } from '@/pos/hooks/useCustomerFormFields';
import { usePosDetail } from '@/pos/hooks/usePosDetail';

const customerCreateSchema = z
  .object({
    enabled: z.boolean(),
    assignCashierAsOwner: z.boolean(),
    layout: z.array(z.array(z.string())),
  })
  .refine(
    ({ enabled, layout }) =>
      !enabled ||
      layout.flat().some((code) => POS_CUSTOMER_IDENTITY_CODES.includes(code)),
    {
      path: ['layout'],
      message: 'The customer form must keep e-mail or phone',
    },
  );

export type CustomerCreateFormData = z.infer<typeof customerCreateSchema>;

const withoutCodes = (layout: string[][], codes: string[]) =>
  layout
    .map((row) => row.filter((code) => !codes.includes(code)))
    .filter((row) => row.length);

export const useCustomerCreateConfig = (posId?: string) => {
  const { t } = useTranslation('sales');
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const { options, loading: fieldsLoading, complete } = useCustomerFormFields();
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  const form = useForm<CustomerCreateFormData>({
    resolver: zodResolver(customerCreateSchema),
    defaultValues: {
      enabled: false,
      assignCashierAsOwner: false,
      layout: POS_CUSTOMER_DEFAULT_LAYOUT,
    },
  });
  const { control, reset, setValue } = form;
  const layout = useWatch({ control, name: 'layout' });

  useEffect(() => {
    if (!posDetail) {
      return;
    }

    const config = posDetail.customerCreateConfig;

    reset({
      enabled: config?.enabled ?? false,
      assignCashierAsOwner: config?.assignCashierAsOwner ?? false,
      layout: config?.layout?.length
        ? config.layout
        : POS_CUSTOMER_DEFAULT_LAYOUT,
    });
  }, [posDetail, reset]);

  const knownCodes = new Set(options.map((option) => option.code));
  const placed = new Set(layout.flat());

  // Properties deleted or archived since the layout was saved.
  const staleCodes =
    fieldsLoading || !complete
      ? []
      : layout.flat().filter((code) => !knownCodes.has(code));

  const setLayout = (next: string[][]) =>
    setValue('layout', next, { shouldDirty: true, shouldValidate: true });

  const toggleField = (code: string, visible: boolean) =>
    setLayout(visible ? [...layout, [code]] : withoutCodes(layout, [code]));

  // Hiding the last identity field would leave the customer unreachable.
  const isLocked = (code: string) =>
    POS_CUSTOMER_IDENTITY_CODES.includes(code) &&
    placed.has(code) &&
    POS_CUSTOMER_IDENTITY_CODES.filter((other) => placed.has(other)).length ===
      1;

  const applyLayout = (rows: string[][] | null) =>
    setLayout(rows ?? POS_CUSTOMER_DEFAULT_LAYOUT);

  const save = async (data: CustomerCreateFormData) => {
    if (!posId) {
      return;
    }

    const next = { ...data, layout: withoutCodes(data.layout, staleCodes) };

    try {
      await posEdit({
        variables: { _id: posId, customerCreateConfig: next },
      });

      toast({ title: t('success'), description: t('changes-saved', 'Saved') });
      reset(next);
    } catch (e) {
      toast({
        title: t('error'),
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    }
  };

  return {
    form,
    options,
    layout: withoutCodes(layout, staleCodes),
    placed,
    staleCodes,
    loading: detailLoading || fieldsLoading,
    error,
    saving,
    toggleField,
    isLocked,
    applyLayout,
    save,
  };
};
