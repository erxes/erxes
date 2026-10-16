import { IconPlus } from '@tabler/icons-react';
import { isDefined, Sidebar } from 'erxes-ui';
import { useMemo, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { CategoryTreeItem } from '@/knowledgebase/sidebar/components/CategoryTreeItem';
import { KbDisclosure } from '@/knowledgebase/sidebar/components/KbDisclosure';
import { TopicRowActions } from '@/knowledgebase/sidebar/components/TopicRowActions';
import { useKnowledgeBaseRoute } from '@/knowledgebase/sidebar/hooks/useKnowledgeBaseRoute';
import { usePrefetchTopic } from '@/knowledgebase/sidebar/hooks/usePrefetchTopic';
import { useTopicOpenState } from '@/knowledgebase/sidebar/hooks/useTopicOpenState';
import {
  groupCategoriesByParent,
  ROOT_CATEGORY_KEY,
} from '@/knowledgebase/sidebar/utils/groupCategoriesByParent';
import { ICategoryFields, ITopic } from '@/knowledgebase/types';

export const TopicTreeItem = ({
  topic,
  onAddCategory,
  onEditCategory,
}: {
  topic: ITopic;
  onAddCategory: (topicId: string) => void;
  onEditCategory: (topicId: string, category: ICategoryFields) => void;
}) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const { topicId, section, categoryId } = useKnowledgeBaseRoute();
  const { isOpen, setOpen } = useTopicOpenState(topic._id);
  const prefetchTopic = usePrefetchTopic();
  const [isNavigating, startNavigation] = useTransition();

  const categoryGroups = useMemo(
    () => groupCategoriesByParent(topic.categories?.filter(isDefined) ?? []),
    [topic.categories],
  );
  const rootCategories = categoryGroups.get(ROOT_CATEGORY_KEY) ?? [];

  const isCurrent = topicId === topic._id;
  const isShowingAll = isCurrent && section === 'articles' && !categoryId;
  const isActive = isCurrent || isNavigating;
  const contentId = `kb-topic-${topic._id}`;

  const handleOpenChange = (open: boolean) => {
    if (isShowingAll) {
      setOpen(open);
      return;
    }

    setOpen(true);
    startNavigation(() => {
      navigate(`${KNOWLEDGE_BASE_PATH}/${topic._id}/articles`);
    });
  };

  const handlePrefetch = () => {
    if (!isCurrent) {
      prefetchTopic(topic._id);
    }
  };

  return (
    <Sidebar.MenuItem>
      <div className="relative group/kb-row">
        <Sidebar.MenuButton
          isActive={isActive}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => handleOpenChange(!isOpen)}
          onPointerEnter={handlePrefetch}
          onFocus={handlePrefetch}
          className="pr-8 font-normal rounded-sm data-[active=true]:font-medium"
        >
          <span>{topic.title || t('unnamed-topic', 'Unnamed topic')}</span>
        </Sidebar.MenuButton>

        <TopicRowActions
          topic={topic}
          onAddCategory={() => onAddCategory(topic._id)}
        />
      </div>

      <KbDisclosure id={contentId} open={isOpen}>
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
                className="font-normal rounded-sm text-muted-foreground hover:text-foreground"
              >
                <button type="button" onClick={() => onAddCategory(topic._id)}>
                  <IconPlus />
                  <span>{t('kb-add-category', 'Add category')}</span>
                </button>
              </Sidebar.SubButton>
            </Sidebar.SubItem>
          )}
        </Sidebar.Sub>
      </KbDisclosure>
    </Sidebar.MenuItem>
  );
};
