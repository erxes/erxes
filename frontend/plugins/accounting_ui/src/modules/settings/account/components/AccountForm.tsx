import {
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Textarea,
  CurrencyField,
  Spinner,
  Dialog,
} from 'erxes-ui';
import { AccountKind, JournalEnum } from '../types/Account';
import { SelectAccountCategory } from '../account-categories/components/SelectAccountCategory';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { UseFormReturn } from 'react-hook-form';
import { TAccountForm } from '../types/accountForm';
import { JOURNAL_LABELS } from '../constants/journalLabel';

export const AccountForm = ({
  form,
  handleSubmit,
  loading,
}: {
  form: UseFormReturn<TAccountForm>;
  handleSubmit: (data: TAccountForm) => void;
  loading: boolean;
}) => {
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
              <Form.Label>Name</Form.Label>
              <Form.Control>
                <Input
                  placeholder="Enter account name"
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
              <Form.Label>Code</Form.Label>
              <Form.Control>
                <Input placeholder="Enter account code" {...field} />
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
              <Form.Label>Category</Form.Label>
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
              <Form.Label>Currency</Form.Label>
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
              <Form.Label>Description</Form.Label>
              <Form.Control>
                <Textarea placeholder="Enter description" {...field} />
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
              <Form.Label>Kind</Form.Label>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select kind" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(AccountKind).map((kind) => (
                    <Select.Item key={kind} value={kind}>
                      {kind.charAt(0).toUpperCase() + kind.slice(1)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>

              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="journal"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Journal</Form.Label>
              <Form.Control>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select journal" />
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

        <Form.Field
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Branch</Form.Label>
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
              <Form.Label>Department</Form.Label>
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
              <Form.Label variant="peer">Temporary Account</Form.Label>
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
              <Form.Label variant="peer">Out of Balance</Form.Label>
            </Form.Item>
          )}
        />

        <Dialog.Footer className="col-span-2 mt-4">
          <Dialog.Close asChild>
            <Button variant="outline" type="button" size="lg">
              Cancel
            </Button>
          </Dialog.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Save Account
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
