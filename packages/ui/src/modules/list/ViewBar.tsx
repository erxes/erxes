import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IconLayoutList } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { TabButton } from '../../components/tabs';

/**
 * A list's one bar under its page header: views left, filter right.
 * The filter is `ListFilter`, with `DisplayMenu` inside it. The first tab's icon lines up with
 * the page header's first crumb. Without `tabs` the list has one view, "All …" (`allLabel`).
 */
export const ViewBar = ({
  allLabel,
  tabs,
  children,
}: {
  allLabel: string;
  /** Saved views as tabs; core's own lists pass theirs. */
  tabs?: ReactNode;
  /** The list's filter. */
  children?: ReactNode;
}) => {
  const [tabsRef] = useAutoAnimate({ duration: 150 });

  return (
    <div className="flex h-10 shrink-0 items-center gap-3 border-b bg-background pr-3">
      {/* The padding keeps focus rings inside the scrolling box. */}
      <div
        ref={tabsRef}
        className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto p-1 hide-scroll"
      >
        {tabs ?? (
          <TabButton type="button" aria-current="page" active>
            <IconLayoutList />
            {allLabel}
          </TabButton>
        )}
      </div>
      <div className="flex min-w-0 max-w-13/20 shrink-0 items-center justify-end">{children}</div>
    </div>
  );
};
