import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { SelectCtax } from '@/settings/ctax/components/SelectCtaxRow';
import { SelectVat } from '@/settings/vat/components/SelectVatRow';
import { TR_STATUSES, TR_STATUS_OPTIONS } from '@/transactions/types/constants';
import { useQuery } from '@apollo/client';
import {
  Button,
  Checkbox,
  Dialog,
  Form,
  Input,
  isEnabled,
  Select,
  Spinner,
} from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { z } from 'zod';
import { POS_DETAIL, POS_LIST } from '../graphql/queries/relatedQueries';
import { FormSelectEbarimtProductRule } from './SelectEbarimtProductRule';

export const syncOrderConfigFormSchema = z.object({
  title: z.string(),
  posId: z.string(),
  dateRule: z.enum(['alwaysNow', 'syncedDateOrNow']),
  trStatus: z.string().optional(),
  returnType: z.enum(['fullTr', 'onlySale', 'delete']),
  saleAccountId: z.string(),
  saleOutAccountId: z.string(),
  saleCostAccountId: z.string(),
  branchId: z.string(),
  departmentId: z.string(),
  hasVat: z.boolean(),
  vatRowId: z.string(),
  reverseVatRules: z.array(z.string()).optional(),
  hasCtax: z.boolean(),
  ctaxRowId: z.string(),
  reverseCtaxRules: z.array(z.string()).optional(),
  payments: z.record(
    z.object({
      accountId: z.string(),
    }),
  ),
  defaultPayment: z.object({
    accountId: z.string(),
  }),
  defaultNegPayment: z.object({
    accountId: z.string(),
  }),
});

type ConfigFormValues = z.infer<typeof syncOrderConfigFormSchema>;

const normalizeRuleIds = (value?: string | string[]) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

