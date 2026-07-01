import { UseFormReturn } from 'react-hook-form';
import { TAccountCategoryForm } from '../types/AccountCategory';
import { Button, Form, Input, Sheet, Spinner, Textarea } from 'erxes-ui';
import { SelectAccountCategory } from './SelectAccountCategory';

export const AccountCategoryForm = ({
  form,
  handleSubmit,
  loading,
}: {
  form: UseFormReturn<TAccountCategoryForm>;
  handleSubmit: (data: TAccountCategoryForm) => void;
  loading: boolean;
  onClose?: () => void;
}) => {
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
                      onSelect={field.onChange}
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
          </div>
        </div>

        <Sheet.Footer className="shrink-0 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" type="button" size="lg">
              Болих
            </Button>
          </Sheet.Close>

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <Spinner /> : 'Дансны ангилал хадгалах'}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
