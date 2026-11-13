import type { ReactNode } from 'react';
import { ContactsPageHeader } from '~/modules/contacts/components/ContactsPageHeader';

/** A record page's header: its list's breadcrumb ending in the record's name, then its actions. */
export const RecordPageHeader = ({
  breadcrumb,
  actions,
}: {
  breadcrumb: ReactNode;
  actions?: ReactNode;
}) => (
  <ContactsPageHeader className="h-auto min-h-10 flex-wrap gap-x-3 gap-y-1 overflow-visible py-1">
    <ContactsPageHeader.Start className="min-w-0 flex-1 basis-64 pr-0 [&_nav]:min-w-0 [&_ol]:flex-nowrap [&_li]:min-w-0 [&>div]:shrink-0">
      {breadcrumb}
    </ContactsPageHeader.Start>
    {actions && (
      <ContactsPageHeader.End className="ml-auto min-w-0 max-w-full">
        {actions}
      </ContactsPageHeader.End>
    )}
  </ContactsPageHeader>
);
