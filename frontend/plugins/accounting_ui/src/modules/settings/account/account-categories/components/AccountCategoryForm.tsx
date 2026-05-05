import { UseFormReturn } from 'react-hook-form';
import { TAccountCategoryForm } from '../types/AccountCategory';
import { Button, Dialog, Form, Input, Spinner, Textarea } from 'erxes-ui';
import { SelectAccountCategory } from './SelectAccountCategory';

export const AccountCategoryForm = ({
  form,
  handleSubmit,
  loading,
}: {
  form: UseFormReturn<TAccountCategoryForm>;
  handleSubmit: (data: TAccountCategoryForm) => void;
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
            <Form.Item className="col-span-2">
              <Form.Label>Нэр</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
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
                <Input {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Эцэг</Form.Label>
              <Form.Control>
                <SelectAccountCategory
                  recordId={field.value ?? ''}
                  selected={field.value}
                  onSelect={(parentId) => field.onChange(parentId)}
                />
              </Form.Control>
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
                <Textarea {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Dialog.Footer className="col-span-2 mt-4">
          <Dialog.Close asChild>
            <Button variant="outline" type="button" size="lg">
              Болих
            </Button>
          </Dialog.Close>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Дансны ангилал хадгалах
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
