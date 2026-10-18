import { useTranslation } from 'react-i18next';
import { useRemoveCategories } from '@/knowledgebase/categories/hooks/useCategoryMutations';
import { useKbConfirmRemove } from '@/knowledgebase/shared/hooks/useKbConfirmRemove';

export const useConfirmRemoveCategory = () => {
  const { t } = useTranslation('frontline');
  const { removeCategories, loading } = useRemoveCategories();
  const confirmRemove = useKbConfirmRemove();

  const confirmRemoveCategory = (
    category: { _id: string; title?: string | null },
    onRemoved?: () => void,
  ) =>
    confirmRemove({
      message: t('kb-confirm-delete-category', {
        title: category.title || t('unnamed-category'),
        defaultValue:
          'Are you sure you want to delete "{{title}}"? This will also delete all associated articles.',
      }),
      removedMessage: t('kb-category-deleted', 'Category deleted'),
      remove: () => removeCategories([category._id]),
      onRemoved,
    });

  return { confirmRemoveCategory, loading };
};
