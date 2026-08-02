import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Article, useArticles } from '../hooks/useArticles';
import { useMutation } from '@apollo/client';
import { REMOVE_ARTICLE } from '../graphql/mutations';
import {
  IconFileText,
  IconUser,
  IconCalendar,
  IconEye,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

interface ArticleListProps {
  readonly onEditArticle: (article: Article | null) => void;
  readonly onCreateArticle: () => void;
}

const ArticleTitleHeader = () => {
  const { t } = useTranslation('frontline');
  return <RecordTable.InlineHead icon={IconFileText} label={t('col-name')} />;
};

const ArticleTitleCell = ({
  article,
  onEditArticle,
}: {
  article: Article;
  onEditArticle: (article: Article) => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Button
      variant="ghost"
      className="h-auto w-full justify-start p-1 font-semibold"
      onClick={() => onEditArticle(article)}
    >
      {article.title || t('kb-untitled')}
    </Button>
  );
};

const ArticleStatusHeader = () => {
  const { t } = useTranslation('frontline');
  return <RecordTable.InlineHead icon={IconEye} label={t('status')} />;
};

const ArticleStatusCell = ({ article }: { article: Article }) => {
  const status = String(article.status || 'unknown').toLowerCase();
  const isPublished = status.includes('publish');
  const isDraft = status.includes('draft');
  const isArchived = status.includes('archived');

  let statusColor = 'text-muted-foreground';
  let bgColor = 'bg-muted';

  if (isPublished) {
    statusColor = 'text-success';
    bgColor = 'bg-success/10';
  } else if (isDraft) {
    statusColor = 'text-info';
    bgColor = 'bg-info/10';
  } else if (isArchived) {
    statusColor = 'text-destructive';
    bgColor = 'bg-destructive/10';
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex rounded-full border px-2 py-0.5 text-xs ml-2 ${bgColor} ${statusColor}`}
      >
        {article.status || 'unknown'}
      </span>
    </div>
  );
};

const ArticleOwnerHeader = () => {
  const { t } = useTranslation('frontline');
  return <RecordTable.InlineHead icon={IconUser} label={t('kb-owner')} />;
};

const ArticleCreatedHeader = () => {
  const { t } = useTranslation('frontline');
  return <RecordTable.InlineHead icon={IconCalendar} label={t('kb-created')} />;
};

const ArticleCreatedDateCell = ({ article }: { article: Article }) => {
  const { t } = useTranslation('frontline');

  if (!article.createdDate) {
    return <div className="opacity-80 ml-2">-</div>;
  }

  const date = new Date(article.createdDate);
  if (Number.isNaN(date.getTime())) {
    return <div className="opacity-80 ml-2">{t('kb-invalid-date')}</div>;
  }

  return (
    <div className="opacity-80 ml-2">
      {date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}
    </div>
  );
};

const getArticleColumns = (
  onEditArticle: (article: Article) => void,
): ColumnDef<Article>[] => [
  RecordTable.checkboxColumn as ColumnDef<Article>,
  {
    id: 'title',
    accessorKey: 'title',
    size: 220,
    header: ArticleTitleHeader,
    cell: ({ row }) => (
      <ArticleTitleCell article={row.original} onEditArticle={onEditArticle} />
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    size: 220,
    header: ArticleStatusHeader,
    cell: ({ row }) => <ArticleStatusCell article={row.original} />,
  },
  {
    id: 'createdUser',
    accessorKey: 'createdUser',
    size: 220,
    header: ArticleOwnerHeader,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 opacity-80 ml-2">
        {row.original.createdUser?.username || '-'}
      </div>
    ),
  },
  {
    id: 'createdDate',
    accessorKey: 'createdDate',
    size: 180,
    header: ArticleCreatedHeader,
    cell: ({ row }) => <ArticleCreatedDateCell article={row.original} />,
  },
];

const ArticleCommandBar = ({
  onEditArticle,
  refetch,
}: {
  onEditArticle: (article: Article) => void;
  refetch: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const [removeArticle] = useMutation(REMOVE_ARTICLE);
  const { table } = RecordTable.useRecordTable();
  const selectedArticles = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original as Article);
  const articleIds = selectedArticles.map((article) => article._id);

  const handleEdit = () => {
    if (selectedArticles.length === 1) {
      onEditArticle(selectedArticles[0]);
    }
  };

  const handleDelete = async () => {
    if (articleIds.length === 0) {
      return;
    }

    try {
      await confirm({
        message: t('kb-confirm-delete-articles', {
          count: articleIds.length,
        }),
        options: {
          confirmationValue: 'delete',
          description: t('kb-action-permanent'),
        },
      });
      await Promise.all(
        articleIds.map((id) => removeArticle({ variables: { _id: id } })),
      );
      refetch();
    } catch {
      return;
    }
  };

  return (
    <CommandBar open={selectedArticles.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', { count: selectedArticles.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleEdit}
          disabled={selectedArticles.length !== 1}
        >
          {t('edit')}
        </Button>
        <Separator.Inline />
        <Button
          variant="secondary"
          size="sm"
          className="text-destructive"
          onClick={handleDelete}
        >
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};

export function ArticleList({
  onEditArticle,
  onCreateArticle,
}: ArticleListProps) {
  const { t } = useTranslation('frontline');
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') || '';

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const { articles, loading, refetch } = useArticles({
    categoryIds: [categoryId],
  });
  const articleList = useMemo(() => articles ?? [], [articles]);
  const articleColumns = useMemo(
    () => getArticleColumns(onEditArticle),
    [onEditArticle],
  );

  // Filter + search
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return articleList.filter((a) => {
      const title = String(a?.title || '').toLowerCase();
      const summary = String(a?.summary || '').toLowerCase();
      const textOk = query ? `${title} ${summary}`.includes(query) : true;

      const st = String(a?.status || '').toLowerCase();
      const statusOk =
        status === 'all'
          ? true
          : status === 'draft'
            ? st.includes('draft')
            : status === 'published'
              ? st.includes('publish')
              : status === 'archived'
                ? st.includes('archived')
                : true;

      return textOk && statusOk;
    });
  }, [articleList, q, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-[320px] flex-1 items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            placeholder={t('filter')}
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`h-10 rounded-lg border px-4 text-sm ${
              status === 'all' ? 'font-semibold' : 'opacity-70'
            }`}
            onClick={() => setStatus('all')}
          >
            {t('kb-all')}
          </button>
          <button
            type="button"
            className={`h-10 rounded-lg border px-4 text-sm ${
              status === 'draft' ? 'font-semibold' : 'opacity-70'
            }`}
            onClick={() => setStatus('draft')}
          >
            {t('kb-draft')}
          </button>
          <button
            type="button"
            className={`h-10 rounded-lg border px-4 text-sm ${
              status === 'published' ? 'font-semibold' : 'opacity-70'
            }`}
            onClick={() => setStatus('published')}
          >
            {t('kb-published')}
          </button>
          <button
            type="button"
            className={`h-10 rounded-lg border px-4 text-sm ${
              status === 'archived' ? 'font-semibold' : 'opacity-70'
            }`}
            onClick={() => setStatus('archived')}
          >
            {t('archived')}
          </button>

          <div className="ml-1 rounded-lg border px-3 py-2 text-sm opacity-70">
            {t('kb-article-count', { count: filtered.length })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-3 py-14 text-center">
          <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
            <IconFileText className="w-8 h-8 text-accent-foreground" />
          </div>
          <div className="text-base font-semibold mb-2">
            {q.trim()
              ? t('kb-no-results-for', { query: q })
              : t('kb-no-articles')}
          </div>
          <div className="mt-1 text-sm opacity-70 mb-4">
            {q.trim() ? t('kb-adjust-search') : t('kb-create-first-article')}
          </div>
          {!q.trim() && (
            <Button onClick={onCreateArticle}>{t('create')}</Button>
          )}
        </div>
      ) : (
        <RecordTable.Provider
          columns={articleColumns}
          data={filtered}
          stickyColumns={['checkbox']}
          tableId="frontline_knowledgebase_articles_record_table"
        >
          <ArticleCommandBar onEditArticle={onEditArticle} refetch={refetch} />
          <RecordTable>
            <RecordTable.Header showColumnSelector />
            <RecordTable.Body>
              {loading ? (
                <RecordTable.RowSkeleton rows={10} />
              ) : (
                <RecordTable.RowList />
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Provider>
      )}
    </div>
  );
}
