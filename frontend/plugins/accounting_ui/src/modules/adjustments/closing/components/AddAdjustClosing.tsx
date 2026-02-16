import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  DatePicker,
  Dialog,
  Form,
  Input,
  Spinner,
  Textarea,
  useQueryState,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { TAdjustClosingForm } from '../types/adjustClosingForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adjustClosingSchema } from '../types/adjustClosingSchema';
import { AccountingDialog } from '~/modules/layout/components/Dialog';
import { useAdjustClosingAdd } from '../hooks/useAdjustClosingAdd';
import { SelectAccountFormItem } from '~/modules/settings/account/components/SelectAccount';
import { TAdjustClosingPreviewItem } from '../types/AdjustClosing';
import { useLazyQuery } from '@apollo/client';
import { PREVIEW_ADJUST_CLOSING } from '../graphql/adjustClosingPreview';

export const AddAdjustClosing = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Closing Adjustment
        </Button>
      </Dialog.Trigger>
      <AccountingDialog title="Add Account" description="Add a new account">
        <AddAdjustClosingForm setOpen={setOpen} />
      </AccountingDialog>
    </Dialog>
  );
};

const AddAdjustClosingForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<TAdjustClosingForm>({
    resolver: zodResolver(adjustClosingSchema),
    defaultValues: { date: new Date() },
  });
  const { addAdjustClosing, loading } = useAdjustClosingAdd();

  const beginDate = form.watch('beginDate');
  const date = form.watch('date');
  const integrateAccountId = form.watch('integrateAccountId');

  const beginDateValue = beginDate === null ? undefined : beginDate;

  const dateValue = date === null ? undefined : date;

  const [loadPreview, { data, loading: previewLoading }] = useLazyQuery(
    PREVIEW_ADJUST_CLOSING,
    {
      variables: {
        beginDate: beginDateValue,
        date: dateValue,
        accountIds: integrateAccountId ? [integrateAccountId] : [],
      },
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    if (integrateAccountId && beginDate && date) {
      loadPreview();
    }
  }, [integrateAccountId, beginDate, date, loadPreview]);

  const [id] = useQueryState<string>('id');
  const onSubmit = (data: TAdjustClosingForm) => {
    addAdjustClosing({
      variables: { ...data },
      onCompleted: () => {
        setOpen(false);
        form.reset();
      },
    });
  };
  const onError = (error: any) => {
    console.log(error);
  };

  return (
    <Form {...form}>
      <form
        className="p-6 flex-auto overflow-auto"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        {' '}
        <h3 className="text-lg font-bold">
          {id ? `Edit` : `Create`} Adjust Inventory
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="date"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Date</Form.Label>
                <Form.Control>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="h-8 flex w-full"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="beginDate"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Begin date</Form.Label>
                <Form.Control>
                  <DatePicker
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    className="h-8 flex w-full"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="integrateAccountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Integrate account</Form.Label>
                <SelectAccountFormItem
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                  placeholder="Integrate account ID"
                />
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="periodGLAccountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Period GL account</Form.Label>
                <Form.Control>
                  <SelectAccountFormItem
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder="Period GL account ID"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="earningAccountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Earning account</Form.Label>
                <Form.Control>
                  <SelectAccountFormItem
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder="Earning account ID"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="taxPayableAccountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Tax payable account</Form.Label>
                <Form.Control>
                  <SelectAccountFormItem
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder="Tax Payable account ID"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        {integrateAccountId && beginDate && date && (
          <div className="mt-6 rounded-md border p-4">
            <h4 className="font-semibold mb-3">Adjust Closing Preview</h4>

            {previewLoading && (
              <div className="text-sm text-muted-foreground">
                Calculating...
              </div>
            )}

            {!previewLoading &&
              data?.previewAdjustClosingEntries?.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No entries found
                </div>
              )}

            {!previewLoading &&
              data?.previewAdjustClosingEntries?.map(
                (item: TAdjustClosingPreviewItem) => (
                  <div
                    key={item.accountId}
                    className="flex justify-between border-b py-2 text-sm"
                  >
                    <span>{item.accountId}</span>
                    <span className="font-medium">
                      {item.side.toUpperCase()} · {item.amount.toLocaleString()}
                    </span>
                  </div>
                ),
              )}
          </div>
        )}
        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>Description</Form.Label>
              <Form.Control>
                <Textarea placeholder="Enter description" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <div className="col-span-2 mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            size="lg"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};
