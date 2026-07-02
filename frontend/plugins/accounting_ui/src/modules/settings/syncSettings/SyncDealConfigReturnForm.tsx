import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { TR_STATUSES, TR_STATUS_OPTIONS } from '@/transactions/types/constants';
import { Button, Dialog, Form, Input, Select, Spinner } from 'erxes-ui';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BoardSelect, PipelineSelect, StageSelect } from 'ui-modules';
import { z } from 'zod';
import { SyncResponseFieldSelect } from './SyncResponseFieldSelect';

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
          name="boardId"
          render={({ field }) => (
            <Form.Item className="col-start-1">
              <Form.Label>{t('board')}</Form.Label>
              <Form.Control>
                <BoardSelect boardId={field.value} onChange={field.onChange} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="pipelineId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('pipeline')}</Form.Label>
              <Form.Control>
                <PipelineSelect
                  pipelineId={field.value}
                  onChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="stageId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('stage')}</Form.Label>
              <Form.Control>
                <StageSelect
                  pipelineId={pipelineId}
                  stageId={field.value}
                  onChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <SyncResponseFieldSelect form={form} />
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
