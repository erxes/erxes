import { useQuery } from '@apollo/client';
import {
  IconArrowLeft,
  IconBook,
  IconChevronRight,
  IconSearch,
  IconX,
  type Icon,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import { cn, Empty, Skeleton } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WIDGETS_KNOWLEDGE_BASE_TOPIC } from './graphql';
import { categoryIcon } from './icons';
import {
  articleCount,
  childCategories,
  findArticle,
  postToHost,
  rootCategories,
  searchArticles,
  TKbArticle,
  TKbCategory,
  TKbTopic,
} from './utils';

type TView =
  | { type: 'category'; id: string }
  | { type: 'article'; id: string };

const ARTICLE_BODY_CLASS = cn(
  'text-sm leading-relaxed text-foreground',
  '[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-bold',
  '[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold',
  '[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-semibold',
  '[&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1',
  '[&_a]:text-primary [&_a]:underline [&_strong]:font-semibold',
  '[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg',
  '[&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-xs',
  '[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3',
);

const formatDate = (value?: string | null) => {
  if (!value) {
    return '';
  }

  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch {
    return '';
  }
};

const countLabel = (count: number) =>
  count === 1 ? '1 article' : `${count} articles`;

const Row = ({
  title,
  description,
  meta,
  icon: RowIcon,
  onClick,
}: {
  title: string;
  description?: string | null;
  meta?: string;
  icon?: Icon;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full items-center gap-3 rounded-xl bg-background p-3 text-left shadow-xs transition-shadow duration-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
  >
    {RowIcon && (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <RowIcon size={18} />
      </span>
    )}
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-semibold text-foreground">
        {title}
      </span>
      {description && (
        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
          {description}
        </span>
      )}
      {meta && (
        <span className="mt-1 block text-[11px] font-medium text-muted-foreground">
          {meta}
        </span>
      )}
    </span>
    <IconChevronRight
      size={16}
      className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
    />
  </button>
);

const ArticleRows = ({
  articles,
  onOpen,
}: {
  articles: TKbArticle[];
  onOpen: (articleId: string) => void;
}) => (
  <div className="flex flex-col gap-2">
    {articles.map((article) => (
      <Row
        key={article._id}
        title={article.title}
        description={article.summary}
        onClick={() => onOpen(article._id)}
      />
    ))}
  </div>
);

const CategoryRows = ({
  categories,
  items,
  onOpen,
}: {
  categories: TKbCategory[];
  items: TKbCategory[];
  onOpen: (categoryId: string) => void;
}) => (
  <div className="flex flex-col gap-2">
    {items.map((category) => {
      const sections = childCategories(categories, category._id).length;
      const count = countLabel(articleCount(categories, category));

      return (
        <Row
          key={category._id}
          title={category.title}
          description={category.description}
          icon={categoryIcon(category.icon)}
          meta={sections ? `${count} · ${sections} sections` : count}
          onClick={() => onOpen(category._id)}
        />
      );
    })}
  </div>
);

const EmptyState = ({ title, text }: { title: string; text: string }) => (
  <Empty className="py-16 text-foreground">
    <Empty.Header>
      <Empty.Media>
        <IconBook />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      <Empty.Description>{text}</Empty.Description>
    </Empty.Header>
  </Empty>
);

const SectionLabel = ({ children }: { children: string }) => (
  <h2 className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground first:mt-0">
    {children}
  </h2>
);

export const KnowledgeBaseWidget = () => {
  const [params] = useSearchParams();
  const topicId = params.get('topicId') ?? '';
  const floating = params.get('mode') === 'floating';

  const { data, loading, error } = useQuery<{
    cpKnowledgeBaseTopicDetail: TKbTopic | null;
  }>(WIDGETS_KNOWLEDGE_BASE_TOPIC, {
    variables: { _id: topicId },
    skip: !topicId,
  });

  const topic = data?.cpKnowledgeBaseTopicDetail;
  const categories = useMemo(() => topic?.categories ?? [], [topic]);

  const [stack, setStack] = useState<TView[]>([]);
  const [term, setTerm] = useState('');

  const view = stack[stack.length - 1];
  const open = (next: TView) => setStack((current) => [...current, next]);
  const back = () => setStack((current) => current.slice(0, -1));

  useEffect(() => {
    if (topic) {
      postToHost({ type: 'ready', color: topic.color });
    }
  }, [topic]);

  const results = useMemo(
    () => searchArticles(categories, term),
    [categories, term],
  );

  const category =
    view?.type === 'category'
      ? categories.find((item) => item._id === view.id)
      : undefined;
  const article =
    view?.type === 'article' ? findArticle(categories, view.id) : undefined;

  const renderBody = () => {
    if (!topicId || error || (!loading && !topic)) {
      return (
        <EmptyState
          title="Knowledge base unavailable"
          text="This help content could not be loaded. Please try again later."
        />
      );
    }

    if (loading && !topic) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (article) {
      return (
        <article>
          <h1 className="text-xl font-bold leading-snug text-foreground">
            {article.title}
          </h1>
          {formatDate(article.modifiedDate || article.publishedAt) && (
            <p className="mt-1 text-xs text-muted-foreground">
              Updated {formatDate(article.modifiedDate || article.publishedAt)}
            </p>
          )}
          <div
            className={cn('mt-4', ARTICLE_BODY_CLASS)}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(article.content || ''),
            }}
          />
        </article>
      );
    }

    if (category) {
      const children = childCategories(categories, category._id);
      const articles = category.articles ?? [];

      if (!children.length && !articles.length) {
        return (
          <EmptyState
            title="No articles yet"
            text="This category does not have any published articles."
          />
        );
      }

      return (
        <>
          {children.length > 0 && (
            <>
              <SectionLabel>Sections</SectionLabel>
              <CategoryRows
                categories={categories}
                items={children}
                onOpen={(id) => open({ type: 'category', id })}
              />
            </>
          )}
          {articles.length > 0 && (
            <>
              <SectionLabel>Articles</SectionLabel>
              <ArticleRows
                articles={articles}
                onOpen={(id) => open({ type: 'article', id })}
              />
            </>
          )}
        </>
      );
    }

    if (term.trim()) {
      return results.length ? (
        <ArticleRows
          articles={results}
          onOpen={(id) => open({ type: 'article', id })}
        />
      ) : (
        <EmptyState
          title="No results"
          text={`Nothing matches "${term.trim()}". Try another word.`}
        />
      );
    }

    const roots = rootCategories(categories).filter(
      (item) => articleCount(categories, item) > 0,
    );

    return roots.length ? (
      <CategoryRows
        categories={categories}
        items={roots}
        onOpen={(id) => open({ type: 'category', id })}
      />
    ) : (
      <EmptyState
        title="No articles yet"
        text="Help articles will appear here once they are published."
      />
    );
  };

  const heading = article ? '' : category?.title || topic?.title || 'Help';

  return (
    <div className="flex h-dvh flex-col bg-sidebar">
      <header
        className="shrink-0 px-4 pb-4 pt-3 text-primary-foreground"
        style={{ backgroundColor: topic?.color || 'var(--primary)' }}
      >
        <div className="flex min-h-8 items-center gap-2">
          {view && (
            <button
              type="button"
              onClick={back}
              aria-label="Back"
              className="-ml-1 flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-white/15"
            >
              <IconArrowLeft size={18} />
            </button>
          )}
          <span className="min-w-0 flex-1 truncate text-base font-semibold">
            {heading}
          </span>
          {floating && (
            <button
              type="button"
              onClick={() => postToHost({ type: 'close' })}
              aria-label="Close"
              className="-mr-1 flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-white/15"
            >
              <IconX size={18} />
            </button>
          )}
        </div>

        {!view && topic?.description && (
          <p className="mt-1 line-clamp-2 text-xs text-primary-foreground/80">
            {topic.description}
          </p>
        )}

        {!view && (
          <label className="mt-3 flex items-center gap-2 rounded-xl bg-background px-3 py-2.5 text-foreground">
            <IconSearch size={16} className="shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search for help"
              aria-label="Search articles"
              className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </label>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4">{renderBody()}</main>
    </div>
  );
};
