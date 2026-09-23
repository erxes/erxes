import Link from 'next/link';
import { CardReveal } from '@/modules/ui/components/CardReveal';
import { Icon } from '@/modules/ui/components/Icon';
import { IconOrb } from '@/modules/ui/components/IconOrb';
import { Spotlight } from '@/modules/ui/components/Spotlight';
import { cn } from '@/modules/ui/lib/cn';
import { plural } from '@/modules/ui/lib/plural';
import type { PortalCategory } from '../utils/normalize';
import { sortByRecency } from '../utils/selectors';

const FEATURED_PREVIEW = 3;

export const CategoryCard = ({
  category,
  eyebrow,
  featured = false,
  index = 0,
}: {
  category: PortalCategory;
  eyebrow?: string;
  featured?: boolean;
  index?: number;
}) => {
  const href = `/knowledge-base/category/${category._id}`;
  const preview = featured
    ? sortByRecency(category.articles).slice(0, FEATURED_PREVIEW)
    : [];

  return (
    <CardReveal index={index}>
      <Spotlight
        as="article"
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-[transform,box-shadow] duration-500 ease-out-soft hover:-translate-y-1',
          featured
            ? 'bg-shell text-white shadow-shell-hover sm:p-7'
            : 'bg-white shadow-shell hover:shadow-shell-hover',
        )}
      >
        {featured ? (
          <>
            <span
              aria-hidden="true"
              className="animate-aurora pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-brand/45 blur-[90px]"
            />
            <span
              aria-hidden="true"
              className="hero-grid pointer-events-none absolute inset-0"
            />
          </>
        ) : null}

        <div className="relative flex h-full flex-col">
          <div className="flex items-center gap-5">
            <IconOrb
              name={category.icon}
              tone={featured ? 'invert' : 'brand'}
            />

            {eyebrow ? (
              <span
                className={cn(
                  'min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.08em]',
                  featured ? 'text-white/45' : 'text-muted-foreground/70',
                )}
              >
                {eyebrow}
              </span>
            ) : null}
          </div>

          <h3
            className={cn(
              'mt-5 font-semibold leading-snug tracking-[-0.01em]',
              featured
                ? 'text-[20px] text-white'
                : 'text-[16px] text-ink transition-colors duration-300 group-hover:text-brand',
            )}
          >
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
            >
              {category.title}
            </Link>
          </h3>

          {category.description ? (
            <p
              className={cn(
                'mt-2 leading-relaxed',
                featured
                  ? 'max-w-md text-[14px] text-white/55'
                  : 'line-clamp-2 text-[13px] text-muted-foreground',
              )}
            >
              {category.description}
            </p>
          ) : null}

          {preview.length ? (
            <ul className="relative mt-6 flex max-w-md flex-col gap-0.5">
              {preview.map((article) => (
                <li key={article._id}>
                  <Link
                    href={`/knowledge-base/article/${article._id}`}
                    className="group/item -mx-2.5 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-white/60 outline-none transition-colors duration-300 ease-out-soft hover:bg-white/[0.07] hover:text-white focus-visible:bg-white/[0.07] focus-visible:text-white"
                  >
                    <Icon
                      name="chevronRight"
                      size={13}
                      className="shrink-0 text-white/25 transition-[transform,color] duration-300 group-hover/item:translate-x-0.5 group-hover/item:text-white/70"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {article.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <p
            className={cn(
              'mt-auto flex items-center justify-between gap-3 pt-6 text-[12px] font-medium transition-colors duration-500 ease-out-soft',
              featured
                ? 'text-white/50 group-hover:text-white'
                : 'text-muted-foreground group-hover:text-brand',
            )}
          >
            {plural(category.articleCount, 'article')}
            <Icon
              name="chevronRight"
              size={15}
              className={cn(
                'shrink-0 transition-[transform,color] duration-500 ease-out-soft group-hover:translate-x-1',
                featured
                  ? 'text-white/30 group-hover:text-white'
                  : 'text-muted-foreground/40 group-hover:text-brand',
              )}
            />
          </p>
        </div>
      </Spotlight>
    </CardReveal>
  );
};
