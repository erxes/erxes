import { useTranslation } from 'react-i18next';
import { useRemoveCategories } from '@/knowledgebase/categories/hooks/useCategoryMutations';
import { KbSelectionCommandBar } from '@/knowledgebase/shared/components/KbSelectionCommandBar';

export const CategoriesCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { removeCategories, loading } = useRemoveCategories();

  return (
    <KbSelectionCommandBar
      confirmMessage={(count) =>
        t('kb-confirm-delete-categories', {
          count,
          defaultValue: 'Are you sure you want to delete {{count}} categories?',
        })
      }
      removedMessage={t('kb-categories-deleted', 'Categories deleted')}
      remove={removeCategories}
      loading={loading}
    />
  );
};
