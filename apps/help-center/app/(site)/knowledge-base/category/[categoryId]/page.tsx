import { notFound } from 'next/navigation';
import {
  getTopicArticleList,
  getTopicWithArticles,
} from '@/modules/knowledge-base/api';
import { ArticleListItem } from '@/modules/knowledge-base/components/ArticleListItem';
import {
  findCategory,
  findSectionOf,
  sortByRecency,
} from '@/modules/knowledge-base/utils/selectors';
import { knowledgeBaseName } from '@/modules/knowledge-base/utils/label';
import { getT } from '@/modules/i18n/server';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { type Crumb } from '@/modules/ui/components/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { IconOrb } from '@/modules/ui/components/IconOrb';
import { CountBadge } from '@/modules/ui/components/PageHeader';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

type Props = { params: Promise<{ categoryId: string }> };

export const generateMetadata = async ({ params }: Props) => {
  const { categoryId } = await params;
  const [topic, t] = await Promise.all([getTopicArticleList(), getT()]);
  const category =
    topic.state === 'ready' ? findCategory(topic.data, categoryId) : null;

  return { title: category?.title ?? t('kb.category') };
};

export default async function CategoryPage({ params }: Props) {
  void getTopicWithArticles();

  const [{ categoryId }, topic, t] = await Promise.all([
    params,
    getTopicArticleList(),
    getT(),
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

  const category = findCategory(topic.data, categoryId);

  if (!category) {
    notFound();
  }

  const section = findSectionOf(topic.data, categoryId);
  const articles = sortByRecency(category.articles);

  const crumbs: Crumb[] = [
    {
      label: knowledgeBaseName(topic.data.knowledgeBaseLabel, t).title,
      href: '/knowledge-base',
    },
    ...(section && section._id !== category._id
      ? [
          {
            label: section.title,
            href: `/knowledge-base#section-${section._id}`,
          },
        ]
      : []),
    { label: category.title },
  ];

  return (
    <PortalShell
      breadcrumbs={crumbs}
      title={category.title}
      description={category.description || undefined}
      meta={
        <CountBadge
          count={category.articleCount}
          label={t('kb.articlesLabel', { count: category.articleCount })}
        />
      }
    >
      <div className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-500">
        {articles.length ? (
          <>
            <Card className="p-2">
              <ul className="divide-y divide-line-soft">
                {articles.map((article, index) => (
                  <ArticleListItem
                    key={article._id}
                    article={article}
                    index={index}
                  />
                ))}
              </ul>
            </Card>

            <Card className="mt-5 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-center gap-3.5">
                <IconOrb name="smile" size="sm" />
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold text-ink">
                    {t('kb.notFoundAnswer')}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    {t('kb.stuckText')}
                  </p>
                </div>
              </div>
              <ButtonLink href="/tickets/new" size="sm">
                {t('tickets.submit')}
              </ButtonLink>
            </Card>
          </>
        ) : (
          <EmptyState
            icon="article"
            title={t('kb.noArticles')}
            description={t('kb.noArticlesText')}
            action={
              <ButtonLink href="/tickets/new" size="sm">
                {t('tickets.create')}
              </ButtonLink>
            }
          />
        )}
      </div>
    </PortalShell>
  );
}