export const SyncOrderConfigForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const posId = useWatch({
    control: form.control,
    name: `posId`,
  });

  const { data: posList, loading: posListLoading } = useQuery(POS_LIST, {});
  const posOptions: { value: string; label: string }[] = useMemo(() => {
    if (posListLoading) {
      return [];
    }
    return posList?.posList?.map((p: { name: any; _id: any }) => ({
      label: p.name,
      value: p._id,
    }));
  }, [posList, posListLoading]);

  const { data: posDetailData, refetch: posRefetch } = useQuery(POS_DETAIL, {
    variables: { _id: posId },
    skip: !posId, // posId байхгүй үед асуухгүй
    fetchPolicy: 'network-only', // заавал backend-ээс авна
  });

  useEffect(() => {
    if (posId) {
      posRefetch({ _id: posId });
    }
  }, [posId, posRefetch]);

  useEffect(() => {
    if (!form.getValues('trStatus')) {
      form.setValue('trStatus', TR_STATUSES.COMPLETE);
    }
  }, [form]);

  useEffect(() => {
    if (!form.getValues('returnType')) {
      form.setValue('returnType', 'fullTr');
    }
  }, [form]);

  // note: const paymentIds: string[] = pipelineDetail?.salesPipelineDetail?.paymentIds || [];
  const paymentTypes: any[] = posDetailData?.posDetail?.paymentTypes || [];
  const mongolianEnabled = isEnabled('mongolian');

  const handleSubmit = (data: ConfigFormValues) =>
    onSubmit({
      ...data,
      vatRowId: data.hasVat ? data.vatRowId : '',
      reverseVatRules:
        mongolianEnabled && data.hasVat
          ? normalizeRuleIds(data.reverseVatRules)
          : [],
      ctaxRowId: data.hasCtax ? data.ctaxRowId : '',
      reverseCtaxRules:
        !mongolianEnabled || data.hasCtax
          ? []
          : normalizeRuleIds(data.reverseCtaxRules),
    });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid gap-3 xl:grid-cols-3 py-3"
      >
        <Form.Field
          control={form.control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('title')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="dateRule"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('date-rule')}</Form.Label>
              <Form.Control>
                <Select {...field} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="alwaysNow">{t('always-now')}</Select.Item>
                    <Select.Item value="syncedDateOrNow">
                      {t('synced-date-or-now')}
                    </Select.Item>
                  </Select.Content>
                </Select>
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="trStatus"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('tr-status-label')}</Form.Label>
              <Form.Control>
                <Select {...field} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {TR_STATUS_OPTIONS.map((status) => (
                      <Select.Item key={status.value} value={status.value}>
                        {status.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="returnType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('return-type')}</Form.Label>
              <Form.Control>
                <Select {...field} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="fullTr">{t('full-tr')}</Select.Item>
                    <Select.Item value="onlySale">
                      {t('only-sale')}
                    </Select.Item>
                    <Select.Item value="delete">{t('delete')}</Select.Item>
                  </Select.Content>
                </Select>
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="posId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>POS</Form.Label>
              <Form.Control>
                <Select
                  defaultValue={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value placeholder={t('select-pos')} />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    {posOptions.map((opt) => (
                      <Select.Item key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="saleAccountId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('sale-account')}</Form.Label>
              <Form.Control>
                <SelectAccount.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: [JournalEnum.INV_FOLLOW] }}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="saleOutAccountId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('sale-out-account')}</Form.Label>
              <Form.Control>
                <SelectAccount.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="saleCostAccountId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('sale-cost-account')}</Form.Label>
              <Form.Control>
                <SelectAccount.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: [JournalEnum.INV_FOLLOW] }}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('branch')}</Form.Label>
              <Form.Control>
                <SelectBranches.FormItem
                  mode="single"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('department')}</Form.Label>
              <Form.Control>
                <SelectDepartments.FormItem
                  mode="single"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="defaultPayment.accountId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('default-payment-account')}</Form.Label>
              <Form.Control>
                <SelectAccount.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{
                    journals: [
                      JournalEnum.BANK,
                      JournalEnum.CASH,
                      JournalEnum.DEBT,
                    ],
                    currency: 'MNT',
                  }}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="defaultNegPayment.accountId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('default-neg-payment-account')}</Form.Label>
              <Form.Control>
                <SelectAccount.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{
                    journals: [
                      JournalEnum.BANK,
                      JournalEnum.CASH,
                      JournalEnum.DEBT,
                    ],
                    currency: 'MNT',
                  }}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        {[
          {
            type: 'cash',
            title: 'cash',
          },
          {
            type: 'mobile',
            title: 'mobile',
          },
          ...paymentTypes,
        ].map((ptype) => (
          <Form.Field
            key={`${posId}-${ptype.type}`}
            control={form.control}
            name={`payments.${ptype.type}.accountId`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{ptype.title}</Form.Label>
                <Form.Control>
                  <SelectAccount.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultFilter={{
                      journals: [
                        JournalEnum.BANK,
                        JournalEnum.CASH,
                        JournalEnum.DEBT,
                      ],
                      currency: 'MNT',
                    }}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        ))}
        <Form.Field
          control={form.control}
          name="hasVat"
          render={({ field }) => (
            <Form.Item className="flex items-center col-start-1 space-x-2 space-y-0 pt-5">
              <Form.Label>{t('has-vat')}</Form.Label>
              <Form.Control>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        {useWatch({
          control: form.control,
          name: `hasVat`,
        }) && (
          <>
            <Form.Field
              control={form.control}
              name="vatRowId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('vat-row')}</Form.Label>
                  <Form.Control>
                    <SelectVat
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
            <FormSelectEbarimtProductRule
              name="reverseVatRules"
              label={t('reverse-vat-rules')}
              kind="vat"
              control={form.control}
            />
          </>
        )}
        <Form.Field
          control={form.control}
          name="hasCtax"
          render={({ field }) => (
            <Form.Item className="flex items-center col-start-1 space-x-2 space-y-0 pt-5">
              <Form.Label>{t('has-ctax')}</Form.Label>
              <Form.Control>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        {useWatch({
          control: form.control,
          name: `hasCtax`,
        }) ? (
          <Form.Field
            control={form.control}
            name="ctaxRowId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('ctax-row')}</Form.Label>
                <Form.Control>
                  <SelectCtax
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        ) : (
          <FormSelectEbarimtProductRule
            name="reverseCtaxRules"
            label={t('reverse-ctax-rules')}
            kind="ctax"
            control={form.control}
          />
        )}
        <Dialog.Footer className="col-span-3 mt-3 gap-2">
          <Dialog.Close asChild>
            <Button variant="outline" size="lg">
              {t('cancel')}
            </Button>
          </Dialog.Close>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Spinner /> : t('save')}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
