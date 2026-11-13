import type { ViewRecordType } from '@erxes/core-contract';
import type { ReactNode } from 'react';
import { ViewTabs } from './ViewTabs';

/** A list's one bar: its saved views on the left, its filter on the right. */
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
  <div className="flex h-11 shrink-0 items-center gap-3 border-b bg-background px-3">
    <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
      <ViewTabs recordType={recordType} allLabel={allLabel} />
    </div>
    <div className="flex min-w-0 max-w-[65%] shrink-0 items-center justify-end">{children}</div>
  </div>
);
