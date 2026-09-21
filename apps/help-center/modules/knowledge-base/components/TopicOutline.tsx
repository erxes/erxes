import { CardLink } from '@/modules/ui/components/Card';
import { Icon } from '@/modules/ui/components/Icon';
import { plural } from '@/modules/ui/lib/plural';
import type { PortalSection, PortalTopic } from '../utils/normalize';
import { sectionArticleCount } from '../utils/selectors';

const sectionHref = (section: PortalSection) =>
  section.children.length
    ? `/knowledge-base#section-${section._id}`
    : `/knowledge-base/category/${section._id}`;

export const TopicOutline = ({ topic }: { topic: PortalTopic }) => (
  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {topic.sections.map((section, index) => (
      <li
        key={section._id}
        className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-500"
        style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      >
        <CardLink
          href={sectionHref(section)}
          className="group flex h-full flex-col p-5"
        >
          <span className="flex items-center gap-2.5">
            <Icon
              name={section.icon}
              size={18}
              className="shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-brand"
            />
            <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-ink">
              {section.title}
            </span>
          </span>

          {section.description ? (
            <span className="mt-2.5 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">
              {section.description}
            </span>
          ) : null}

          <span className="mt-auto flex items-center gap-3 pt-5 text-[13px] text-muted-foreground">
            {plural(sectionArticleCount(section), 'article')}
            {section.children.length ? (
              <>
                <span aria-hidden="true" className="text-line-strong">
                  ·
                </span>
                {plural(section.children.length, 'category')}
              </>
            ) : null}
            <Icon
              name="chevronRight"
              size={14}
              className="ml-auto opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
            />
          </span>
        </CardLink>
      </li>
    ))}
  </ul>
);
