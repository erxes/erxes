import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { SelectCtax } from '@/settings/ctax/components/SelectCtaxRow';
import { SelectVat } from '@/settings/vat/components/SelectVatRow';
import { useQuery } from '@apollo/client';
import {
  Button,
  Checkbox,
  Dialog,
  Form,
  Input,
  Select,
  Spinner,
} from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import {
  SelectBranches,
  SelectDepartments,
} from 'ui-modules';
import { z } from 'zod';
import { POS_DETAIL, POS_LIST } from '../graphql/queries/relatedQueries';

const configFormSchema = z.object({
  title: z.string(),
  posId: z.string(),
  dateRule: z.enum(['alwaysNow', 'syncedDateOrNow']),
  saleAccountId: z.string(),
  saleOutAccountId: z.string(),
  saleCostAccountId: z.string(),
  branchId: z.string(),
  departmentId: z.string(),
  hasVat: z.boolean(),
  vatRowId: z.string(),
  hasCtax: z.boolean(),
  ctaxRowId: z.string(),
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

type ConfigFormValues = z.infer<typeof configFormSchema>;

export const SyncOrderConfigForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const posId = useWatch({
    control: form.control,
    name: `posId`,
  });

  const { data: posList, loading: posListLoading } = useQuery(POS_LIST, {});
  const posOptions: { value: string, label: string }[] = useMemo(() => {
    if (posListLoading) {
      return [];
    }
    return posList?.posList?.map((p: { name: any; _id: any; }) => ({ label: p.name, value: p._id }));
  }, [posList, posListLoading]);

  const { data: posDetailData, refetch: posRefetch } = useQuery(
    POS_DETAIL,
    {
      variables: { _id: posId },
      skip: !posId, // posId байхгүй үед асуухгүй
      fetchPolicy: 'network-only', // заавал backend-ээс авна
    },
  );

  useEffect(() => {
    if (posId) {
      posRefetch({ _id: posId });
    }
  }, [posId, posRefetch]);

  // note: const paymentIds: string[] = pipelineDetail?.salesPipelineDetail?.paymentIds || [];
  const paymentTypes: any[] =
    posDetailData?.posDetail?.paymentTypes || [];

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
                      <Select.Value placeholder='Select pos' />
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
              <Form.Label>Борлуулалтын данс</Form.Label>
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
              <Form.Label>Борлуулалтын зарлагын данс</Form.Label>
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
              <Form.Label>Борлуулалтын өртгийн данс</Form.Label>
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
              <Form.Label>Салбар</Form.Label>
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
              <Form.Label>Хэлтэс</Form.Label>
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
              <Form.Label>Төлбөрийн үндсэн данс</Form.Label>
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
              <Form.Label>Сөрөг төлбөрийн үндсэн данс</Form.Label>
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
          {
            type: 'cash',
            title: 'cash',
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
              <Form.Label>НӨАТ-тэй</Form.Label>
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
            <Form.Field
              control={form.control}
              name="vatRowId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>НӨАТ-ын мөр</Form.Label>
                  <Form.Control>
                    <SelectVat
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          )}
        <Form.Field
          control={form.control}
          name="hasCtax"
          render={({ field }) => (
            <Form.Item className="flex items-center col-start-1 space-x-2 space-y-0 pt-5">
              <Form.Label>НХАТ-тэй</Form.Label>
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
        }) && (
            <Form.Field
              control={form.control}
              name="ctaxRowId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>НХАТ-ын мөр</Form.Label>
                  <Form.Control>
                    <SelectCtax
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          )}

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
