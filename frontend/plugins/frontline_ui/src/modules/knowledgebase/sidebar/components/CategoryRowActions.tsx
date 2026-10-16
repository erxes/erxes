import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useConfirmRemoveCategory } from '@/knowledgebase/categories/hooks/useConfirmRemoveCategory';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { ICategoryFields } from '@/knowledgebase/types';

export const CategoryRowActions = ({
  topicId,
  category,
  isActive,
  onEdit,
}: {
  topicId: string;
  category: ICategoryFields;
  isActive: boolean;
  onEdit: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const { confirmRemoveCategory } = useConfirmRemoveCategory();
  const editLabel = t('kb-edit-category', 'Edit Category');
  const deleteLabel = t('delete', 'Delete');

  const handleDelete = () =>
    confirmRemoveCategory(category, () => {
      if (isActive) {
        navigate(`${KNOWLEDGE_BASE_PATH}/${topicId}/articles`);
      }
    });

  return (
    <div className="flex absolute right-1 top-1/2 gap-0.5 items-center opacity-0 transition-opacity duration-150 -translate-y-1/2 group-hover/kb-row:opacity-100 has-focus-visible:opacity-100">
      <Button
        variant="ghost"
        size="icon"
        aria-label={editLabel}
        title={editLabel}
        onClick={onEdit}
        className="size-5 text-muted-foreground hover:text-foreground hover:bg-foreground/10 [&>svg]:size-3.5"
      >
        <IconPencil />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={deleteLabel}
        title={deleteLabel}
        onClick={handleDelete}
        className="size-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 [&>svg]:size-3.5"
      >
        <IconTrash />
      </Button>
    </div>
  );
};
