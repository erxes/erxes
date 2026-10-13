import { IconFileText } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfirmRemoveCategory } from '@/knowledgebase/categories/hooks/useConfirmRemoveCategory';
import { TCategoryRow } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import {
  KbRowActions,
  kbMoreColumn,
} from '@/knowledgebase/shared/components/KbRowActions';

const CategoriesMoreColumnCell = ({
  cell,
}: {
  cell: Cell<TCategoryRow, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, title } = cell.row.original;
  const { topicId = '' } = useParams();
  const navigate = useNavigate();
  const { confirmRemoveCategory } = useConfirmRemoveCategory();

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
      onDelete={() => confirmRemoveCategory({ _id, title })}
    />
  );
};

export const categoriesMoreColumn = kbMoreColumn<TCategoryRow>(
  CategoriesMoreColumnCell,
);
