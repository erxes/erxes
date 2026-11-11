import { usePagePanelContext } from '@/side-panel/hooks/usePagePanel';
import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTemplateCategoryAdd } from '@/templates/hooks/useTemplateCategoryAdd';
import { useTemplateCategoryEdit } from '@/templates/hooks/useTemplateCategoryEdit';
import { Button, Form, Input, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  parentId: z.string().optional(),
});
interface TemplateCategoryFormProps {
  category?: TemplateCategory;
  parentId?: string;
  onCompleted?: (data: unknown) => void;
  onClose?: () => void;
}
export const TemplateCategoryForm = ({
  category,
  parentId,
  onCompleted,
  onClose,
}: TemplateCategoryFormProps) => {
  const pagePanel = usePagePanelContext();
  const { t } = useTranslation('templates', {
    keyPrefix: 'template-category',
  });
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
          if (!pagePanel.isCurrent()) return;
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
            message: error.message || t('update-failed'),
          });
        },
      });
    } else {
      templateCategoryAdd({
        variables: values,
        onCompleted: (data) => {
          if (!pagePanel.isCurrent()) return;
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
            message: error.message || t('create-failed'),
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
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-y-auto',
            'flex-auto overflow-hidden',
          )}
        >
          <div className="flex flex-col gap-4 p-5">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('name')}</Form.Label>
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
                  <Form.Label>{t('code')}</Form.Label>
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
        </div>

        <div
          className={cn(
            'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
            'flex justify-end gap-1 bg-muted p-2.5 shrink-0',
          )}
        >
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={onClose}
          >
            {t('cancel')}
          </Button>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={addLoading || editLoading}
          >
            {addLoading || editLoading
              ? t('saving')
              : category
              ? t('update-category')
              : t('create-category')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
