import { CardLink } from '@/modules/ui/Card';
import { Icon } from '@/modules/ui/Icon';
import type { PortalCategory } from '../normalize';

export const CategoryCard = ({ category }: { category: PortalCategory }) => (
  <CardLink
    href={`/knowledge-base/category/${category._id}`}
    className="flex h-full flex-col p-6"
  >
    <span className="mb-5 flex size-11 items-center justify-center rounded-lg bg-subtle text-ink-soft">
      <Icon name={category.icon} size={20} />
    </span>

    <h3 className="text-base font-semibold text-ink">{category.title}</h3>
    {category.description ? (
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {category.description}
      </p>
    ) : null}

    <div className="mt-6 flex items-center gap-6 border-t border-line pt-4 text-[13px] text-muted">
      <span className="flex items-center gap-1.5">
        <Icon name="article" size={15} />
        {category.articleCount} articles
      </span>
      <span className="flex items-center gap-1.5">
        <Icon name="users" size={15} />
        {category.authorCount} authors
      </span>
    </div>
  </CardLink>
);
