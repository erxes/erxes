import { UseFormReturn } from 'react-hook-form';
import {
  Button,
  Dialog,
  Form,
  Input,
  Select,
  Spinner,
} from 'erxes-ui';
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
  hasCtax: z.boolean(),
  vatRowId: z.string(),
  ctaxRowId: z.string(),
  payments: z.record(z.object({
    accountId: z.string(),
  })),
  defaultPayment: z.object({
    accountId: z.string(),
  }),

  defaultPosPayment: z.object({
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
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-5 grid-cols-2 py-3"
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
        <Dialog.Footer className="col-span-2 mt-3 gap-2">
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
