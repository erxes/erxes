import { CardLink } from '@/modules/ui/components/Card';
import { Icon } from '@/modules/ui/components/Icon';
import { plural } from '@/modules/ui/lib/plural';
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
    className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both group flex h-full flex-col gap-y-6 p-6 duration-500"
    style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
  >
    <span className="flex size-11 items-center justify-center rounded-lg bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
      <Icon name={category.icon} size={20} />
    </span>

    <div>
      <h3 className="text-base font-semibold leading-snug text-ink">
        {category.title}
      </h3>
      {category.description ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>
      ) : null}
    </div>

    <div className="mt-auto flex items-center gap-6 border-t border-line-soft pt-4 text-[13px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Icon name="article" size={15} />
        {plural(category.articleCount, 'article')}
      </span>
      <span className="flex items-center gap-1.5">
        <Icon name="users" size={15} />
        {plural(category.authorCount, 'author')}
      </span>
    </div>
  </CardLink>
);
