import {
  Button,
  Checkbox,
  CurrencyField,
  Dialog,
  Form,
  Input,
  Select,
  Spinner,
  Textarea,
} from 'erxes-ui';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { SelectAccountCategory } from '../account-categories/components/SelectAccountCategory';
import { JOURNAL_LABELS } from '../constants/journalLabel';
import {
  AccountKind,
  ACCOUNT_KIND_LABELS,
  AccountStatus,
  ACCOUNT_STATUS_LABELS,
  JournalEnum,
  BankEnum,
} from '../types/Account';
import { TAccountForm } from '../types/accountForm';

export const AccountForm = ({
  form,
  handleSubmit,
  loading,
}: {
  form: UseFormReturn<TAccountForm>;
  handleSubmit: (data: TAccountForm) => void;
  loading: boolean;
}) => {
  const status = useWatch({
    control: form.control,
    name: 'status',
  });
  const journal = useWatch({
    control: form.control,
    name: 'journal',
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="py-4 grid grid-cols-2 gap-5"
      >
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Нэр</Form.Label>
              <Form.Control>
                <Input
                  placeholder="Дансны нэр оруулах"
                  {...field}
                  autoComplete="off"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="code"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Код</Form.Label>
              <Form.Control>
                <Input placeholder="Дансны код оруулах" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Ангилал</Form.Label>
              <Form.Control>
                <SelectAccountCategory
                  tabIndex={0}
                  selected={field.value}
                  onSelect={field.onChange}
                  recordId={field.name}
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
              <Form.Label>Валют</Form.Label>
              <Form.Control>
                <CurrencyField.SelectCurrency
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full"
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
              <Form.Label>Тайлбар</Form.Label>
              <Form.Control>
                <Textarea placeholder="Тайлбар оруулах" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="kind"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Төрөл</Form.Label>
              <Form.Control>
                <Select onValueChange={field.onChange} value={field.value}>
                  <Select.Trigger>
                    <Select.Value placeholder="Төрөл сонгох" />
                  </Select.Trigger>
                  <Select.Content>
                    {Object.values(AccountKind).map((kind) => (
                      <Select.Item key={kind} value={kind}>
                        {ACCOUNT_KIND_LABELS[kind]}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="journal"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Журнал</Form.Label>
              <Form.Control>
                <Select onValueChange={field.onChange} value={field.value}>
                  <Select.Trigger>
                    <Select.Value placeholder="Журнал сонгох" />
                  </Select.Trigger>
                  <Select.Content>
                    {Object.values(JournalEnum).map((journal) => (
                      <Select.Item key={journal} value={journal}>
                        {JOURNAL_LABELS[journal]}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        {journal === JournalEnum.BANK && (
          <>
            <Form.Field
              control={form.control}
              name="extra.bank"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Банк</Form.Label>
                  <Form.Control>
                    <Input placeholder="Банкны нэр оруулах" {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="extra.bankAccount"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Банкны данс</Form.Label>
                  <Form.Control>
                    <Input
                      placeholder="Банкны дансны дугаар оруулах"
                      {...field}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </>
        )}

        <Form.Field
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Салбар</Form.Label>
              <Form.Control>
                <SelectBranches.FormItem
                  mode="single"
                  value={field.value}
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
              <Form.Label>Хэлтэс</Form.Label>
              <Form.Control>
                <SelectDepartments.FormItem
                  mode="single"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="isTemp"
          render={({ field }) => (
            <Form.Item className="flex items-center space-x-2 space-y-0 mt-4">
              <Form.Control>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Form.Label variant="peer">Түр данс</Form.Label>
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="isOutBalance"
          render={({ field }) => (
            <Form.Item className="flex items-center space-x-2 space-y-0 mt-4">
              <Form.Control>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Form.Label variant="peer">Баланс бус</Form.Label>
            </Form.Item>
          )}
        />

        {status && (
          <Form.Field
            control={form.control}
            name="status"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Төлөв</Form.Label>
                <Form.Control>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <Select.Trigger>
                      <Select.Value placeholder="Төлөв сонгох" />
                    </Select.Trigger>
                    <Select.Content>
                      {Object.values(AccountStatus).map((status) => (
                        <Select.Item key={status} value={status}>
                          {ACCOUNT_STATUS_LABELS[status]}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}

        <Dialog.Footer className="col-span-2 mt-4">
          <Dialog.Close asChild>
            <Button variant="outline" type="button" size="lg">
              Болих
            </Button>
          </Dialog.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Данс хадгалах
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
