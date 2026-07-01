import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { SelectCtax } from '@/settings/ctax/components/SelectCtaxRow';
import { SelectVat } from '@/settings/vat/components/SelectVatRow';
import { TR_STATUSES, TR_STATUS_OPTIONS } from '@/transactions/types/constants';
import { useQuery } from '@apollo/client';
import {
  Button,
  Checkbox,
  Form,
  Input,
  isEnabled,
  Select,
  Sheet,
  Spinner,
} from 'erxes-ui';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  SelectBranches,
  SelectDepartments,
  SelectBoard,
  SelectPipeline,
  SelectStage,
} from 'ui-modules';
import { z } from 'zod';
import { PIPELINE_DETAIL } from '../graphql/queries/relatedQueries';
import { FormSelectEbarimtProductRule } from './SelectEbarimtProductRule';
import { SyncResponseFieldSelect } from './SyncResponseFieldSelect';
import { SyncSettingSection } from './SyncSettingSection';

export const syncDealConfigFormSchema = z.object({
  title: z.string(),
  boardId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string(),
  responseFieldId: z.string().optional(),
  dateRule: z.enum(['alwaysNow', 'syncedDateOrNow']),
  trStatus: z.string().optional(),
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

type ConfigFormValues = z.infer<typeof syncDealConfigFormSchema>;

const normalizeRuleIds = (value?: string | string[]) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

export const SyncDealConfigForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const boardId = useWatch({
    control: form.control,
    name: `boardId`,
  });

  const pipelineId = useWatch({
    control: form.control,
    name: `pipelineId`,
  });

  const { data: pipelineDetail, refetch: pipelineRefetch } = useQuery(
    PIPELINE_DETAIL,
    {
      variables: { _id: pipelineId },
      skip: !pipelineId, // pipelineId байхгүй үед асуухгүй
      fetchPolicy: 'network-only', // заавал backend-ээс авна
    },
  );

  useEffect(() => {
    form.setValue('pipelineId', '');
  }, [boardId, form]);

  useEffect(() => {
    form.setValue('stageId', '');
  }, [pipelineId, form]);

  useEffect(() => {
    if (pipelineId) {
      pipelineRefetch({ _id: pipelineId });
    }
  }, [pipelineId, pipelineRefetch]);

  useEffect(() => {
    if (!form.getValues('trStatus')) {
      form.setValue('trStatus', TR_STATUSES.COMPLETE);
    }
  }, [form]);

  // note: const paymentIds: string[] = pipelineDetail?.salesPipelineDetail?.paymentIds || [];
  const paymentTypes: any[] =
    pipelineDetail?.salesPipelineDetail?.paymentTypes || [];
  const mongolianEnabled = isEnabled('mongolian');

  const handleSubmit = (data: ConfigFormValues) =>
    onSubmit({
      ...data,
      vatRowId: data.hasVat ? data.vatRowId : '',
      reverseVatRules:
        mongolianEnabled && !data.hasVat
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
        className="flex flex-col flex-1 min-h-0 bg-background"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
          <SyncSettingSection title={t('general')}>
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
                        <Select.Item value="alwaysNow">
                          {t('always-now')}
                        </Select.Item>
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
                        {TR_STATUS_OPTIONS.map((s) => (
                          <Select.Item key={s.value} value={s.value}>
                            {s.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                </Form.Item>
              )}
            />
          </SyncSettingSection>

          <SyncSettingSection title={t('pipeline')}>
            <Form.Field
              control={form.control}
              name="boardId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('board')}</Form.Label>
                  <SelectBoard.FormItem
                    mode="single"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="pipelineId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('pipeline')}</Form.Label>
                  <SelectPipeline.FormItem
                    mode="single"
                    value={field.value}
                    boardId={boardId || undefined}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="stageId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('stage')}</Form.Label>
                  <SelectStage.FormItem
                    mode="single"
                    value={field.value}
                    pipelineId={pipelineId || undefined}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <SyncResponseFieldSelect form={form} />
          </SyncSettingSection>

          <SyncSettingSection title={t('accounts')}>
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
          </SyncSettingSection>

          <SyncSettingSection title={t('Payments')}>
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
                      }}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
            {[
              { type: 'cash', title: 'cash' },
              { type: 'mobile', title: 'mobile' },
              ...paymentTypes,
            ].map((ptype) => (
              <Form.Field
                key={`${pipelineId}-${ptype.type}`}
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
                        }}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            ))}
          </SyncSettingSection>

          <section className="col-span-full grid grid-cols-2 gap-8 mt-4 items-start">
            {/* VAT */}
            <div className="flex flex-col gap-4">
              <Form.Field
                control={form.control}
                name="hasVat"
                render={({ field }) => (
                  <Form.Item className="flex items-center gap-2 space-y-0">
                    <Form.Control>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label variant="peer">{t('has-vat')}</Form.Label>
                  </Form.Item>
                )}
              />

              <div>
                {useWatch({ control: form.control, name: 'hasVat' }) ? (
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
                ) : (
                  <FormSelectEbarimtProductRule
                    name="reverseVatRules"
                    label={t('reverse-vat-rules')}
                    kind="vat"
                    control={form.control}
                  />
                )}
              </div>
            </div>

            {/* CTAX */}
            <div className="flex-col flex gap-4">
              <Form.Field
                control={form.control}
                name="hasCtax"
                render={({ field }) => (
                  <Form.Item className="flex items-center gap-2 space-y-0">
                    <Form.Control>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label variant="peer">{t('has-ctax')}</Form.Label>
                  </Form.Item>
                )}
              />

              <div>
                {useWatch({ control: form.control, name: 'hasCtax' }) ? (
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
              </div>
            </div>
          </section>
        </div>
        <Sheet.Footer className="px-5 py-4 border-t bg-background shrink-0 gap-2">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg">
              {t('cancel')}
            </Button>
          </Sheet.Close>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Spinner /> : t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export { SyncSettingSection } from './SyncSettingSection';
