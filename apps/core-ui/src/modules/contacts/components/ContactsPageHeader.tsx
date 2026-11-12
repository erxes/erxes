import { cn } from 'erxes-ui';
import { forwardRef, type HTMLAttributes } from 'react';
import { PageHeader } from 'erxes-ui';

/*
 * Old ui-modules PageHeader details the compat stub leaves out: room for the
 * app sidebar's toggle when the sidebar is collapsed, and the first crumb
 * pulled left so its icon lines up with the page content.
 */
const PAGE_HEADER_PADDING_CLASS_NAME =
  'pl-[calc(0.75rem_+_var(--navigation-panel-toggle-space,0rem)_+_var(--visited-page-tabs-open-button-space,0rem))]';

const PAGE_HEADER_FIRST_CRUMB_CLASS_NAME =
  '[&>nav:first-of-type>ol>li:first-child_a]:-ml-2 [&>nav:first-of-type>ol>li:first-child_a]:pl-2 [&>nav:first-of-type>ol>li:first-child_button]:-ml-2 [&>nav:first-of-type>ol>li:first-child_button]:pl-2';

const ContactsPageHeaderRoot = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <PageHeader ref={ref} className={cn(className, PAGE_HEADER_PADDING_CLASS_NAME)} {...props}>
      {children}
    </PageHeader>
  ),
);

ContactsPageHeaderRoot.displayName = 'ContactsPageHeader';

const ContactsPageHeaderStart = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <PageHeader.Start
      ref={ref}
      className={cn(PAGE_HEADER_FIRST_CRUMB_CLASS_NAME, className)}
      {...props}
    />
  ),
);

ContactsPageHeaderStart.displayName = 'ContactsPageHeaderStart';

export const ContactsPageHeader = Object.assign(ContactsPageHeaderRoot, {
  Start: ContactsPageHeaderStart,
  End: PageHeader.End,
});
