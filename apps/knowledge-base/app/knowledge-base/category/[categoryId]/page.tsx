import { notFound } from 'next/navigation';
import { getTopicWithArticles } from '@/modules/knowledge-base/api';
import { ArticleListItem } from '@/modules/knowledge-base/components/ArticleListItem';
import { CategorySidebar } from '@/modules/knowledge-base/components/CategorySidebar';
import {
  findCategory,
  findSectionOf,
  sortByRecency,
} from '@/modules/knowledge-base/selectors';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/Hero';
import { Breadcrumbs, type Crumb } from '@/modules/ui/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/Button';
import { Card } from '@/modules/ui/Card';
import { EmptyState } from '@/modules/ui/EmptyState';
import { Icon } from '@/modules/ui/Icon';
import { LoadError, SetupNotice } from '@/modules/ui/PortalState';

type Props = { params: Promise<{ categoryId: string }> };

export const generateMetadata = async ({ params }: Props) => {
  const { categoryId } = await params;
  const topic = await getTopicWithArticles();
  const category =
    topic.state === 'ready' ? findCategory(topic.data, categoryId) : null;

  return { title: category?.title ?? 'Ангилал' };
};

export default async function CategoryPage({ params }: Props) {
  const [{ headline }, { categoryId }, topic] = await Promise.all([
    getPortalIdentity(),
    params,
    getTopicWithArticles(),
  ]);

  if (topic.state !== 'ready') {
    return (
      <>
        <Hero headline={headline} />
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
          {topic.state === 'unconfigured' ? (
            <SetupNotice missing={topic.missing} />
          ) : (
            <LoadError message={topic.message} />
          )}
        </div>
      </>
    );
  }

  const category = findCategory(topic.data, categoryId);

  if (!category) {
    notFound();
  }

  const section = findSectionOf(topic.data, categoryId);
  const articles = sortByRecency(category.articles);

  const crumbs: Crumb[] = [
    { label: 'Мэдлэгийн сан', href: '/knowledge-base' },
    ...(section && section._id !== category._id
      ? [{ label: section.title, href: `/knowledge-base#section-${section._id}` }]
      : []),
    { label: category.title },
  ];

  return (
    <>
      <Hero headline={headline} />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <div className="mt-7 grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside>
            <CategorySidebar topic={topic.data} activeCategoryId={category._id} />
          </aside>

          <div>
            <Card className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-soft">
                  <Icon name={category.icon} size={22} />
                </span>
                <div>
                  <h1 className="text-2xl font-semibold text-ink">
                    {category.title}
                  </h1>
                  {category.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {category.description}
                    </p>
                  ) : null}
                  <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
                    <span className="flex items-center gap-1.5">
                      <Icon name="article" size={15} />
                      {category.articleCount} articles
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="users" size={15} />
                      {category.authorCount} authors
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-6">
              {articles.length ? (
                <Card className="p-2">
                  <ul className="divide-y divide-line">
                    {articles.map((article) => (
                      <ArticleListItem key={article._id} article={article} />
                    ))}
                  </ul>
                </Card>
              ) : (
                <EmptyState
                  icon="article"
                  title="Нийтлэл байхгүй байна"
                  description="Энэ ангилалд нийтлэгдсэн нийтлэл алга. Хайж буй мэдээллээ олохгүй бол хүсэлт үүсгэнэ үү."
                  action={
                    <ButtonLink href="/tickets/new" size="sm">
                      Хүсэлт үүсгэх
                    </ButtonLink>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
