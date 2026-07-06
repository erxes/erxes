import { gql, useQuery } from '@apollo/client';
import { Badge, Button, Checkbox, Command, cn, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { AutomationAiKnowledgeSourceSelectorProps } from 'ui-modules';

const FRONTLINE_AI_KNOWLEDGE_ARTICLES = gql`
  query frontlineAiKnowledgeArticles(
    $searchValue: String
    $page: Int
    $perPage: Int
    $status: String
  ) {
    knowledgeBaseArticles(
      searchValue: $searchValue
      page: $page
      perPage: $perPage
      status: $status
      sortField: "modifiedDate"
      sortDirection: -1
    ) {
      _id
      code
      title
      summary
      status
    }
  }
`;

type TKnowledgeBaseArticleOption = {
  _id: string;
  code?: string;
  title?: string;
  summary?: string;
  status?: string;
};

type TFrontlineAiKnowledgeArticlesResponse = {
  knowledgeBaseArticles?: TKnowledgeBaseArticleOption[];
};

export const KnowledgebaseArticleSelector = ({
  value,
  onChange,
  statuses = [],
}: AutomationAiKnowledgeSourceSelectorProps) => {
  const { t } = useTranslation('automations');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 300);
  const { data, loading, error } =
    useQuery<TFrontlineAiKnowledgeArticlesResponse>(
      FRONTLINE_AI_KNOWLEDGE_ARTICLES,
      {
        variables: {
          searchValue: debouncedSearchValue || undefined,
          page: 1,
          perPage: 100,
          status: 'publish',
        },
      },
    );
  const articles = data?.knowledgeBaseArticles || [];
  const statusesByArticleId = new Map(
    statuses.map((status) => [status.sourceId, status]),
  );
  const selectedStatuses = statuses.filter((status) =>
    value.includes(status.sourceId),
  );
  const indexedCount = selectedStatuses.filter(
    (status) => status.status === 'indexed',
  ).length;
  const indexingCount = selectedStatuses.filter(
    (status) => status.status === 'indexing' || status.status === 'queued',
  ).length;

  const toggleArticle = (articleId: string) => {
    onChange(
      value.includes(articleId)
        ? value.filter((selectedId) => selectedId !== articleId)
        : [...value, articleId],
    );
  };

  const visibleIds = articles.map((article) => article._id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => value.includes(id));

  const toggleSelectAllVisible = () => {
    onChange(
      allVisibleSelected
        ? value.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...value, ...visibleIds])),
    );
  };

  return (
    <Command shouldFilter={false} className="rounded-md border">
      <Command.Input
        value={searchValue}
        onValueChange={setSearchValue}
        placeholder={t('search-knowledge-articles')}
        variant="secondary"
      />
      <div className="flex items-center justify-between gap-2 border-b px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {t('knowledge-articles-selected', { count: value.length })}
        </span>
        <Button
          type="button"
          variant="ghost"
          className="h-6 px-2 text-xs"
          disabled={loading || articles.length === 0}
          onClick={toggleSelectAllVisible}
        >
          {allVisibleSelected
            ? t('knowledge-clear-selection')
            : t('knowledge-select-all')}
        </Button>
      </div>
      <Command.List className="max-h-72 space-y-1.5 overflow-y-auto p-1.5">
        {loading && (
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        )}

        {!loading && error && (
          <Command.Empty>{t('knowledge-articles-load-error')}</Command.Empty>
        )}

        {!loading && !error && articles.length === 0 && (
          <Command.Empty>{t('no-knowledge-articles')}</Command.Empty>
        )}

        {!loading &&
          articles.map((article) => {
            const isSelected = value.includes(article._id);
            const status = statusesByArticleId.get(article._id);

            return (
              <Command.Item
                key={article._id}
                value={article._id}
                onSelect={() => toggleArticle(article._id)}
                className={cn(
                  'flex h-auto min-h-12 items-start gap-3 rounded-md px-3 py-2.5',
                  isSelected && 'bg-accent',
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleArticle(article._id)}
                  onClick={(event) => event.stopPropagation()}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="truncate text-sm font-medium">
                        {article.title || t('untitled-knowledge-article')}
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
                      {t('knowledge-indexed-chunks', {
                        count: status.chunkCount || 0,
                      })}
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
      {value.length > 0 && (
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          {t('knowledge-articles-index-summary', {
            indexed: indexedCount,
            indexing: indexingCount,
          })}
        </div>
      )}
    </Command>
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
