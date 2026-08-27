import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import type { PortalTopic } from '../utils/normalize';
import { sectionArticleCount, sectionCards } from '../utils/selectors';

export const CategorySidebar = ({
  topic,
  activeCategoryId,
}: {
  topic: PortalTopic;
  activeCategoryId?: string;
}) => (
  <nav aria-label="Мэдлэгийн сангийн ангилал" className="space-y-6">
    {topic.sections.map((section) => (
      <div key={section._id}>
        <div className="flex items-center gap-2 pr-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-white text-ink-soft">
            <Icon name={section.icon} size={15} />
          </span>
          <h2 className="min-w-0 flex-1 pl-0.5 text-[13px] font-semibold leading-snug text-ink">
            {section.title}
          </h2>
          <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
            ({sectionArticleCount(section)})
          </span>
        </div>

        <ul className="mt-1">
          {sectionCards(section).map((category) => {
            const active = category._id === activeCategoryId;

            return (
              <li key={category._id}>
                <Link
                  href={`/knowledge-base/category/${category._id}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-baseline gap-2 rounded-md py-1.5 pl-[2.375rem] pr-2.5 text-[13px] leading-snug transition-colors duration-200',
                    active
                      ? 'bg-brand-soft font-semibold text-brand'
                      : 'text-ink-soft hover:bg-white hover:text-brand',
                  )}
                >
                  <span className="min-w-0 flex-1">{category.title}</span>
                  <span
                    className={cn(
                      'shrink-0 tabular-nums',
                      active ? 'text-brand/70' : 'text-muted-foreground',
                    )}
                  >
                    ({category.articleCount})
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </nav>
);
