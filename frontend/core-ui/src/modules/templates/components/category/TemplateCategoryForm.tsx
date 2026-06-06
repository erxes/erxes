import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTemplateCategoryAdd } from '@/templates/hooks/useTemplateCategoryAdd';
import { useTemplateCategoryEdit } from '@/templates/hooks/useTemplateCategoryEdit';
import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { Button, Form, Input, Sheet } from 'erxes-ui';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  parentId: z.string().optional(),
});

interface TemplateCategoryFormProps {
  category?: TemplateCategory;
  parentId?: string;
  onCompleted?: (data: any) => void;
  onClose?: () => void;
}

export const TemplateCategoryForm = ({
  category,
  parentId,
  onCompleted,
  onClose,
}: TemplateCategoryFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      code: category?.code || '',
      parentId: category?.parentId || parentId || '',
    },
  });

  const { templateCategoryAdd, loading: addLoading } = useTemplateCategoryAdd();
  const { templateCategoryEdit, loading: editLoading } =
    useTemplateCategoryEdit();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (category) {
      templateCategoryEdit({
        variables: {
          _id: category._id,
          ...values,
        },
        onCompleted: (data) => {
          form.reset();
          if (onClose) {
            onClose();
          }
          if (onCompleted) {
            onCompleted(data);
          }
        },
        onError: (error) => {
          form.setError('root', {
            message: error.message || 'Failed to update category',
          });
        },
      });
    } else {
      templateCategoryAdd({
        variables: values,
        onCompleted: (data) => {
          form.reset();
          if (onClose) {
            onClose();
          }
          if (onCompleted) {
            onCompleted(data);
          }
        },
        onError: (error) => {
          form.setError('root', {
            message: error.message || 'Failed to create category',
          });
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <Sheet.Content className="flex-auto overflow-hidden">
          <div className="flex flex-col gap-4 p-5">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Name</Form.Label>
                  <Input {...field} />
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
                  <Input {...field} />
                  <Form.Message />
                </Form.Item>
              )}
            />

            {/* <Form.Field
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Parent Category</Form.Label>

                  <SelectTemplateCategory
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            /> */}
          </div>
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end gap-1 bg-muted p-2.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={addLoading || editLoading}
          >
            {addLoading || editLoading
              ? 'Saving...'
              : category
                ? 'Update Category'
                : 'Create Category'}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
