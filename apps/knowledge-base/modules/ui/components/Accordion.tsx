import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export const AccordionSection = ({
  id,
  icon,
  title,
  description,
  defaultOpen = true,
  children,
}: {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) => (
  <details
    open={defaultOpen}
    className="disclosure group overflow-hidden rounded-xl border border-line bg-white"
  >
    <summary
      id={id}
      className="flex cursor-pointer list-none items-center gap-4 p-6 transition-colors hover:bg-subtle [&::-webkit-details-marker]:hidden"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <Icon name={icon} size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-ink">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
      <span className="shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-open:rotate-180">
        <Icon name="chevronDown" size={20} />
      </span>
    </summary>

    <div className="border-t border-line px-6 py-6">{children}</div>
  </details>
);
