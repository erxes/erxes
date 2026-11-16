import type { ViewRecordType } from '@erxes/core-contract';
import { ViewBar as ListBar } from 'erxes-ui';
import type { ReactNode } from 'react';
import { ViewTabs } from './ViewTabs';

/** A core list's bar: its saved views as tabs on the left, its filter on the right. */
export const ViewBar = ({
  recordType,
  allLabel,
  children,
}: {
  recordType: ViewRecordType;
  allLabel: string;
  /** The list's filter. */
  children: ReactNode;
}) => (
  <ListBar allLabel={allLabel} tabs={<ViewTabs recordType={recordType} allLabel={allLabel} />}>
    {children}
  </ListBar>
);
