import { SelectAccount } from '@/settings/account/components/SelectAccount';
import {
  getCurrencyCodeFromOptions,
  useCurrencyConfigs,
} from '@/settings/hooks/useCurrencyConfigs';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  CurrencyField,
  DatePicker,
  Form,
  Select,
  Sheet,
  Spinner,
  Textarea,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  CustomerType,
  SelectBranches,
  SelectCompany,
  SelectCustomer,
  SelectDepartments,
} from 'ui-modules';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { useGetExchangeRate } from '~/modules/transactions/transaction-form/hooks/useGetExchangeRate';
import { useAdjustDebtRateAdd } from '../hooks/useAdjustDebtRateAdd';
import { useAdjustDebtRateChange } from '../hooks/useAdjustDebtRateChange';
import { IAdjustDebtRate } from '../types/AdjustDebtRate';
import { adjustDebtRateSchema, TAdjustDebtRateForm } from '../types/adjustDebtRateSchema';

export const AddAdjustDebtRate = () => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add Debt Rate Adjustment
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="Create Debt Rate Adjustment">
        <AdjustDebtRateFormContent setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};

export const EditAdjustDebtRate = ({
  open,
  setOpen,
  adjustDebtRate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  adjustDebtRate: IAdjustDebtRate;
}) => {
  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <AccountingSheet title="Edit Debt Rate Adjustment">
        <AdjustDebtRateFormContent
          setOpen={setOpen}
          adjustDebtRate={adjustDebtRate}
        />
      </AccountingSheet>
    </Sheet>
  );
};

const AdjustDebtRateFormContent = ({
  setOpen,
  adjustDebtRate,
}: {
  setOpen: (open: boolean) => void;
  adjustDebtRate?: IAdjustDebtRate;
}) => {
  const { dealCurrencyOptions, mainCurrency: configuredMainCurrency } =
    useCurrencyConfigs();
  const form = useForm<TAdjustDebtRateForm>({
    resolver: zodResolver(adjustDebtRateSchema),
    defaultValues: {
      mainCurrency: 'MNT',
      currency: '',
      spotRate: 0,
      date: new Date(),
      customerType: '',
      customerId: '',
      description: '',
      gainAccountId: '',
      lossAccountId: '',
      branchId: '',
      departmentId: '',
    },
  });

  useEffect(() => {
    if (adjustDebtRate) {
      form.reset({
        mainCurrency: adjustDebtRate.mainCurrency,
        currency: adjustDebtRate.currency,
        spotRate: adjustDebtRate.spotRate,
        date: new Date(adjustDebtRate.date),
        customerType: adjustDebtRate.customerType || '',
        customerId: adjustDebtRate.customerId || '',
        description: adjustDebtRate.description || '',
        gainAccountId: adjustDebtRate.gainAccountId,
        lossAccountId: adjustDebtRate.lossAccountId,
        branchId: adjustDebtRate.branchId || '',
        departmentId: adjustDebtRate.departmentId || '',
      });
    }
  }, [adjustDebtRate, form]);

  useEffect(() => {
    if (!adjustDebtRate && configuredMainCurrency) {
      form.setValue('mainCurrency', configuredMainCurrency);
    }
  }, [adjustDebtRate, configuredMainCurrency, form]);

  const date = form.watch('date');
  const mainCurrency = form.watch('mainCurrency');
  const currency = form.watch('currency');
  const customerType = form.watch('customerType');

  // Reset customerId when customerType changes
  useEffect(() => {
    form.setValue('customerId', '');
  }, [customerType, form]);

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

  const { addAdjustDebtRate, loading: addLoading } = useAdjustDebtRateAdd();
  const { changeAdjustDebtRate, loading: changeLoading } =
    useAdjustDebtRateChange();

  const loading = addLoading || changeLoading;

  const onSubmit = (data: TAdjustDebtRateForm) => {
    if (adjustDebtRate) {
      changeAdjustDebtRate({
        variables: { _id: adjustDebtRate._id, ...data },
        onCompleted: () => {
          setOpen(false);
          form.reset();
        },
      });
    } else {
      addAdjustDebtRate({
        variables: { ...data },
        onCompleted: () => {
          setOpen(false);
          form.reset();
        },
      });
    }
  };

  let SelectCustomerComponent = null;
  if (customerType === CustomerType.CUSTOMER) {
    SelectCustomerComponent = SelectCustomer.FormItem;
  } else if (customerType === CustomerType.COMPANY) {
    SelectCustomerComponent = SelectCompany;
  }

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
                    value={getCurrencyCodeFromOptions(
                      field.value,
                      dealCurrencyOptions,
                    )}
                    onChange={field.onChange}
                    currencies={dealCurrencyOptions}
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
                    value={getCurrencyCodeFromOptions(
                      field.value,
                      dealCurrencyOptions,
                    )}
                    onChange={field.onChange}
                    currencies={dealCurrencyOptions}
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
            name="customerType"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Customer Type (Optional)</Form.Label>
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (!value) {
                      form.setValue('customerId', '');
                    }
                  }}
                >
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value placeholder="None - All Customers" />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    <Select.Item value={CustomerType.CUSTOMER}>
                      Customer
                    </Select.Item>
                    <Select.Item value={CustomerType.COMPANY}>
                      Company
                    </Select.Item>
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />

          {SelectCustomerComponent && (
            <Form.Field
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Customer</Form.Label>
                  <SelectCustomerComponent
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    mode="single"
                    className="flex"
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
          )}

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
