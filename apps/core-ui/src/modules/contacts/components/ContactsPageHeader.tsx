import { cn, PageHeader } from 'erxes-ui';

/*
 * Room for the app sidebar's toggle when the sidebar is collapsed, and the first crumb
 * pulled left so its icon lines up with the page content.
 */
const PAGE_HEADER_PADDING_CLASS_NAME =
  'pl-[calc(0.75rem_+_var(--navigation-panel-toggle-space,0rem)_+_var(--visited-page-tabs-open-button-space,0rem))]';

const PAGE_HEADER_FIRST_CRUMB_CLASS_NAME =
  '[&>nav:first-of-type>ol>li:first-child_a]:-ml-2 [&>nav:first-of-type>ol>li:first-child_a]:pl-2 [&>nav:first-of-type>ol>li:first-child_button]:-ml-2 [&>nav:first-of-type>ol>li:first-child_button]:pl-2';

const ContactsPageHeaderRoot = ({
  ref,
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) => (
  <PageHeader ref={ref} className={cn(className, PAGE_HEADER_PADDING_CLASS_NAME)} {...props}>
    {children}
  </PageHeader>
);

const ContactsPageHeaderStart = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <PageHeader.Start
    ref={ref}
    className={cn(PAGE_HEADER_FIRST_CRUMB_CLASS_NAME, className)}
    {...props}
  />
);

export const ContactsPageHeader = Object.assign(ContactsPageHeaderRoot, {
  Start: ContactsPageHeaderStart,
  End: PageHeader.End,
});
