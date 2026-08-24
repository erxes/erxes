import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopicWithArticles } from '@/modules/knowledge-base/api';
import { ArticleView } from '@/modules/knowledge-base/components/ArticleView';
import { CategorySidebar } from '@/modules/knowledge-base/components/CategorySidebar';
import {
  findArticle,
  findCategory,
  findSectionOf,
  sortByRecency,
} from '@/modules/knowledge-base/selectors';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/Hero';
import { Breadcrumbs, type Crumb } from '@/modules/ui/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/Button';
import { Card } from '@/modules/ui/Card';
import { Icon } from '@/modules/ui/Icon';
import { LoadError, SetupNotice } from '@/modules/ui/PortalState';

type Props = { params: Promise<{ articleId: string }> };

export const generateMetadata = async ({ params }: Props) => {
  const { articleId } = await params;
  const topic = await getTopicWithArticles();
  const article =
    topic.state === 'ready' ? findArticle(topic.data, articleId) : null;

  return { title: article?.title ?? 'Нийтлэл' };
};

export default async function ArticlePage({ params }: Props) {
  const [{ headline }, { articleId }, topic] = await Promise.all([
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

  const article = findArticle(topic.data, articleId);

  if (!article) {
    notFound();
  }

  const category = findCategory(topic.data, article.categoryId);
  const section = findSectionOf(topic.data, article.categoryId);
  const related = category
    ? sortByRecency(category.articles).filter((item) => item._id !== article._id)
    : [];

  const crumbs: Crumb[] = [
    { label: 'Мэдлэгийн сан', href: '/knowledge-base' },
    ...(section && section._id !== category?._id
      ? [{ label: section.title, href: `/knowledge-base#section-${section._id}` }]
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
    <>
      <Hero headline={headline} />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <div className="mt-7 grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside>
            <CategorySidebar
              topic={topic.data}
              activeCategoryId={article.categoryId}
            />
          </aside>

          <div>
            <ArticleView article={article} />

            {related.length ? (
              <Card className="mt-6 p-6">
                <h2 className="text-base font-semibold text-ink">
                  Холбоотой нийтлэлүүд
                </h2>
                <ul className="mt-4 space-y-2">
                  {related.map((item) => (
                    <li key={item._id}>
                      <Link
                        href={`/knowledge-base/article/${item._id}`}
                        className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-ink-soft transition-colors hover:bg-subtle hover:text-brand"
                      >
                        <Icon name="article" size={16} />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <h2 className="text-base font-semibold text-ink">
                  Хариултаа олсонгүй юу?
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  Дэмжлэгийн багт хүсэлт үүсгэвэл хариу өгнө.
                </p>
              </div>
              <ButtonLink href="/tickets/new" size="sm">
                Хүсэлт илгээх
              </ButtonLink>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
