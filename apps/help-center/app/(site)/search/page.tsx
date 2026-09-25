import Link from 'next/link';
import { getAnnouncements } from '@/modules/cms/api';
import {
  announcementHref,
  formatDate as formatPostDate,
} from '@/modules/cms/utils/format';
import { getTopicWithArticles } from '@/modules/knowledge-base/api';
import { CategoryCard } from '@/modules/knowledge-base/components/CategoryCard';
import { PopularArticles } from '@/modules/knowledge-base/components/PopularArticles';
import {
  articleEntries,
  browseCategories,
  formatDate,
  searchArticles,
  sortByReadership,
} from '@/modules/knowledge-base/utils/selectors';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { Badge, type BadgeTone } from '@/modules/ui/components/Badge';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Icon } from '@/modules/ui/components/Icon';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';
import { Section } from '@/modules/ui/components/Section';
import { plural } from '@/modules/ui/lib/plural';

const POST_LIMIT = 20;
const POPULAR_COUNT = 6;
const CATEGORY_COUNT = 6;
const SUGGESTION_COUNT = 4;
const POPULAR_MINIMUM = 3;

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export const metadata = { title: 'Search' };

type ResultRow = {
  key: string;
  href: string;
  kind: string;
  tone: BadgeTone;
  title: string;
  summary: string;
  meta: string;
};

const ResultList = ({ rows }: { rows: ResultRow[] }) => (
  <Card className="p-2">
    <ul className="divide-y divide-line-soft">
      {rows.map((row) => (
        <li key={row.key}>
          <Link
            href={row.href}
            className="group flex items-start gap-4 rounded-xl px-5 py-4 outline-none transition-colors duration-300 ease-out-soft hover:bg-subtle focus-visible:bg-subtle"
          >
            <span className="min-w-0 flex-1">
              <Badge tone={row.tone}>{row.kind}</Badge>

              <span className="mt-2.5 block text-[15px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand">
                {row.title}
              </span>

              {row.summary ? (
                <span className="mt-1 block truncate text-[13px] leading-relaxed text-muted-foreground">
                  {row.summary}
                </span>
              ) : null}
            </span>

            <span className="hidden shrink-0 items-center gap-1.5 pt-1 text-[12px] tabular-nums text-muted-foreground sm:flex">
              <Icon name="clock" size={13} />
              {row.meta}
            </span>

            <span
              aria-hidden="true"
              className="mt-1 shrink-0 text-muted-foreground/40 transition-[transform,color] duration-500 ease-out-soft group-hover:translate-x-1 group-hover:text-brand"
            >
              <Icon name="chevronRight" size={16} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </Card>
);

export default async function SearchPage({ searchParams }: Props) {
  const [{ headline }, params] = await Promise.all([
    getPortalIdentity(),
    searchParams,
  ]);

  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const term = (raw ?? '').trim();

  const [topic, announcements] = await Promise.all([
    getTopicWithArticles(),
    term ? getAnnouncements(POST_LIMIT, term) : null,
  ]);

  if (topic.state !== 'ready') {
    return (
      <>
        <Hero headline={headline} searchQuery={term} as="p" />
        <Container className="py-10 lg:py-14">
          {topic.state === 'unconfigured' ? (
            <SetupNotice missing={topic.missing} />
          ) : topic.state === 'unpublished' ? (
            <Unpublished domain={topic.domain} />
          ) : (
            <LoadError message={topic.message} />
          )}
        </Container>
      </>
    );
  }

  const readMost = sortByReadership(articleEntries(topic.data));
  const suggestions = readMost
    .slice(0, SUGGESTION_COUNT)
    .map(({ article }) => article.title);

  if (!term) {
    const popular = readMost.slice(0, POPULAR_COUNT);
    const categories = browseCategories(topic.data).slice(0, CATEGORY_COUNT);

    return (
      <>
        <Hero headline={headline} as="p" searchSuggestions={suggestions} />

        <Container className="py-10 lg:py-14">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            Search the knowledge base
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Type a keyword above — it looks through every article and
            announcement. Or start from one of these.
          </p>

          <div className="mt-10 space-y-12 lg:space-y-14">
            {popular.length >= POPULAR_MINIMUM ? (
              <Section
                icon="star"
                title="Popular articles"
                description="What other people opened most in this help center."
              >
                <PopularArticles entries={popular} />
              </Section>
            ) : null}

            {categories.length ? (
              <Section
                icon="book"
                title="Browse by category"
                description="Every answer, grouped by the part of the product it covers."
                action={
                  <ButtonLink
                    href="/knowledge-base"
                    size="sm"
                    variant="secondary"
                  >
                    All categories
                    <Icon name="chevronRight" size={15} />
                  </ButtonLink>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map(({ category, group }, index) => (
                    <CategoryCard
                      key={category._id}
                      category={category}
                      eyebrow={group ?? undefined}
                      index={index}
                    />
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        </Container>
      </>
    );
  }

  const articleRows: ResultRow[] = searchArticles(topic.data, term).map(
    (article) => ({
      key: `kb-${article._id}`,
      href: `/knowledge-base/article/${article._id}`,
      kind: 'Knowledge base',
      tone: 'brand',
      title: article.title,
      summary: article.summary,
      meta: formatDate(article.modifiedAt),
    }),
  );

  const cmsReady = announcements?.state === 'ready';
  const posts = announcements?.state === 'ready' ? announcements.data : [];

  const postRows: ResultRow[] = posts.map((post) => ({
    key: `cms-${post._id}`,
    href: announcementHref(post),
    kind: 'Announcement',
    tone: 'neutral',
    title: post.title ?? 'Untitled announcement',
    summary: post.excerpt ?? '',
    meta: formatPostDate(post.publishedDate ?? post.createdAt),
  }));

  const rows = [...articleRows, ...postRows];

  return (
    <>
      <Hero headline={headline} searchQuery={term} as="p" />

      <Container className="py-10 lg:py-14">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">
          “{term}” — {plural(rows.length, 'result')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {cmsReady
            ? `Found ${plural(
                articleRows.length,
                'match',
              )} in the knowledge base and ${plural(
                postRows.length,
                'match',
              )} in announcements.`
            : `Found ${plural(
                articleRows.length,
                'match',
              )} in the knowledge base.`}
        </p>

        {announcements && !cmsReady ? (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-warning-soft px-4 py-3 text-[13px] text-warning">
            <Icon name="alert" size={15} className="mt-px shrink-0" />
            {announcements.state === 'error'
              ? `Announcements could not be included in the search: ${announcements.message}`
              : announcements.state === 'unpublished'
              ? `Announcements are not included in the search — no help center is published at ${announcements.domain}.`
              : `Announcements are not included in the search — ${announcements.missing.join(
                  ', ',
                )} is not configured.`}
          </p>
        ) : null}

        <div className="mt-7">
          {rows.length ? (
            <ResultList rows={rows} />
          ) : (
            <EmptyState
              icon="search"
              title="No results found"
              description="Try a different keyword. If you cannot find an answer, raise a ticket with the support team."
              action={
                <ButtonLink href="/tickets/new" size="sm">
                  Create a ticket
                </ButtonLink>
              }
            />
          )}
        </div>
      </Container>
    </>
  );
}
