import { IconFileText } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useRemoveCategories } from '@/knowledgebase/categories/hooks/useCategoryMutations';
import { TCategoryRow } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import {
  KbRowActions,
  kbMoreColumn,
} from '@/knowledgebase/shared/components/KbRowActions';
import { useKbConfirmRemove } from '@/knowledgebase/shared/hooks/useKbConfirmRemove';

const CategoriesMoreColumnCell = ({
  cell,
}: {
  cell: Cell<TCategoryRow, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, title } = cell.row.original;
  const { topicId = '' } = useParams();
  const navigate = useNavigate();
  const { removeCategories } = useRemoveCategories();
  const confirmRemove = useKbConfirmRemove();

  return (
    <KbRowActions
      id={_id}
      actions={[
        {
          value: 'articles',
          icon: IconFileText,
          label: t('kb-view-articles', 'View articles'),
          onSelect: () =>
            navigate(
              `${KNOWLEDGE_BASE_PATH}/${topicId}/articles?categoryId=${_id}`,
            ),
        },
      ]}
      onDelete={() =>
        confirmRemove({
          message: t('kb-confirm-delete-category', {
            title: title || t('unnamed-category'),
            defaultValue:
              'Are you sure you want to delete "{{title}}"? This will also delete all associated articles.',
          }),
          removedMessage: t('kb-category-deleted', 'Category deleted'),
          remove: () => removeCategories([_id]),
        })
      }
    />
  );
};

export const categoriesMoreColumn = kbMoreColumn<TCategoryRow>(
  CategoriesMoreColumnCell,
);
