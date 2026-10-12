import { IconPlus } from '@tabler/icons-react';
import { Collapsible, Sidebar } from 'erxes-ui';
import { startTransition, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { CategoryTreeItem } from '@/knowledgebase/sidebar/components/CategoryTreeItem';
import { TopicRowActions } from '@/knowledgebase/sidebar/components/TopicRowActions';
import { useKnowledgeBaseRoute } from '@/knowledgebase/sidebar/hooks/useKnowledgeBaseRoute';
import { useTopicOpenState } from '@/knowledgebase/sidebar/hooks/useTopicOpenState';
import {
  groupCategoriesByParent,
  ROOT_CATEGORY_KEY,
} from '@/knowledgebase/sidebar/utils/groupCategoriesByParent';
import { ICategory, ITopic } from '@/knowledgebase/types';

const OPEN_ANIMATION_MS = 260;

export const TopicTreeItem = ({
  topic,
  onAddCategory,
  onEditCategory,
}: {
  topic: ITopic;
  onAddCategory: (topicId: string) => void;
  onEditCategory: (topicId: string, category: ICategory) => void;
}) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const { topicId, categoryId } = useKnowledgeBaseRoute();
  const { isOpen, setOpen } = useTopicOpenState(topic._id);
  const navigateTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(navigateTimer.current), []);

  const categoryGroups = useMemo(
    () => groupCategoriesByParent(topic.categories ?? []),
    [topic.categories],
  );
  const rootCategories = categoryGroups.get(ROOT_CATEGORY_KEY) ?? [];

  const isCurrent = topicId === topic._id;

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    window.clearTimeout(navigateTimer.current);

    if (!open || isCurrent) return;

    navigateTimer.current = window.setTimeout(() => {
      startTransition(() => {
        navigate(`${KNOWLEDGE_BASE_PATH}/${topic._id}/articles`);
      });
    }, OPEN_ANIMATION_MS);
  };

  return (
    <Collapsible asChild open={isOpen} onOpenChange={handleOpenChange}>
      <Sidebar.MenuItem>
        <div className="relative group/kb-row">
          <Collapsible.Trigger asChild>
            <Sidebar.MenuButton
              size="lg"
              isActive={isCurrent && !categoryId}
              className="pr-8 font-normal data-[active=true]:font-medium"
            >
              <span>{topic.title || t('unnamed-topic', 'Unnamed topic')}</span>
            </Sidebar.MenuButton>
          </Collapsible.Trigger>

          <TopicRowActions
            topic={topic}
            onAddCategory={() => onAddCategory(topic._id)}
          />
        </div>

        <Collapsible.Content className="overflow-hidden [--radix-accordion-content-height:var(--radix-collapsible-content-height)] data-[state=closed]:animate-[accordion-up_200ms_cubic-bezier(0.4,0,0.2,1)] data-[state=open]:animate-[accordion-down_260ms_cubic-bezier(0.4,0,0.2,1)]">
          <Sidebar.Sub className="pb-1 mr-0 border-l">
            {rootCategories.map((category) => (
              <CategoryTreeItem
                key={category._id}
                topicId={topic._id}
                category={category}
                categoryGroups={categoryGroups}
                activeCategoryId={isCurrent ? categoryId : null}
                onEdit={(selected) => onEditCategory(topic._id, selected)}
              />
            ))}

            {rootCategories.length === 0 && (
              <Sidebar.SubItem>
                <Sidebar.SubButton
                  asChild
                  className="font-normal text-muted-foreground hover:text-foreground"
                >
                  <button
                    type="button"
                    onClick={() => onAddCategory(topic._id)}
                  >
                    <IconPlus />
                    <span>{t('kb-add-category', 'Add category')}</span>
                  </button>
                </Sidebar.SubButton>
              </Sidebar.SubItem>
            )}
          </Sidebar.Sub>
        </Collapsible.Content>
      </Sidebar.MenuItem>
    </Collapsible>
  );
};
