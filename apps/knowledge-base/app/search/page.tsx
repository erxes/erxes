import Link from 'next/link';
import { getAnnouncements } from '@/modules/cms/api';
import { announcementHref, formatDate as formatPostDate } from '@/modules/cms/format';
import { getTopicWithArticles } from '@/modules/knowledge-base/api';
import {
  allArticles,
  formatDate,
  searchArticles,
  sortByRecency,
} from '@/modules/knowledge-base/selectors';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/Hero';
import { Avatar } from '@/modules/ui/Avatar';
import { Badge } from '@/modules/ui/Badge';
import { ButtonLink } from '@/modules/ui/Button';
import { Card } from '@/modules/ui/Card';
import { EmptyState } from '@/modules/ui/EmptyState';
import { Icon, type IconName } from '@/modules/ui/Icon';
import { LoadError, SetupNotice } from '@/modules/ui/PortalState';

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export const metadata = { title: 'Хайлт' };

type ResultRow = {
  key: string;
  href: string;
  icon: IconName;
  kind: string;
  title: string;
  summary: string;
  meta: string;
  author?: string;
};

const ResultList = ({ rows }: { rows: ResultRow[] }) => (
  <Card className="p-2">
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <li key={row.key}>
          <Link
            href={row.href}
            className="block rounded-lg px-4 py-4 transition-colors hover:bg-subtle"
          >
            <span className="flex items-start gap-3">
              <span className="mt-0.5 text-muted">
                <Icon name={row.icon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{row.kind}</Badge>
                </span>
                <span className="mt-1.5 block text-[15px] font-semibold text-ink">
                  {row.title}
                </span>
                {row.summary ? (
                  <span className="mt-1 block text-sm leading-relaxed text-muted">
                    {row.summary}
                  </span>
                ) : null}
                <span className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted">
                  {row.author ? (
                    <span className="flex items-center gap-1.5">
                      <Avatar name={row.author} size={20} />
                      {row.author}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-1.5">
                    <Icon name="clock" size={14} />
                    {row.meta}
                  </span>
                </span>
              </span>
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
    getAnnouncements(term ? 20 : 5, term || undefined),
  ]);

  if (topic.state !== 'ready') {
    return (
      <>
        <Hero headline={headline} searchQuery={term} />
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

  const articles = term
    ? searchArticles(topic.data, term)
    : sortByRecency(allArticles(topic.data));

  const articleRows: ResultRow[] = articles.map((article) => ({
    key: `kb-${article._id}`,
    href: `/knowledge-base/article/${article._id}`,
    icon: 'article',
    kind: 'Мэдлэгийн сан',
    title: article.title,
    summary: article.summary,
    meta: formatDate(article.modifiedAt),
    author: article.author,
  }));

  const cmsReady = announcements.state === 'ready';
  const posts = cmsReady ? announcements.data : [];

  const postRows: ResultRow[] = posts.map((post) => ({
    key: `cms-${post._id}`,
    href: announcementHref(post),
    icon: 'megaphone',
    kind: 'Мэдээ мэдээлэл',
    title: post.title ?? 'Гарчиггүй зарлал',
    summary: post.excerpt ?? '',
    meta: formatPostDate(post.publishedDate ?? post.createdAt),
  }));

  const rows = [...articleRows, ...postRows];

  return (
    <>
      <Hero headline={headline} searchQuery={term} />

      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold text-ink">
          {term ? `«${term}» — ${rows.length} үр дүн` : 'Бүх агуулга'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {term
            ? cmsReady
              ? `Мэдлэгийн сангаас ${articleRows.length}, мэдээ мэдээллээс ${postRows.length} илэрц олдлоо.`
              : `Мэдлэгийн сангаас ${articleRows.length} илэрц олдлоо.`
            : `Мэдлэгийн санд нийт ${articleRows.length} нийтлэл байна.`}
        </p>

        {cmsReady ? null : (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-warning-soft px-4 py-3 text-[13px] text-warning">
            <Icon name="alert" size={15} className="mt-px shrink-0" />
            {announcements.state === 'error'
              ? `Мэдээ мэдээллийг хайлтад оруулж чадсангүй: ${announcements.message}`
              : `Мэдээ мэдээлэл хайлтад ороогүй — ${announcements.missing.join(', ')} тохируулаагүй байна.`}
          </p>
        )}

        <div className="mt-7">
          {rows.length ? (
            <ResultList rows={rows} />
          ) : (
            <EmptyState
              icon="search"
              title="Үр дүн олдсонгүй"
              description="Өөр түлхүүр үгээр хайж үзнэ үү. Хариулт олдохгүй бол дэмжлэгийн багт хүсэлт үүсгээрэй."
              action={
                <ButtonLink href="/tickets/new" size="sm">
                  Хүсэлт үүсгэх
                </ButtonLink>
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
