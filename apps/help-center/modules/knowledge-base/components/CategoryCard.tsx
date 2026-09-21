import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
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
    <article
      className={cn(
        'animate-in fade-in slide-in-from-bottom-1 fill-mode-both flex h-full flex-col rounded-2xl border border-line bg-white p-6 duration-500',
        'shadow-[0_1px_2px_rgba(20,20,43,0.04)]',
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon name={category.icon} size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-ink">
            <Link
              href={href}
              className="outline-none transition-colors duration-200 hover:text-brand focus-visible:text-brand"
            >
              {category.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {plural(category.articleCount, 'article')}
          </p>
        </div>
      </div>

      {preview.length ? (
        <ul className="mt-5 flex flex-col">
          {preview.map((article) => (
            <li key={article._id}>
              <Link
                href={`/knowledge-base/article/${article._id}`}
                className="group flex items-baseline gap-2.5 rounded-lg py-2 text-sm text-ink-soft outline-none transition-colors duration-150 hover:text-brand focus-visible:text-brand"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-line-strong transition-colors duration-150 group-hover:bg-brand"
                />
                <span className="min-w-0 flex-1 truncate">{article.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : category.description ? (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>
      ) : null}

      <Link
        href={href}
        className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-semibold text-brand outline-none transition-colors duration-150 hover:text-brand-strong focus-visible:text-brand-strong"
      >
        {rest > 0 ? `All ${category.articleCount} articles` : 'Open category'}
        <Icon name="chevronRight" size={14} />
      </Link>
    </article>
  );
};
