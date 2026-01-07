import { AccountingDialog } from '@/layout/components/Dialog';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  CurrencyField,
  DatePicker,
  Dialog,
  Form,
  Spinner,
  Textarea,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { useAdjustFundRateAdd } from '../hooks/useAdjustFundRateAdd';
import { useAdjustFundRateChange } from '../hooks/useAdjustFundRateChange';
import { TAdjustFundRateForm } from '../types/adjustFundRateSchema';
import { adjustFundRateSchema } from '../types/adjustFundRateSchema';
import { IAdjustFundRate } from '../types/AdjustFundRate';
import { FILTERED_CURRENCIES } from '../constants';
import { useGetExchangeRate } from '~/modules/transactions/transaction-form/hooks/useGetExchangeRate';

export const AddAdjustFundRate = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Fund Rate Adjustment
        </Button>
      </Dialog.Trigger>
      <AccountingDialog
        title="Fund Rate Adjustment"
        description="Create a new fund rate adjustment"
      >
        <AdjustFundRateFormContent setOpen={setOpen} />
      </AccountingDialog>
    </Dialog>
  );
};

export const EditAdjustFundRate = ({
  open,
  setOpen,
  adjustFundRate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  adjustFundRate: IAdjustFundRate;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AccountingDialog
        title="Edit Fund Rate Adjustment"
        description="Update fund rate adjustment"
      >
        <AdjustFundRateFormContent
          setOpen={setOpen}
          adjustFundRate={adjustFundRate}
        />
      </AccountingDialog>
    </Dialog>
  );
};

const AdjustFundRateFormContent = ({
  setOpen,
  adjustFundRate,
}: {
  setOpen: (open: boolean) => void;
  adjustFundRate?: IAdjustFundRate;
}) => {
  const form = useForm<TAdjustFundRateForm>({
    resolver: zodResolver(adjustFundRateSchema),
    defaultValues: {
      mainCurrency: 'MNT',
      currency: '',
      spotRate: 0,
      date: new Date(),
      description: '',
      gainAccountId: '',
      lossAccountId: '',
      branchId: '',
      departmentId: '',
    },
  });

  useEffect(() => {
    if (adjustFundRate) {
      form.reset({
        mainCurrency: adjustFundRate.mainCurrency,
        currency: adjustFundRate.currency,
        spotRate: adjustFundRate.spotRate,
        date: new Date(adjustFundRate.date),
        description: adjustFundRate.description || '',
        gainAccountId: adjustFundRate.gainAccountId,
        lossAccountId: adjustFundRate.lossAccountId,
        branchId: adjustFundRate.branchId || '',
        departmentId: adjustFundRate.departmentId || '',
      });
    }
  }, [adjustFundRate, form]);

  const date = form.watch('date');
  const mainCurrency = form.watch('mainCurrency');
  const currency = form.watch('currency');

  const { spotRate: fetchedSpotRate } = useGetExchangeRate({
    variables: {
      date,
      currency,
      mainCurrency,
    },
    skip: !date || !mainCurrency || !currency,
  });

  useEffect(() => {
    if (fetchedSpotRate && fetchedSpotRate > 0) {
      form.setValue('spotRate', fetchedSpotRate);
    }
  }, [fetchedSpotRate, form]);

  const { addAdjustFundRate, loading: addLoading } = useAdjustFundRateAdd();
  const { changeAdjustFundRate, loading: changeLoading } =
    useAdjustFundRateChange();

  const loading = addLoading || changeLoading;

  const onSubmit = (data: TAdjustFundRateForm) => {
    if (adjustFundRate) {
      changeAdjustFundRate({
        variables: { _id: adjustFundRate._id, ...data },
        onCompleted: () => {
          setOpen(false);
          form.reset();
        },
      });
    } else {
      addAdjustFundRate({
        variables: { ...data },
        onCompleted: () => {
          setOpen(false);
          form.reset();
        },
      });
    }
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
        <h3 className="text-lg font-bold mb-4">
          {adjustFundRate ? 'Edit' : 'Create'} Fund Rate Adjustment
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="mainCurrency"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Main Currency <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <CurrencyField.SelectCurrency
                    value={field.value as any}
                    onChange={field.onChange}
                    currencies={FILTERED_CURRENCIES}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="currency"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Foreign Currency <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <CurrencyField.SelectCurrency
                    value={field.value as any}
                    onChange={field.onChange}
                    currencies={FILTERED_CURRENCIES}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="spotRate"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Spot Rate <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <CurrencyField.ValueInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="0.00"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="date"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Date <span className="text-destructive">*</span>
                </Form.Label>
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
            name="gainAccountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Gain Account <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <SelectAccount
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultFilter={{ journal: 'exchangeDiff' }}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="lossAccountId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  Loss Account <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <SelectAccount
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultFilter={{ journal: 'exchangeDiff' }}
                  />
                </Form.Control>
                <Form.Message />
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
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                </Form.Control>
                <Form.Message />
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
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item className="col-span-2">
                <Form.Label>Description</Form.Label>
                <Form.Control>
                  <Textarea
                    placeholder="Enter description"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

        <Dialog.Footer className="mt-6">
          <Dialog.Close asChild>
            <Button variant="outline" type="button" size="lg">
              Cancel
            </Button>
          </Dialog.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Save
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
