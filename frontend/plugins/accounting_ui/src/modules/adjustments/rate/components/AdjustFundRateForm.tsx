import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  CurrencyField,
  DatePicker,
  Form,
  Sheet,
  Spinner,
  Textarea,
} from 'erxes-ui';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import type { CurrencyCode } from 'erxes-ui/types';
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

const getCurrencyCode = (value: string) =>
  value in FILTERED_CURRENCIES ? (value as CurrencyCode) : undefined;

export const AddAdjustFundRate = () => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add Fund Rate Adjustment
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="Create Fund Rate Adjustment">
        <AdjustFundRateFormContent setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
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
    <Sheet open={open} onOpenChange={setOpen} modal>
      <AccountingSheet title="Edit Fund Rate Adjustment">
        <AdjustFundRateFormContent
          setOpen={setOpen}
          adjustFundRate={adjustFundRate}
        />
      </AccountingSheet>
    </Sheet>
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

  return (
    <Form {...form}>
      <form
        className="flex flex-col flex-1 min-h-0 bg-background"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
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
                    value={getCurrencyCode(field.value)}
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
                    value={getCurrencyCode(field.value)}
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
              <Form.Item>
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

        <Sheet.Footer className="px-5 border-t bg-background shrink-0">
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
        </Sheet.Footer>
      </form>
    </Form>
  );
};
