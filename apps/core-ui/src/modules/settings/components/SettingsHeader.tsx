import { cn, Separator } from 'erxes-ui';
import type { ReactNode } from 'react';

/**
 * Pulls a page's first breadcrumb out by its button's padding, so its icon
 * lines up with the page's content (old ui-modules `pageHeaderClassNames`).
 */
const PAGE_HEADER_FIRST_CRUMB_CLASS_NAME =
  '[&>nav:first-of-type>ol>li:first-child_a]:-ml-2 [&>nav:first-of-type>ol>li:first-child_a]:pl-2 [&>nav:first-of-type>ol>li:first-child_button]:-ml-2 [&>nav:first-of-type>ol>li:first-child_button]:pl-2';

/** A settings page's top row: breadcrumbs, then the page's own actions (old ui-modules `SettingsHeader`). */
export const SettingsHeader = ({ children, breadcrumbs }: { children?: ReactNode; breadcrumbs?: ReactNode }) => (
  <div className="flex flex-col box-border shrink-0 bg-background w-full">
    <div
      className={cn(
        'flex h-10 items-center gap-2 px-3 pl-[calc(0.75rem_+_var(--navigation-panel-toggle-space,0rem)_+_var(--visited-page-tabs-open-button-space,0rem))]',
        PAGE_HEADER_FIRST_CRUMB_CLASS_NAME,
      )}
    >
      {breadcrumbs}
      {children}
    </div>
    <Separator className="w-full" />
  </div>
);
