import { CardLink } from '@/modules/ui/components/Card';
import { Icon } from '@/modules/ui/components/Icon';
import { plural } from '@/modules/ui/lib/plural';
import type { PortalTopic } from '../utils/normalize';
import { sectionArticleCount } from '../utils/selectors';

export const TopicOutline = ({ topic }: { topic: PortalTopic }) => (
  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {topic.sections.map((section, index) => (
      <li
        key={section._id}
        className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
        style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      >
        <CardLink
          href={
            section.children.length
              ? `/knowledge-base#section-${section._id}`
              : `/knowledge-base/category/${section._id}`
          }
          className="group flex h-full flex-col p-5"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <Icon name={section.icon} size={19} />
          </span>

          <span className="mt-4 block text-[15px] font-semibold leading-snug text-ink">
            {section.title}
          </span>

          {section.description ? (
            <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">
              {section.description}
            </span>
          ) : null}

          <span className="mt-auto flex items-center gap-4 pt-4 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Icon name="article" size={14} />
              {plural(sectionArticleCount(section), 'article')}
            </span>
            {section.children.length ? (
              <span className="flex items-center gap-1.5">
                <Icon name="book" size={14} />
                {plural(section.children.length, 'category')}
              </span>
            ) : null}
          </span>
        </CardLink>
      </li>
    ))}
  </ul>
);
