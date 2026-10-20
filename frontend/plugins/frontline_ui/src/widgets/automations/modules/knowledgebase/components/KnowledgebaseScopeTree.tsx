import { Checkbox, Spinner, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TKnowledgeCategoryNode,
  useKnowledgeTopicTree,
} from '../hooks/useKnowledgeTopicTree';

type TScopeTreeSelection = {
  topicIds: string[];
  categoryIds: string[];
  onToggleTopic: (topicId: string) => void;
  onToggleCategory: (categoryId: string) => void;
};

const ScopeRow = ({
  label,
  checked,
  covered,
  depth,
  onToggle,
}: {
  label: string;
  checked: boolean;
  covered: boolean;
  depth: number;
  onToggle: () => void;
}) => (
  <label
    className={cn(
      'flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent',
      covered && 'cursor-default text-muted-foreground hover:bg-transparent',
    )}
    style={{ paddingLeft: 8 + depth * 16 }}
  >
    <Checkbox
      checked={checked || covered}
      disabled={covered}
      onCheckedChange={onToggle}
    />
    <span className="truncate">{label}</span>
  </label>
);

const CategoryRows = ({
  categories,
  depth,
  covered,
  selection,
}: {
  categories: TKnowledgeCategoryNode[];
  depth: number;
  covered: boolean;
  selection: TScopeTreeSelection;
}) => (
  <>
    {categories.map((category) => {
      const checked = selection.categoryIds.includes(category._id);

      return (
        <div key={category._id}>
          <ScopeRow
            label={category.title}
            checked={checked}
            covered={covered}
            depth={depth}
            onToggle={() => selection.onToggleCategory(category._id)}
          />
          <CategoryRows
            categories={category.children}
            depth={depth + 1}
            covered={covered || checked}
            selection={selection}
          />
        </div>
      );
    })}
  </>
);

// A checked topic or category covers everything beneath it, including what is
// filed there later, so the rows under it are shown as included.
export const KnowledgebaseScopeTree = (selection: TScopeTreeSelection) => {
  const { t } = useTranslation('automations');
  const { topics, loading, error } = useKnowledgeTopicTree();

  return (
    <div className="rounded-md border">
      <div className="border-b px-3 py-1.5 text-xs font-medium text-muted-foreground">
        {t('knowledge-topics-and-categories', 'Topics and categories')}
      </div>
      <div className="max-h-56 overflow-y-auto p-1.5">
        {loading && (
          <div className="flex justify-center p-3">
            <Spinner />
          </div>
        )}
        {!loading && error && (
          <p className="p-2 text-xs text-destructive">
            {t(
              'knowledge-topics-load-error',
              'Knowledge base topics could not be loaded.',
            )}
          </p>
        )}
        {!loading && !error && topics.length === 0 && (
          <p className="p-2 text-xs text-muted-foreground">
            {t('no-knowledge-topics', 'No knowledge base topics found.')}
          </p>
        )}
        {!loading &&
          topics.map((topic) => {
            const checked = selection.topicIds.includes(topic._id);

            return (
              <div key={topic._id}>
                <ScopeRow
                  label={topic.title}
                  checked={checked}
                  covered={false}
                  depth={0}
                  onToggle={() => selection.onToggleTopic(topic._id)}
                />
                <CategoryRows
                  categories={topic.categories}
                  depth={1}
                  covered={checked}
                  selection={selection}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};
