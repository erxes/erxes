import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Form, Input, Sheet, Textarea } from 'erxes-ui';
import { useTemplateAdd } from '../hooks/useTemplateAdd';
import { SelectTemplateCategory } from './TemplateCategorySelect';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryIds: z.array(z.string()),
});

interface TemplateFormProps {
  contentType: string;
  contentId: string;
  onCompleted?: (data: any) => void;
  onClose?: () => void;
}

export const TemplateForm = ({
  contentType,
  contentId,
  onCompleted,
  onClose,
}: TemplateFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryIds: [],
    },
  });

  const { templateAdd, loading } = useTemplateAdd();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    templateAdd({
      variables: {
        ...values,
        contentType,
        contentId,
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
          message: error.message || 'Failed to create template',
        });
      },
    });
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
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Description</Form.Label>
                  <Textarea {...field} rows={5} />
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Parent Category</Form.Label>

                  <SelectTemplateCategory
                    mode="multiple"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
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
            disabled={loading}
          >
            Create Template
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
