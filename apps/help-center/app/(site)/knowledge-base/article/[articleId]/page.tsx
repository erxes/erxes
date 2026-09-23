import { notFound } from 'next/navigation';
import { getTopicWithArticles } from '@/modules/knowledge-base/api';
import { ArticleAside } from '@/modules/knowledge-base/components/ArticleAside';
import { ArticleView } from '@/modules/knowledge-base/components/ArticleView';
import {
  findArticle,
  findCategory,
  findSectionOf,
  sortByRecency,
} from '@/modules/knowledge-base/utils/selectors';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { type Crumb } from '@/modules/ui/components/Breadcrumbs';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

const RELATED_COUNT = 6;

type Props = { params: Promise<{ articleId: string }> };

export const generateMetadata = async ({ params }: Props) => {
  const { articleId } = await params;
  const topic = await getTopicWithArticles();
  const article =
    topic.state === 'ready' ? findArticle(topic.data, articleId) : null;

  return { title: article?.title ?? 'Article' };
};

export default async function ArticlePage({ params }: Props) {
  const [{ articleId }, topic] = await Promise.all([
    params,
    getTopicWithArticles(),
  ]);

  if (topic.state !== 'ready') {
    return (
      <PortalShell>
        {topic.state === 'unconfigured' ? (
          <SetupNotice missing={topic.missing} />
        ) : topic.state === 'unpublished' ? (
          <Unpublished domain={topic.domain} />
        ) : (
          <LoadError message={topic.message} />
        )}
      </PortalShell>
    );
  }

  if (!topic.data.knowledgeBaseEnabled) {
    notFound();
  }

  const article = findArticle(topic.data, articleId);

  if (!article) {
    notFound();
  }

  const category = findCategory(topic.data, article.categoryId);
  const section = findSectionOf(topic.data, article.categoryId);
  const related = category
    ? sortByRecency(category.articles).filter(
        (item) => item._id !== article._id,
      )
    : [];

  const crumbs: Crumb[] = [
    { label: 'Knowledge base', href: '/knowledge-base' },
    ...(section && section._id !== category?._id
      ? [
          {
            label: section.title,
            href: `/knowledge-base#section-${section._id}`,
          },
        ]
      : []),
    ...(category
      ? [
          {
            label: category.title,
            href: `/knowledge-base/category/${category._id}`,
          },
        ]
      : []),
    { label: article.title },
  ];

  return (
    <PortalShell
      breadcrumbs={crumbs}
      title={article.title}
      description={article.summary || undefined}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_288px] lg:gap-8">
        <div className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-500">
          <ArticleView article={article} />
        </div>

        <ArticleAside
          categoryTitle={category?.title ?? 'this category'}
          categoryHref={
            category
              ? `/knowledge-base/category/${category._id}`
              : '/knowledge-base'
          }
          related={related.slice(0, RELATED_COUNT)}
        />
      </div>
    </PortalShell>
  );
}
