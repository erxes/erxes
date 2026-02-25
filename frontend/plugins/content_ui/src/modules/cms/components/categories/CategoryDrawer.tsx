import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { ADD_CATEGORY, EDIT_CATEGORY } from '../../graphql/mutations';
import { Form, Input, Sheet, Button, Textarea, useToast } from 'erxes-ui';
import { ICategory } from '../../types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPicker } from '@/knowledgebase/components/IconPicker';

interface CategoryDrawerProps {
  category?: ICategory;
  topicId: string;
  parentCategoryId?: string;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}

const categorySchema = z.object({
  code: z.string().min(1, { message: 'Code is required' }),
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  topicId: z.string().optional(),
  icon: z.string().optional(),
  parentCategoryId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function CategoryDrawer({
  category,
  parentCategoryId,
  topicId,
  isOpen,
  onClose,
  refetch,
}: CategoryDrawerProps) {
  const { toast } = useToast();

  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: '',
      title: '',
      description: '',
      icon: '',
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        code: category.code || '',
        title: category.title || '',
        description: category.description || '',
        icon: category.icon || '',
      });
    } else {
      form.reset({
        code: '',
        title: '',
        description: '',
        icon: '',
      });
    }
  }, [category, topicId, form]);

  const [addCategory, { loading: adding }] = useMutation(ADD_CATEGORY, {
    onCompleted: () => {
      onClose();
      form.reset();
      refetch();
    },
  });

  const [editCategory, { loading: editing }] = useMutation(EDIT_CATEGORY, {
    onCompleted: () => {
      onClose();
      form.reset();
      refetch();
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (isEditing && category) {
      editCategory({
        variables: {
          _id: category._id,
          input: { ...data, topicId, parentCategoryId },
        },
      });
    } else {
      addCategory({
        variables: {
          input: { ...data, topicId, parentCategoryId },
        },
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>
            {isEditing ? 'Edit Category' : 'New Category'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (error) => {
              console.error(error);
            })}
            className="p-4 space-y-4"
          >
            <Form.Field
              control={form.control}
              name="code"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Code2</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Enter category code" />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="title"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Title</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="Enter category title"
                      required
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
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
                      {...field}
                      placeholder="Enter category description"
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="icon"
              render={({ field }) => (
                <Form.Item className="flex flex-col gap-2">
                  <Form.Label>Icon</Form.Label>
                  <Form.Control>
                    <IconPicker value={field.value} onChange={field.onChange} />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="icon"
              render={({ field }) => (
                <Form.Item className="flex flex-col gap-2">
                  <Form.Label>Icon</Form.Label>
                  <Form.Control></Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="topicId"
              render={({ field }) => <input type="hidden" {...field} />}
            />
            <Form.Field
              control={form.control}
              name="parentCategoryId"
              render={({ field }) => <input type="hidden" {...field} />}
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={adding || editing}>
                {adding || editing
                  ? isEditing
                    ? 'Saving...'
                    : 'Creating...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Category'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
