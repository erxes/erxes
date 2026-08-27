import { notFound } from 'next/navigation';
import {
  getTopicArticleList,
  getTopicWithArticles,
} from '@/modules/knowledge-base/api';
import { ArticleListItem } from '@/modules/knowledge-base/components/ArticleListItem';
import { CategorySidebar } from '@/modules/knowledge-base/components/CategorySidebar';
import {
  findCategory,
  findSectionOf,
  sortByRecency,
} from '@/modules/knowledge-base/utils/selectors';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { Badge } from '@/modules/ui/components/Badge';
import { Breadcrumbs, type Crumb } from '@/modules/ui/components/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Icon } from '@/modules/ui/components/Icon';
import { LoadError, SetupNotice } from '@/modules/ui/components/PortalState';

type Props = { params: Promise<{ categoryId: string }> };

export const generateMetadata = async ({ params }: Props) => {
  const { categoryId } = await params;
  const topic = await getTopicArticleList();
  const category =
    topic.state === 'ready' ? findCategory(topic.data, categoryId) : null;

  return { title: category?.title ?? 'Ангилал' };
};

export default async function CategoryPage({ params }: Props) {
  /*
   * Article pages need the tree with bodies, which is the slow request. Start
   * it here without awaiting: the fetcher caches the promise, so opening an
   * article from this list reuses it instead of waiting on a fresh one.
   */
  void getTopicWithArticles();

  const [{ headline }, { categoryId }, topic] = await Promise.all([
    getPortalIdentity(),
    params,
    getTopicArticleList(),
  ]);

  if (topic.state !== 'ready') {
    return (
      <>
        <Hero headline={headline} />
        <Container className="py-10 lg:py-14">
          {topic.state === 'unconfigured' ? (
            <SetupNotice missing={topic.missing} />
          ) : (
            <LoadError message={topic.message} />
          )}
        </Container>
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
    <>
      <Hero headline={headline} />

      <Container className="py-10 lg:py-14">
        <Breadcrumbs items={crumbs} />

        <div className="mt-7 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside>
            <CategorySidebar
              topic={topic.data}
              activeCategoryId={category._id}
            />
          </aside>

          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500">
            <header className="flex items-start gap-5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon name={category.icon} size={26} />
              </span>
              <div className="min-w-0">
                <h1 className="text-[26px] font-semibold leading-tight text-ink">
                  {category.title}
                </h1>
                {category.description ? (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge>{category.articleCount} нийтлэл</Badge>
                  <Badge>{category.authorCount} зохиогч</Badge>
                </div>
              </div>
            </header>

            <div className="mt-8">
              {articles.length ? (
                <>
                  <Card className="p-2">
                    <ul className="divide-y divide-line">
                      {articles.map((article, index) => (
                        <ArticleListItem
                          key={article._id}
                          article={article}
                          index={index}
                        />
                      ))}
                    </ul>
                  </Card>

                  <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
                    <div>
                      <h2 className="text-base font-semibold text-ink">
                        Хариултаа олсонгүй юу?
                      </h2>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        Дэмжлэгийн багт хүсэлт үүсгэвэл хариу өгнө.
                      </p>
                    </div>
                    <ButtonLink href="/tickets/new" size="sm">
                      Хүсэлт илгээх
                    </ButtonLink>
                  </Card>
                </>
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
      </Container>
    </>
  );
}
