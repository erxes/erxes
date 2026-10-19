import { useQuery } from '@apollo/client';
import {
  Badge,
  Button,
  Checkbox,
  Command,
  cn,
  isDefined,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { AutomationAiKnowledgeSourceSelectorProps } from 'ui-modules';
import { FRONTLINE_AI_KNOWLEDGE_ARTICLES } from '../graphql/queries';
import { useKnowledgeScopeSelection } from '../hooks/useKnowledgeScopeSelection';
import { KnowledgebaseScopeTree } from './KnowledgebaseScopeTree';

export const KnowledgebaseArticleSelector = ({
  value,
  config,
  onChange,
  statuses = [],
}: AutomationAiKnowledgeSourceSelectorProps) => {
  const { t } = useTranslation('automations');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 300);
  const scope = useKnowledgeScopeSelection({ value, config, onChange });
  const selectedArticleIds = scope.articleIds;
  const { data, loading, error } = useQuery(FRONTLINE_AI_KNOWLEDGE_ARTICLES, {
    variables: {
      searchValue: debouncedSearchValue || undefined,
      page: 1,
      perPage: 100,
      status: 'publish',
    },
  });
  const articles = data?.knowledgeBaseArticles?.filter(isDefined) ?? [];
  const statusesByArticleId = new Map(
    statuses.map((status) => [status.sourceId, status]),
  );
  const selectedStatuses = statuses.filter((status) =>
    scope.hasRules
      ? !status.sourceId.startsWith('__scope_run__:')
      : selectedArticleIds.includes(status.sourceId),
  );
  const indexedCount = selectedStatuses.filter(
    (status) => status.status === 'indexed',
  ).length;
  const indexingCount = selectedStatuses.filter(
    (status) => status.status === 'indexing' || status.status === 'queued',
  ).length;

  const visibleIds = articles.map((article) => article._id);
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedArticleIds.includes(id));

  const toggleSelectAllVisible = () => {
    scope.setArticleIds(
      allVisibleSelected
        ? selectedArticleIds.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...selectedArticleIds, ...visibleIds])),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <KnowledgebaseScopeTree
        topicIds={scope.topicIds}
        categoryIds={scope.categoryIds}
        onToggleTopic={scope.toggleTopic}
        onToggleCategory={scope.toggleCategory}
      />
      <Command shouldFilter={false} className="rounded-md border">
        <Command.Input
          value={searchValue}
          onValueChange={setSearchValue}
          placeholder={t(
            'search-knowledge-articles',
            'Search knowledge base articles...',
          )}
          variant="secondary"
        />
        <div className="flex items-center justify-between gap-2 border-b px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {t('knowledge-articles-selected', '{{count}} articles selected', {
              count: selectedArticleIds.length,
            })}
          </span>
          <Button
            type="button"
            variant="ghost"
            className="h-6 px-2 text-xs"
            disabled={loading || articles.length === 0}
            onClick={toggleSelectAllVisible}
          >
            {allVisibleSelected
              ? t('knowledge-clear-selection', 'Deselect all')
              : t('knowledge-select-all', 'Select all')}
          </Button>
        </div>
        <Command.List className="max-h-72 space-y-1.5 overflow-y-auto p-1.5">
          {loading && (
            <div className="flex justify-center p-4">
              <Spinner />
            </div>
          )}

          {!loading && error && (
            <Command.Empty>
              {t(
                'knowledge-articles-load-error',
                'Knowledge base articles could not be loaded.',
              )}
            </Command.Empty>
          )}

          {!loading && !error && articles.length === 0 && (
            <Command.Empty>
              {t(
                'no-knowledge-articles',
                'No published knowledge base articles found.',
              )}
            </Command.Empty>
          )}

          {!loading &&
            articles.map((article) => {
              const isSelected = selectedArticleIds.includes(article._id);
              const status = statusesByArticleId.get(article._id);

              return (
                <Command.Item
                  key={article._id}
                  value={article._id}
                  onSelect={() => scope.toggleArticle(article._id)}
                  className={cn(
                    'flex h-auto min-h-12 items-start gap-3 rounded-md px-3 py-2.5',
                    isSelected && 'bg-accent',
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => scope.toggleArticle(article._id)}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <p className="truncate text-sm font-medium">
                          {article.title ||
                            t(
                              'untitled-knowledge-article',
                              'Untitled knowledge base article',
                            )}
                        </p>
                        {article.code && (
                          <span className="shrink-0 rounded bg-muted px-1 font-mono text-[10px] leading-4 text-muted-foreground">
                            {article.code}
                          </span>
                        )}
                      </div>
                      {status && (
                        <Badge
                          variant={getStatusVariant(status.status)}
                          className="shrink-0"
                        >
                          {t(`knowledge-index-status-${status.status}`)}
                        </Badge>
                      )}
                    </div>
                    {article.summary && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {article.summary}
                      </p>
                    )}
                    {status?.status === 'indexed' && (
                      <p className="text-xs text-muted-foreground">
                        {t(
                          'knowledge-indexed-chunks',
                          '{{count}} chunks indexed',
                          {
                            count: status.chunkCount || 0,
                          },
                        )}
                      </p>
                    )}
                    {(status?.status === 'failed' ||
                      status?.status === 'skipped') &&
                      status.indexError && (
                        <p className="text-xs text-destructive">
                          {status.indexError}
                        </p>
                      )}
                  </div>
                </Command.Item>
              );
            })}
        </Command.List>
        {(scope.hasRules || selectedArticleIds.length > 0) && (
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            {t(
              'knowledge-articles-index-summary',
              '{{indexed}} indexed · {{indexing}} indexing',
              {
                indexed: indexedCount,
                indexing: indexingCount,
              },
            )}
          </div>
        )}
      </Command>
    </div>
  );
};

const getStatusVariant = (
  status: NonNullable<
    AutomationAiKnowledgeSourceSelectorProps['statuses']
  >[number]['status'],
) => {
  if (status === 'indexed') {
    return 'success' as const;
  }

  if (status === 'indexing' || status === 'queued') {
    return 'warning' as const;
  }

  if (status === 'failed') {
    return 'destructive' as const;
  }

  return 'secondary' as const;
};
