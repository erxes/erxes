import Link from 'next/link';
import { CardReveal } from '@/modules/ui/components/CardReveal';
import { Icon } from '@/modules/ui/components/Icon';
import { plural } from '@/modules/ui/lib/plural';
import type { PortalCategory } from '../utils/normalize';
import { sortByRecency } from '../utils/selectors';

const PREVIEW_COUNT = 4;

export const CategoryCard = ({
  category,
  index = 0,
}: {
  category: PortalCategory;
  index?: number;
}) => {
  const href = `/knowledge-base/category/${category._id}`;
  const preview = sortByRecency(category.articles).slice(0, PREVIEW_COUNT);
  const rest = category.articleCount - preview.length;

  return (
    <CardReveal index={index}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white p-7 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover">
        <h3 className="relative text-[19px] font-semibold leading-snug tracking-[-0.02em] text-ink">
          <Link
            href={href}
            className="outline-none transition-colors duration-200 hover:text-brand focus-visible:text-brand"
          >
            {category.title}
          </Link>
        </h3>
        <p className="relative mt-1 text-[13px] text-muted-foreground">
          {plural(category.articleCount, 'article')}
        </p>

        {preview.length ? (
          <ol className="relative mt-6 flex flex-col gap-0.5">
            {preview.map((article, position) => (
              <li key={article._id}>
                <Link
                  href={`/knowledge-base/article/${article._id}`}
                  className="group/item -mx-2.5 flex items-baseline gap-3 rounded-lg px-2.5 py-2 text-sm text-ink-soft outline-none transition-[color,background-color] duration-200 hover:bg-brand-soft/60 hover:text-brand focus-visible:bg-brand-soft/60 focus-visible:text-brand"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] tabular-nums text-muted-foreground/50 transition-colors duration-200 group-hover/item:text-brand"
                  >
                    {String(position + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {article.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : category.description ? (
          <p className="relative mt-5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {category.description}
          </p>
        ) : null}

        <Link
          href={href}
          className="relative mt-auto inline-flex items-center gap-1.5 self-start pt-7 text-[13px] font-semibold text-brand outline-none transition-colors duration-150 hover:text-brand-strong focus-visible:text-brand-strong"
        >
          {rest > 0
            ? `All ${plural(category.articleCount, 'article')}`
            : 'Open category'}
          <Icon
            name="chevronRight"
            size={14}
            className="transition-transform duration-300 ease-out group-hover:translate-x-1"
          />
        </Link>
      </article>
    </CardReveal>
  );
};
