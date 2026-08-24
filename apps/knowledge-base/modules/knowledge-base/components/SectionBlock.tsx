import { CardLink } from '@/modules/ui/Card';
import { EmptyState } from '@/modules/ui/EmptyState';
import { Icon } from '@/modules/ui/Icon';
import type { PortalSection } from '../normalize';
import { CategoryCard } from './CategoryCard';

/**
 * A section with no child categories holds its articles directly. Rendering a
 * card that repeats the heading reads as a duplicate, so it gets a single wide
 * row that leads to the article list instead.
 */
const DirectLink = ({ section }: { section: PortalSection }) => (
  <CardLink
    href={`/knowledge-base/category/${section._id}`}
    className="mt-6 flex items-center justify-between gap-4 p-5"
  >
    <span className="flex items-center gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-soft">
        <Icon name={section.icon} size={20} />
      </span>
      <span className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[13px] text-muted">
        <span className="flex items-center gap-1.5">
          <Icon name="article" size={15} />
          {section.articleCount} articles
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="users" size={15} />
          {section.authorCount} authors
        </span>
      </span>
    </span>
    <span className="flex items-center gap-1.5 text-sm font-semibold text-brand">
      Нийтлэлүүдийг үзэх
      <Icon name="chevronRight" size={16} />
    </span>
  </CardLink>
);

export const SectionBlock = ({ section }: { section: PortalSection }) => (
  <section aria-labelledby={`section-${section._id}`}>
    <h2 id={`section-${section._id}`} className="text-2xl font-semibold text-ink">
      {section.title}
    </h2>
    {section.description ? (
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        {section.description}
      </p>
    ) : null}

    {section.children.length ? (
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {section.children.map((category) => (
          <CategoryCard key={category._id} category={category} />
        ))}
      </div>
    ) : section.articleCount ? (
      <DirectLink section={section} />
    ) : (
      <div className="mt-6">
        <EmptyState
          icon="book"
          title="Ангилал хараахан нэмэгдээгүй байна"
          description="Энэ бүлэгт нийтлэгдсэн ангилал байхгүй тул удахгүй шинэчлэгдэнэ."
        />
      </div>
    )}
  </section>
);
