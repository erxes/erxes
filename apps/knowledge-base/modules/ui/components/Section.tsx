import type { ReactNode } from 'react';
import { cn } from '@/modules/ui/lib/cn';
import { Icon, type IconName } from './Icon';
import { Reveal } from './Reveal';

/**
 * One band of the page: a heading, an optional trailing action, and its
 * content. Sections are always open — the portal's own content is what the
 * visitor came for, so it is never put behind a disclosure.
 *
 * Each band settles in as it first reaches the fold, which is why the reveal
 * lives here rather than at every call site.
 */
export const Section = ({
  icon,
  title,
  description,
  action,
  className,
  children,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  /** Rendered opposite the heading — usually the "see all" link. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) => (
  <Reveal as="section" className={cn('scroll-mt-24', className)}>
    {/*
     * The rule under the heading is the section marker — it replaces the panel
     * border these sections used to sit inside, so a section still reads as one
     * band without boxing its content.
     */}
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-line pb-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-ink">
          {icon ? (
            <Icon name={icon} size={17} className="shrink-0 text-brand" />
          ) : null}
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>

    <div className="mt-6">{children}</div>
  </Reveal>
);
