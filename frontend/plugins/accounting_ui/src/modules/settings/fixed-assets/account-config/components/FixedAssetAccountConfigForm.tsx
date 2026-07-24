import { UseFormReturn } from 'react-hook-form';
import { Button, Form, Sheet, Spinner } from 'erxes-ui';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { TFixedAssetAccountConfigForm } from '../types/FixedAssetAccountConfig';

const relatedAccountFields = [
  ['depreciationAccountId', 'Хуримтлагдсан элэгдлийн эсрэг данс'],
  ['taxAssetAccountId', 'Хойшлогдсон татварын хөрөнгийн данс'],
  ['taxLiabilityAccountId', 'Хойшлогдсон татварын өрийн данс'],
  ['TaxExpenseAccountId', 'Орлогын татварын зардлын данс'],
] as const;

export const FixedAssetAccountConfigForm = ({
  form,
  handleSubmit,
  loading,
}: {
  form: UseFormReturn<TFixedAssetAccountConfigForm>;
  handleSubmit: (data: TFixedAssetAccountConfigForm) => void;
  loading: boolean;
}) => (
  <Form {...form}>
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="py-4 grid grid-cols-2 gap-5"
    >
      <Form.Field
        control={form.control}
        name="accountId"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>Үндсэн хөрөнгийн өртгийн данс</Form.Label>
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
              placeholder="Хөрөнгийн данс сонгох"
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
              <Form.Label>{label}</Form.Label>
              <SelectAccount.FormItem
                mode="single"
                value={field.value}
                onValueChange={field.onChange}
                defaultFilter={{ permissionMode: 'write' }}
                placeholder="Данс сонгох"
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      ))}
      <Sheet.Footer className="col-span-2 mt-4">
        <Sheet.Close asChild>
          <Button variant="outline" type="button" size="lg">
            Болих
          </Button>
        </Sheet.Close>
        <Button type="submit" size="lg" disabled={loading}>
          {loading && <Spinner />}
          Хадгалах
        </Button>
      </Sheet.Footer>
    </form>
  </Form>
);
