import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { TemplateDetail } from '@/templates/hooks/useTemplateDetail';
import { useTemplateEdit } from '@/templates/hooks/useTemplateEdit';
import { Button, Form, Input, Sheet, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectTemplateCategory } from 'ui-modules/modules/templates';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryIds: z.array(z.string()),
});

interface TemplateEditFormProps {
  template: TemplateDetail;
  onClose: () => void;
}

export const TemplateEditForm = ({
  template,
  onClose,
}: TemplateEditFormProps) => {
  const { t } = useTranslation('templates', { keyPrefix: 'template' });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template.name || '',
      description: template.description || '',
      categoryIds: template.categoryIds || [],
    },
  });

  const { templateEdit, loading } = useTemplateEdit();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    templateEdit({
      variables: {
        _id: template._id,
        ...values,
      },
      onCompleted: onClose,
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
                  <Form.Label>{t('name')}</Form.Label>
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
                  <Form.Label>{t('description')}</Form.Label>
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
                  <Form.Label>{t('category')}</Form.Label>
                  <SelectTemplateCategory.FormItem
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
            {t('cancel')}
          </Button>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loading}
          >
            {loading ? t('saving') : t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
