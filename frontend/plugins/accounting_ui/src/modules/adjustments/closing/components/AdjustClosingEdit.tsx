import {
  Button,
  DatePicker,
  Form,
  Input,
  Sheet,
  Spinner,
  Textarea,
} from 'erxes-ui';
import { IAdjustClosingDetail } from '../types/AdjustClosing';
import { TAdjustClosingForm } from '../types/adjustClosingForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adjustClosingSchema } from '../types/adjustClosingSchema';
import { useAdjustClosingEdit } from '../hooks/useAdjustClosingEdit';
import { SelectAccountFormItem } from '~/modules/settings/account/components/SelectAccount';
import { useSearchParams } from 'react-router';
import { useAdjustClosingDetail } from '../hooks/useAdjustClosingDetail';
import { useEffect } from 'react';

export const EditAdjustClosingSheet = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const adjustClosingId = searchParams.get('adjustClosingId');
  const open = Boolean(adjustClosingId);

  const { adjustClosingDetail, loading } = useAdjustClosingDetail({
    variables: { _id: adjustClosingId || '' },
    skip: !adjustClosingId,
  });

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('adjustClosingId');
      setSearchParams(newSearchParams);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.View title="Edit Closing Adjustment">
        {!loading && adjustClosingDetail ? (
          <EditAdjustClosingForm
            detail={adjustClosingDetail}
            setOpen={handleOpenChange}
          />
        ) : null}
      </Sheet.View>
    </Sheet>
  );
};

export const EditAdjustClosingForm = ({
  detail,
  setOpen,
}: {
  detail: IAdjustClosingDetail;
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<TAdjustClosingForm>({
    resolver: zodResolver(adjustClosingSchema),
    defaultValues: {
      date: new Date(),
      description: '',
    },
  });

  const { adjustClosingEdit, loading } = useAdjustClosingEdit();

  useEffect(() => {
    if (!detail) return;

    const entry = detail.entries?.[0];

    form.reset({
      status: detail.status ?? undefined,
      date: detail.date ? new Date(detail.date) : new Date(),
      description: detail.description ?? '',
      beginDate: detail.beginDate ? new Date(detail.beginDate) : undefined,
      integrateAccountId: detail.integrateAccountId ?? undefined,
      periodGLAccountId: detail.periodGLAccountId ?? undefined,
      earningAccountId: detail.earningAccountId ?? undefined,
      accountId: entry?.accountId ?? undefined,
      balance: entry?.balance ?? undefined,
      percent: entry?.percent ?? undefined,
      mainAccTrId: entry?.mainAccTrId ?? undefined,
      integrateTrId: entry?.integrateTrId ?? undefined,
    });
  }, [detail]);

  const onSubmit = (data: TAdjustClosingForm) => {
    adjustClosingEdit({
      variables: {
        ...data,
        _id: detail._id,
        taxPayableAccountId: data.taxPayableAccountId,
      },
      onCompleted: () => {
        setOpen(false);
      },
    });
  };
  return (
    <Form {...form}>
      <form
        className="p-6 flex-auto overflow-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h3 className="text-lg font-bold">Edit Adjust Inventory</h3>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Account</Form.Label>
                <Form.Control>
                  <SelectAccountFormItem
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder=" Account ID"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="balance"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Balance</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    placeholder="Balance"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="percent"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Percent</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    placeholder="Percent"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="mainAccTrId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Main Transaction</Form.Label>
                <Form.Control>
                  <SelectAccountFormItem
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder="Main Transaction ID"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="integrateTrId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Integrate Transaction</Form.Label>
                <Form.Control>
                  <SelectAccountFormItem
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder="Integrate Transaction ID"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

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
