import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { SelectCtax } from '@/settings/ctax/components/SelectCtaxRow';
import { SelectVat } from '@/settings/vat/components/SelectVatRow';
import { gql, useApolloClient } from '@apollo/client';
import {
  Button,
  Checkbox,
  Dialog,
  Form,
  Input,
  Select,
  Spinner,
} from 'erxes-ui';
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { z } from "zod";

const configFormSchema = z.object({
  title: z.string(),
  boardId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string(),
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
  payments: z.record(z.object({
    accountId: z.string(),
  })),
  defaultPayment: z.object({
    accountId: z.string(),
  }),
  defaultNegPayment: z.object({
    accountId: z.string(),
  }),
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

export const SyncDealConfigForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const pipelineId = useWatch({
    control: form.control,
    name: `pipelineId`
  });
  const client = useApolloClient();

  const { paymentIds, paymentTypes } = useMemo(() => {
    const pipelineDetailQryResp = client.readQuery({
      query: gql`
        query SalesPipelineDetail($_id: String!) {
          salesPipelineDetail(_id: $_id) {
            _id
            name
            paymentIds
            paymentTypes
          }
        }
      `,
      variables: { _id: pipelineId },
    });

    const { paymentIds, paymentTypes } = pipelineDetailQryResp?.salesPipelineDetail || {};
    return {
      paymentIds, paymentTypes: [
        {
          "type": "barter",
          "title": "barter",
          "icon": "mastercard",
          "config": ""
        },
        {
          "type": "invoice",
          "title": "invoice",
          "icon": "credit-card",
          "config": ""
        }
      ]
    }
  }, [pipelineId]);



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
              <Form.Label>Title</Form.Label>
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
              <Form.Label>Date Rule</Form.Label>
              <Form.Control>
                <Select {...field} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="alwaysNow">Always Now</Select.Item>
                    <Select.Item value="syncedDateOrNow">Synced Date Or Now</Select.Item>
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
            <Form.Item className='col-start-1'>
              <Form.Label>Board</Form.Label>
              <Form.Control>
                <Input value='rpab9jkCPirQqSTt7' />
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
                <Input value='qyjnZgprD0c_yuv8t7VFV' />
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
                <Input value='gzgrcQKjBdhkSqvTyGXi1' />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="saleAccountId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Sale Account</Form.Label>
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
              <Form.Label>Sale Out Account</Form.Label>
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
              <Form.Label>Sale Cost Account</Form.Label>
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
              <Form.Label>Branch</Form.Label>
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
              <Form.Label>Department</Form.Label>
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
              <Form.Label>Default Payment Account</Form.Label>
              <Form.Control>
                <SelectAccount.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: [JournalEnum.BANK, JournalEnum.CASH, JournalEnum.DEBT] }}
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
              <Form.Label>Default Negative Payment Account</Form.Label>
              <Form.Control>
                <SelectAccount.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: [JournalEnum.BANK, JournalEnum.CASH, JournalEnum.DEBT] }}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        {paymentTypes.map(ptype => (
          <Form.Field
            control={form.control}
            name={`payments.${ptype.type}.accountId`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{ptype.title}</Form.Label>
                <Form.Control>
                  <SelectAccount.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultFilter={{ journals: [JournalEnum.BANK, JournalEnum.CASH, JournalEnum.DEBT] }}
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
            <Form.Item className='flex items-center col-start-1 space-x-2 space-y-0 pt-5'>
              <Form.Label>Has VAT</Form.Label>
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
          name: `hasVat`
        }) && (<Form.Field
          control={form.control}
          name="vatRowId"
          render={({ field }) => (
            <Form.Item >
              <Form.Label>Vat Row</Form.Label>
              <Form.Control>
                <SelectVat
                  value={field.value || ''}
                  onValueChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />)}
        <Form.Field
          control={form.control}
          name="hasCtax"
          render={({ field }) => (
            <Form.Item className='flex items-center col-start-1 space-x-2 space-y-0 pt-5'>
              <Form.Label>Has CTAX</Form.Label>
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
          name: `hasCtax`
        }) && (<Form.Field
          control={form.control}
          name="ctaxRowId"
          render={({ field }) => (
            <Form.Item >
              <Form.Label>Ctax Row</Form.Label>
              <Form.Control>
                <SelectCtax
                  value={field.value || ''}
                  onValueChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />)}

        <Dialog.Footer className="col-span-3 mt-3 gap-2">
          <Dialog.Close asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Dialog.Close>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Spinner /> : 'Submit'}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
