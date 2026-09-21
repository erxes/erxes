import { CardLink } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Icon } from '@/modules/ui/components/Icon';
import { plural } from '@/modules/ui/lib/plural';
import type { PortalSection } from '../utils/normalize';
import { CategoryCard } from './CategoryCard';

const DirectLink = ({ section }: { section: PortalSection }) => (
  <CardLink
    href={`/knowledge-base/category/${section._id}`}
    className="group mt-5 flex flex-wrap items-center justify-between gap-4 p-5"
  >
    <span className="flex items-center gap-3">
      <span className="flex shrink-0 items-center justify-center text-muted-foreground transition-colors group-hover:text-brand">
        <Icon name={section.icon} size={18} />
      </span>
      <span className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Icon name="article" size={15} />
          {plural(section.articleCount, 'article')}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="users" size={15} />
          {plural(section.authorCount, 'author')}
        </span>
      </span>
    </span>
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors group-hover:text-brand">
      View articles
      <Icon
        name="chevronRight"
        size={16}
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </span>
  </CardLink>
);

export const SectionBlock = ({ section }: { section: PortalSection }) => (
  <section aria-labelledby={`section-${section._id}`}>
    <div className="min-w-0">
      <h2
        id={`section-${section._id}`}
        className="flex scroll-mt-24 items-center gap-2.5 text-lg font-semibold tracking-[-0.02em] text-ink"
      >
        <Icon
          name={section.icon}
          size={17}
          className="shrink-0 text-muted-foreground"
        />
        {section.title}
        {section.children.length ? (
          <span className="text-[13px] font-normal tracking-normal text-muted-foreground">
            {plural(section.children.length, 'category')}
          </span>
        ) : null}
      </h2>
      {section.description ? (
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {section.description}
        </p>
      ) : null}
    </div>

    {section.children.length ? (
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {section.children.map((category, index) => (
          <CategoryCard key={category._id} category={category} index={index} />
        ))}
      </div>
    ) : section.articleCount ? (
      <DirectLink section={section} />
    ) : (
      <div className="mt-6">
        <EmptyState
          icon="book"
          title="No categories yet"
          description="This group has no published categories yet — check back soon."
        />
      </div>
    )}
  </section>
);
