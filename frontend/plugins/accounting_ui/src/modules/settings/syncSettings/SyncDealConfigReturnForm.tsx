import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { TR_STATUSES } from '@/transactions/types/constants';
import { Form, Select } from 'erxes-ui';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { z } from 'zod';
import {
  SyncConfigGeneralFields,
  SyncConfigFormFooter,
} from './SyncConfigFormSections';
import { SyncResponseFieldSelect } from './SyncResponseFieldSelect';
import { SyncSettingSection } from './SyncSettingSection';

export const syncDealReturnConfigFormSchema = z.object({
  title: z.string(),
  boardId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string(),
  responseFieldId: z.string().optional(),
  returnType: z.enum(['fullTr', 'onlySale', 'delete']),
  dateRule: z.enum(['alwaysNow', 'syncedDateOrNow']),
  trStatus: z.string().optional(),
  defaultPayment: z
    .object({
      accountId: z.string(),
    })
    .nullable(),
});

type ConfigFormValues = z.infer<typeof syncDealReturnConfigFormSchema>;

export const SyncDealReturnConfigForm = ({
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

  useEffect(() => {
    form.setValue('pipelineId', '');
  }, [boardId, form]);

  useEffect(() => {
    form.setValue('stageId', '');
  }, [pipelineId, form]);

  useEffect(() => {
    if (!form.getValues('trStatus')) {
      form.setValue('trStatus', TR_STATUSES.COMPLETE);
    }
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-1 min-h-0 bg-background"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
          <SyncSettingSection title={t('general')}>
            <SyncConfigGeneralFields />
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

          <SyncSettingSection title={t('Payments')}>
            <Form.Field
              control={form.control}
              name="defaultPayment.accountId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('return-payment-account')}</Form.Label>
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
          </SyncSettingSection>
        </div>
        <SyncConfigFormFooter loading={loading} />
      </form>
    </Form>
  );
};
