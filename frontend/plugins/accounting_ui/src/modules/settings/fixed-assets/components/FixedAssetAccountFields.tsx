import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { Form } from 'erxes-ui';
import { SelectAccount } from '@/settings/account/components/SelectAccount';

const accountFields = [
  ['fixedAssetAccountId', 'Хөрөнгийн данс'],
  ['accumulatedDepreciationAccountId', 'Хуримтлагдсан элэгдлийн данс'],
  ['depreciationExpenseAccountId', 'Элэгдлийн зардлын данс'],
  ['gainAccountId', 'Борлуулалтын олзын данс'],
  ['lossAccountId', 'Борлуулалтын гарзын данс'],
  ['revaluationReserveAccountId', 'Дахин үнэлгээний нөөцийн данс'],
  ['deferredTaxAssetAccountId', 'Хойшлогдсон татварын хөрөнгийн данс'],
  ['deferredTaxLiabilityAccountId', 'Хойшлогдсон татварын өрийн данс'],
  ['incomeTaxExpenseAccountId', 'Орлогын татварын зардлын данс'],
] as const;

export const FixedAssetAccountFields = <TFormValues extends FieldValues>({
  form,
}: {
  form: UseFormReturn<TFormValues>;
}) => {
  return (
    <>
      {accountFields.map(([name, label]) => (
        <Form.Field
          key={name}
          control={form.control}
          name={`accounts.${name}` as Path<TFormValues>}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{label}</Form.Label>
              <SelectAccount.FormItem
                mode="single"
                value={field.value as string}
                onValueChange={field.onChange}
                placeholder="Данс сонгох"
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      ))}
    </>
  );
};
