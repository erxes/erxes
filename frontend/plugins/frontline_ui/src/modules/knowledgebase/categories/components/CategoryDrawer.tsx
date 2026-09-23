import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  InfoCard,
  Input,
  ScrollArea,
  Sheet,
  Textarea,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useSaveCategory } from '@/knowledgebase/categories/hooks/useCategoryMutations';
import { IconPicker } from '@/knowledgebase/shared/components/IconPicker';
import { SelectKbCategory } from '@/knowledgebase/shared/components/SelectKbCategory';
import { ICategory } from '@/knowledgebase/types';

const categorySchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  code: z.string().trim().optional(),
  description: z.string().trim().optional(),
  icon: z.string().min(1, { message: 'Icon is required' }),
  parentCategoryId: z.string().optional(),
});

type TCategoryForm = z.infer<typeof categorySchema>;

const EMPTY_CATEGORY: TCategoryForm = {
  title: '',
  code: '',
  description: '',
  icon: 'book',
  parentCategoryId: '',
};

export const CategoryDrawer = ({
  category,
  topicId,
  isOpen,
  onClose,
  onSaved,
}: {
  category?: ICategory;
  topicId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const isEditing = !!category;
  const { saveCategory, loading } = useSaveCategory();

  const form = useForm<TCategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: EMPTY_CATEGORY,
  });

  useEffect(() => {
    form.reset(
      category
        ? {
            title: category.title || '',
            code: category.code || '',
            description: category.description || '',
            icon: category.icon || EMPTY_CATEGORY.icon,
            parentCategoryId: category.parentCategoryId || '',
          }
        : EMPTY_CATEGORY,
    );
  }, [category, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = await saveCategory(
      {
        ...values,
        topicId,
        parentCategoryId: values.parentCategoryId || undefined,
      },
      category?._id,
    );

    if (!saved) return;

    onSaved?.();
    onClose();
    form.reset(EMPTY_CATEGORY);
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Sheet.View className="p-0 sm:max-w-xl">
        <Sheet.Header className="p-2.5 border-b">
          <Sheet.Title>
            {isEditing
              ? t('kb-edit-category', 'Edit Category')
              : t('kb-new-category', 'New Category')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <Form {...form}>
              <form onSubmit={submit} className="grid gap-4 p-4">
                <InfoCard title={t('general', 'General')}>
                  <InfoCard.Content>
                    <Form.Field
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>
                            {t('title-label', 'Title')}{' '}
                            <span className="text-destructive">*</span>
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder={t(
                                'kb-enter-category-title',
                                'Enter category title',
                              )}
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
                        <Form.Item>
                          <Form.Label>
                            {t('description', 'Description')}
                          </Form.Label>
                          <Form.Control>
                            <Textarea
                              {...field}
                              placeholder={t(
                                'kb-enter-category-description',
                                'Enter category description',
                              )}
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
                          <Form.Label>{t('kb-code', 'Code')}</Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder={t(
                                'kb-enter-category-code',
                                'Enter category code',
                              )}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </InfoCard.Content>
                </InfoCard>

                <InfoCard title={t('kb-placement', 'Placement')}>
                  <InfoCard.Content>
                    <Form.Field
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('icon', 'Icon')}</Form.Label>
                          <Form.Control>
                            <IconPicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name="parentCategoryId"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>
                            {t('kb-parent-category', 'Parent category')}
                          </Form.Label>
                          <Form.Control>
                            <SelectKbCategory
                              topicId={topicId}
                              value={field.value}
                              excludeId={category?._id}
                              allowEmpty
                              onValueChange={field.onChange}
                              placeholder={t(
                                'kb-no-parent-category',
                                'No parent category',
                              )}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </InfoCard.Content>
                </InfoCard>
              </form>
            </Form>
          </ScrollArea>
        </Sheet.Content>

        <Sheet.Footer className="flex gap-1 justify-end p-2.5 border-t shrink-0 bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" onClick={submit} disabled={loading}>
            {loading
              ? t('saving', 'Saving…')
              : isEditing
                ? t('kb-save-changes', 'Save Changes')
                : t('kb-create-category', 'Create Category')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
