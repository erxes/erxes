import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { TR_STATUSES, TR_STATUS_OPTIONS } from '@/transactions/types/constants';
import { Button, Dialog, Form, Input, Select, Spinner } from 'erxes-ui';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
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
              <Form.Label>Гарчиг</Form.Label>
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
              <Form.Label>Огнооны дүрэм</Form.Label>
              <Form.Control>
                <Select {...field} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="alwaysNow">Үргэлж одоо</Select.Item>
                    <Select.Item value="syncedDateOrNow">
                      Sync огноо эсвэл одоо
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
              <Form.Label>Гүйлгээний төлөв</Form.Label>
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
              <Form.Label>Буцаалтын төрөл</Form.Label>
              <Form.Control>
                <Select {...field} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="fullTr">Бүтэн гүйлгээ</Select.Item>
                    <Select.Item value="onlySale">
                      Зөвхөн борлуулалт
                    </Select.Item>
                    <Select.Item value="delete">Устгах</Select.Item>
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
              <Form.Label>Board</Form.Label>
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
              <Form.Label>Pipeline</Form.Label>
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
              <Form.Label>Stage</Form.Label>
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
              <Form.Label>Буцаалтын төлбөрийн үндсэн данс</Form.Label>
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
              Болих
            </Button>
          </Dialog.Close>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Spinner /> : 'Хадгалах'}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
