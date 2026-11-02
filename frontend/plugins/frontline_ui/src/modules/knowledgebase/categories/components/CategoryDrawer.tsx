import {
  KbFormItem,
  KbFormSection,
} from '@/knowledgebase/shared/components/KbFormLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useSaveCategory } from '@/knowledgebase/categories/hooks/useCategoryMutations';
import { IconPicker } from '@/knowledgebase/shared/components/IconPicker';
import { KbFormSheet } from '@/knowledgebase/shared/components/KbFormSheet';
import { KbTextField } from '@/knowledgebase/shared/components/KbTextField';
import { SelectKbCategory } from '@/knowledgebase/shared/components/SelectKbCategory';
import { SelectKbTopic } from '@/knowledgebase/shared/components/SelectKbTopic';
import { ICategoryFields } from '@/knowledgebase/types';

const categorySchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  code: z.string().trim().optional(),
  description: z.string().trim().optional(),
  icon: z.string().min(1, { message: 'Icon is required' }),
  topicId: z.string().min(1, { message: 'Knowledge base is required' }),
  parentCategoryId: z.string().optional(),
});

type TCategoryForm = z.infer<typeof categorySchema>;

const emptyCategory = (topicId: string): TCategoryForm => ({
  title: '',
  code: '',
  description: '',
  icon: 'book',
  topicId,
  parentCategoryId: '',
});

export const CategoryDrawer = ({
  category,
  topicId,
  isOpen,
  onClose,
  onSaved,
  panel = false,
}: {
  category?: ICategoryFields;
  topicId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  panel?: boolean;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const isEditing = !!category;
  const { saveCategory, loading } = useSaveCategory();

  const form = useForm<TCategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyCategory(topicId),
  });

  const selectedTopicId = form.watch('topicId');

  useEffect(() => {
    form.reset(
      category
        ? {
            title: category.title || '',
            code: category.code || '',
            description: category.description || '',
            icon: category.icon || emptyCategory(topicId).icon,
            topicId,
            parentCategoryId: category.parentCategoryId || '',
          }
        : emptyCategory(topicId),
    );
  }, [category, topicId, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = await saveCategory(
      {
        ...values,
        parentCategoryId: values.parentCategoryId || '',
      },
      category?._id,
    );

    if (!saved) return;

    onSaved?.();
    onClose();
    form.reset(emptyCategory(topicId));
  });

  return (
    <KbFormSheet
      isOpen={isOpen}
      panel={panel}
      onClose={onClose}
      title={
        isEditing
          ? t('kb-edit-category', 'Edit Category')
          : t('kb-new-category', 'New Category')
      }
      submitLabel={
        isEditing
          ? t('kb-save-changes', 'Save Changes')
          : t('kb-create-category', 'Create Category')
      }
      loading={loading}
      onSubmit={submit}
    >
      <Form {...form}>
        <form
          onSubmit={submit}
          className={panel ? 'grid gap-2 p-3' : 'grid gap-4 p-4'}
        >
          <KbFormSection title={t('general', 'General')}>
            <KbFormSection.Content>
              <KbTextField
                control={form.control}
                name="title"
                label={t('title-label', 'Title')}
                placeholder={t(
                  'kb-enter-category-title',
                  'Enter category title',
                )}
                required
              />
              <KbTextField
                control={form.control}
                name="description"
                label={t('description', 'Description')}
                placeholder={t(
                  'kb-enter-category-description',
                  'Enter category description',
                )}
                multiline
              />
              <KbTextField
                control={form.control}
                name="code"
                label={t('kb-code', 'Code')}
                placeholder={t('kb-enter-category-code', 'Enter category code')}
              />
            </KbFormSection.Content>
          </KbFormSection>

          <KbFormSection title={t('kb-placement', 'Placement')}>
            <KbFormSection.Content>
              <Form.Field
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <KbFormItem label={t('icon', 'Icon')}>
                    <Form.Control>
                      <IconPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </KbFormItem>
                )}
              />

              <Form.Field
                control={form.control}
                name="topicId"
                render={({ field }) => (
                  <KbFormItem
                    required
                    label={t('knowledge-base', 'Knowledge Base')}
                  >
                    <Form.Control>
                      <SelectKbTopic
                        value={field.value}
                        onValueChange={(nextTopicId) => {
                          if (nextTopicId === field.value) return;

                          field.onChange(nextTopicId);
                          form.setValue('parentCategoryId', '');
                        }}
                      />
                    </Form.Control>
                    {isEditing && field.value !== topicId && (
                      <Form.Description>
                        {t(
                          'kb-move-category-help',
                          'Its subcategories and articles move with it.',
                        )}
                      </Form.Description>
                    )}
                    <Form.Message />
                  </KbFormItem>
                )}
              />

              <Form.Field
                control={form.control}
                name="parentCategoryId"
                render={({ field }) => (
                  <KbFormItem
                    label={t('kb-parent-category', 'Parent category')}
                  >
                    <Form.Control>
                      <SelectKbCategory
                        topicId={selectedTopicId}
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
                  </KbFormItem>
                )}
              />
            </KbFormSection.Content>
          </KbFormSection>
        </form>
      </Form>
    </KbFormSheet>
  );
};
