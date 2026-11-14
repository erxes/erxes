import { PageHeader } from 'erxes-ui';
import type { ReactNode } from 'react';

/** A record page's header: its list's breadcrumb ending in the record's name, then its actions. */
export const RecordPageHeader = ({
  breadcrumb,
  actions,
}: {
  breadcrumb: ReactNode;
  actions?: ReactNode;
}) => (
  <PageHeader variant="wrap">
    <PageHeader.Start
      variant="flush"
      className="min-w-0 flex-1 basis-64 [&_nav]:min-w-0 [&_ol]:flex-nowrap [&_li]:min-w-0 [&>div]:shrink-0"
    >
      {breadcrumb}
    </PageHeader.Start>
    {actions && <PageHeader.End className="ml-auto min-w-0 max-w-full">{actions}</PageHeader.End>}
  </PageHeader>
);
