import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { CategoryRowActions } from '@/knowledgebase/sidebar/components/CategoryRowActions';
import { ICategoryFields } from '@/knowledgebase/types';

export const CategoryTreeItem = ({
  topicId,
  category,
  categoryGroups,
  activeCategoryId,
  onEdit,
}: {
  topicId: string;
  category: ICategoryFields;
  categoryGroups: Map<string, ICategoryFields[]>;
  activeCategoryId?: string | null;
  onEdit: (category: ICategoryFields) => void;
}) => {
  const { t } = useTranslation('frontline');
  const children = categoryGroups.get(category._id) ?? [];
  const isActive = activeCategoryId === category._id;

  return (
    <Sidebar.SubItem>
      <div className="relative group/kb-row">
        <Sidebar.SubButton
          asChild
          isActive={isActive}
          className="pr-1.5 group-hover/kb-row:pr-12 group-has-focus-visible/kb-row:pr-12 font-normal rounded-sm text-muted-foreground hover:text-foreground active:bg-primary/10 data-[active=true]:font-medium"
        >
          <Link
            to={`${KNOWLEDGE_BASE_PATH}/${topicId}/articles?categoryId=${category._id}`}
          >
            <span className="flex-1 truncate">
              {category.title || t('unnamed-category', 'Unnamed category')}
            </span>
            <span className="inline-flex justify-center items-center px-1.5 h-5 tabular-nums rounded-full min-w-5 text-[11px] bg-foreground/5 group-hover/kb-row:invisible group-has-focus-visible/kb-row:invisible">
              {category.numOfArticles ?? 0}
            </span>
          </Link>
        </Sidebar.SubButton>
        <CategoryRowActions
          topicId={topicId}
          category={category}
          isActive={isActive}
          onEdit={() => onEdit(category)}
        />
      </div>

      {children.length > 0 && (
        <Sidebar.Sub className="mr-0 border-l">
          {children.map((child) => (
            <CategoryTreeItem
              key={child._id}
              topicId={topicId}
              category={child}
              categoryGroups={categoryGroups}
              activeCategoryId={activeCategoryId}
              onEdit={onEdit}
            />
          ))}
        </Sidebar.Sub>
      )}
    </Sidebar.SubItem>
  );
};
