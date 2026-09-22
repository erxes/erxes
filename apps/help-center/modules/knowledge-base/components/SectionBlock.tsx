import { CardLink } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Icon } from '@/modules/ui/components/Icon';
import { plural } from '@/modules/ui/lib/plural';
import type { PortalSection } from '../utils/normalize';
import { CategoryCard } from './CategoryCard';

const DirectLink = ({ section }: { section: PortalSection }) => (
  <CardLink
    href={`/knowledge-base/category/${section._id}`}
    className="group mt-6 flex flex-wrap items-center justify-between gap-4 p-5"
  >
    <span className="flex items-center gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        <Icon name={section.icon} size={20} />
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
    <span className="flex items-center gap-1.5 text-sm font-semibold text-brand">
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
    <h2
      id={`section-${section._id}`}
      className="scroll-mt-24 text-xl font-semibold tracking-[-0.01em] text-ink sm:text-2xl"
    >
      {section.title}
    </h2>
    {section.description ? (
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {section.description}
      </p>
    ) : null}

    {section.children.length ? (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
