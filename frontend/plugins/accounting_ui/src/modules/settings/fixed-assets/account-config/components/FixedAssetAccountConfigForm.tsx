import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Button, Form, Sheet, Spinner } from 'erxes-ui';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { TFixedAssetAccountConfigForm } from '../types/FixedAssetAccountConfig';

const relatedAccountFields = [
  ['depreciationAccountId', 'accumulated-depreciation-offset-account'],
  ['taxAssetAccountId', 'deferred-tax-asset-account'],
  ['taxLiabilityAccountId', 'deferred-tax-liability-account'],
  ['TaxExpenseAccountId', 'income-tax-expense-account'],
] as const;

export const FixedAssetAccountConfigForm = ({
  form,
  handleSubmit,
  loading,
}: {
  form: UseFormReturn<TFixedAssetAccountConfigForm>;
  handleSubmit: (data: TFixedAssetAccountConfigForm) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col flex-1 bg-background min-h-0"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-5">
            <Form.Field
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <Form.Item className="col-span-2">
                  <Form.Label>{t('fixed-asset-cost-account')}</Form.Label>
                  <SelectAccount.FormItem
                    mode="single"
                    value={field.value}
                    onValueChange={(accountId) => {
                      field.onChange(accountId);
                      form.setValue('value.accountId', accountId as string);
                    }}
                    defaultFilter={{
                      journals: [JournalEnum.FIXED_ASSET],
                      permissionMode: 'write',
                    }}
                    placeholder={t('select-an-asset-account')}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            {relatedAccountFields.map(([name, label]) => (
              <Form.Field
                key={name}
                control={form.control}
                name={`value.${name}`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t(label)}</Form.Label>
                    <SelectAccount.FormItem
                      mode="single"
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultFilter={{ permissionMode: 'write' }}
                      placeholder={t('select-accounts')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            ))}
          </div>
        </div>
        <Sheet.Footer className="shrink-0 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" type="button" size="lg">
              {t('cancel')}
            </Button>
          </Sheet.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            {t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
