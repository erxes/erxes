import { CardLink } from '@/modules/ui/components/Card';
import { Icon } from '@/modules/ui/components/Icon';
import type { PortalCategory } from '../utils/normalize';

export const CategoryCard = ({
  category,
  index = 0,
}: {
  category: PortalCategory;
  index?: number;
}) => (
  <CardLink
    href={`/knowledge-base/category/${category._id}`}
    className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex h-full flex-col p-6 duration-500 hover:-translate-y-0.5"
    style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
  >
    <span className="mb-5 flex size-11 items-center justify-center rounded-lg bg-subtle text-ink-soft">
      <Icon name={category.icon} size={20} />
    </span>

    <h3 className="text-base font-semibold text-ink">{category.title}</h3>
    {category.description ? (
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {category.description}
      </p>
    ) : null}

    <div className="mt-6 flex items-center gap-6 border-t border-line pt-4 text-[13px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Icon name="article" size={15} />
        {category.articleCount} нийтлэл
      </span>
      <span className="flex items-center gap-1.5">
        <Icon name="users" size={15} />
        {category.authorCount} зохиогч
      </span>
    </div>
  </CardLink>
);
