import Link from 'next/link';
import { Icon } from '@/modules/ui/Icon';
import { cn } from '@/lib/cn';
import type { PortalTopic } from '../normalize';
import { sectionArticleCount, sectionCards } from '../selectors';

export const CategorySidebar = ({
  topic,
  activeCategoryId,
}: {
  topic: PortalTopic;
  activeCategoryId?: string;
}) => (
  <nav
    aria-label="Мэдлэгийн сангийн ангилал"
    className="rounded-xl border border-line bg-white p-5"
  >
    {topic.sections.map((section, index) => (
      <div key={section._id} className={cn(index > 0 && 'mt-7')}>
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-soft">
            <Icon name={section.icon} size={17} />
          </span>
          <span className="flex flex-1 items-center justify-between gap-2 pt-1.5">
            <span className="text-sm font-semibold uppercase tracking-wide text-ink">
              {section.title}
            </span>
            <span className="text-[13px] text-muted">
              ({sectionArticleCount(section)})
            </span>
          </span>
        </div>

        <ul className="mt-3 space-y-1 pl-12">
          {sectionCards(section).map((category) => {
            const active = category._id === activeCategoryId;

            return (
              <li key={category._id}>
                <Link
                  href={`/knowledge-base/category/${category._id}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] uppercase tracking-wide transition-colors',
                    active
                      ? 'bg-brand-soft font-semibold text-brand'
                      : 'text-muted hover:bg-subtle hover:text-ink',
                  )}
                >
                  <span className="flex items-start gap-2">
                    <span aria-hidden="true" className="pt-px">
                      •
                    </span>
                    {category.title}
                  </span>
                  <span className="shrink-0">({category.articleCount})</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </nav>
);
