import Link from 'next/link';
import { Card } from '@/modules/ui/components/Card';
import { Icon } from '@/modules/ui/components/Icon';
import { plural } from '@/modules/ui/lib/plural';
import { formatDate, type ArticleEntry } from '../utils/selectors';

export const PopularArticles = ({ entries }: { entries: ArticleEntry[] }) => {
  const most = Math.max(...entries.map(({ article }) => article.viewCount), 0);

  return (
    <Card className="p-2">
      <ol className="divide-y divide-line-soft">
        {entries.map(({ article, category }, index) => (
          <li key={article._id}>
            <Link
              href={`/knowledge-base/article/${article._id}`}
              className="group flex items-start gap-4 rounded-xl px-4 py-4 outline-none transition-colors duration-300 ease-out-soft hover:bg-subtle focus-visible:bg-subtle sm:gap-5 sm:px-5"
            >
              <span
                aria-hidden="true"
                className="w-7 shrink-0 text-[22px] font-semibold leading-none tabular-nums text-muted-foreground/25 transition-colors duration-500 ease-out-soft group-hover:text-brand/60"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand">
                  {article.title}
                </span>

                {article.summary ? (
                  <span className="mt-1 block truncate text-[13px] leading-relaxed text-muted-foreground">
                    {article.summary}
                  </span>
                ) : null}

                <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-muted-foreground">
                  {most > 0 ? (
                    <span
                      aria-hidden="true"
                      className="h-1 w-24 overflow-hidden rounded-full bg-subtle sm:w-32"
                    >
                      <span
                        className="block h-full rounded-full bg-brand/50 transition-[background-color] duration-500 ease-out-soft group-hover:bg-brand"
                        style={{
                          width: `${Math.max(
                            (article.viewCount / most) * 100,
                            4,
                          )}%`,
                        }}
                      />
                    </span>
                  ) : null}

                  {article.viewCount > 0 ? (
                    <span className="tabular-nums">
                      {plural(article.viewCount, 'view')}
                    </span>
                  ) : null}

                  {article.modifiedAt ? (
                    <span className="tabular-nums">
                      {formatDate(article.modifiedAt)}
                    </span>
                  ) : null}
                </span>
              </span>

              <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand sm:inline-flex">
                <Icon name={category.icon} size={12} className="shrink-0" />
                <span className="max-w-32 truncate">{category.title}</span>
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
      </ol>
    </Card>
  );
};
