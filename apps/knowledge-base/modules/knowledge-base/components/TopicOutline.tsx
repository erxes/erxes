import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import type { PortalTopic } from '../utils/normalize';
import { sectionArticleCount } from '../utils/selectors';

export const TopicOutline = ({ topic }: { topic: PortalTopic }) => (
  <ul className="grid gap-2 sm:grid-cols-2">
    {topic.sections.map((section) => (
      <li key={section._id}>
        <Link
          href={
            section.children.length
              ? `/knowledge-base#section-${section._id}`
              : `/knowledge-base/category/${section._id}`
          }
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-subtle"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-soft">
            <Icon name={section.icon} size={16} />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
            {section.title}
          </span>
          <span className="shrink-0 text-[13px] text-muted-foreground">
            {sectionArticleCount(section)}
          </span>
        </Link>
      </li>
    ))}
  </ul>
);
