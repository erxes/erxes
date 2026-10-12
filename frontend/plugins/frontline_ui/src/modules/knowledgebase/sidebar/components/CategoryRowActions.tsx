import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useConfirmRemoveCategory } from '@/knowledgebase/categories/hooks/useConfirmRemoveCategory';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { KbSidebarRowActions } from '@/knowledgebase/sidebar/components/KbSidebarRowActions';
import { ICategory } from '@/knowledgebase/types';

export const CategoryRowActions = ({
  topicId,
  category,
  isActive,
  onEdit,
}: {
  topicId: string;
  category: ICategory;
  isActive: boolean;
  onEdit: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const { confirmRemoveCategory } = useConfirmRemoveCategory();

  const handleDelete = () =>
    confirmRemoveCategory(category, () => {
      if (isActive) {
        navigate(`${KNOWLEDGE_BASE_PATH}/${topicId}/articles`);
      }
    });

  return (
    <KbSidebarRowActions
      label={t('kb-category-actions', 'Category actions')}
      actions={[
        {
          value: 'edit',
          icon: IconPencil,
          label: t('kb-edit-category', 'Edit Category'),
          onClick: onEdit,
        },
        {
          value: 'delete',
          icon: IconTrash,
          label: t('delete', 'Delete'),
          onClick: handleDelete,
          destructive: true,
        },
      ]}
    />
  );
};
