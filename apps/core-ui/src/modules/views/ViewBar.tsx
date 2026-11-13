import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { ViewRecordType } from '@erxes/core-contract';
import type { ReactNode } from 'react';
import { ViewTabs } from './ViewTabs';

/**
 * A list's one bar: its saved views on the left, its filter on the right.
 * The first tab's icon lines up with the page header's first crumb.
 */
export const ViewBar = ({
  recordType,
  allLabel,
  children,
}: {
  recordType: ViewRecordType;
  allLabel: string;
  /** The list's filter. */
  children: ReactNode;
}) => {
  const [tabsRef] = useAutoAnimate({ duration: 150 });

  return (
    <div className="flex h-10 shrink-0 items-center gap-3 border-b bg-background pr-3">
      {/* The padding keeps focus rings inside the scrolling box. */}
      <div
        ref={tabsRef}
        className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto p-1 [scrollbar-width:none]"
      >
        <ViewTabs recordType={recordType} allLabel={allLabel} />
      </div>
      <div className="flex min-w-0 max-w-[65%] shrink-0 items-center justify-end">{children}</div>
    </div>
  );
};
