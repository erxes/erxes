import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IconLayoutList } from '@tabler/icons-react';
import { type ComponentType, createContext, type ReactNode, Suspense, use } from 'react';
import { TabButton } from '../../components/tabs';

/** A plugin's list: its record type, `<plugin>:<record>` (`sales:deal`). */
export type TPluginListType = `${string}:${string}`;

/** The props of the host's saved-view tabs: the list and its "All …" label. */
export type TViewTabsProps = { recordType: TPluginListType; allLabel: string };

/**
 * The host's saved views for a list.
 * Their tabs, and the filter's reset and save while the list differs.
 */
export type TListViews = {
  Tabs: ComponentType<TViewTabsProps>;
  Changes: ComponentType<{ recordType: TPluginListType }>;
};

const ListViewsContext = createContext<TListViews | null>(null);

/** The host's saved views, for `ViewBar` and `ListFilter`. Null outside erxes. */
export const useListViews = () => use(ListViewsContext);

/**
 * Gives every list with a `recordType` saved views, as core's lists have.
 * Web provides its tabs (save, rename, share, copy a link) and the filter's save, once, around
 * the app.
 */
export const ListViewsProvider = ({
  views,
  children,
}: {
  views: TListViews;
  children: ReactNode;
}) => <ListViewsContext value={views}>{children}</ListViewsContext>;

/**
 * A list's one bar under its page header: views left, filter right.
 * The filter is `ListFilter`, with `DisplayMenu` inside it. The first tab's icon lines up with
 * the page header's first crumb. With `recordType` (`sales:deal`), the member's saved views of
 * that list show as tabs, as on core's lists; without it the list has one view, "All …"
 * (`allLabel`).
 */
export const ViewBar = ({
  allLabel,
  recordType,
  tabs,
  children,
}: {
  allLabel: string;
  /** The list's record type, `<plugin>:<record>`: its saved views show as tabs. */
  recordType?: TPluginListType;
  /** Tabs of the list's own instead. */
  tabs?: ReactNode;
  /** The list's filter. */
  children?: ReactNode;
}) => {
  const [tabsRef] = useAutoAnimate({ duration: 150 });
  const host = useListViews();

  const all = (
    <TabButton type="button" aria-current="page" active>
      <IconLayoutList />
      {allLabel}
    </TabButton>
  );

  // The host may load its tabs on first use; "All …" shows until they come.
  const saved = recordType && host && (
    <Suspense fallback={all}>
      <host.Tabs recordType={recordType} allLabel={allLabel} />
    </Suspense>
  );

  return (
    <div className="flex h-10 shrink-0 items-center gap-3 border-b bg-background pr-3">
      {/* The padding keeps focus rings inside the scrolling box. */}
      <div
        ref={tabsRef}
        className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto p-1 hide-scroll"
      >
        {tabs ?? saved ?? all}
      </div>
      <div className="flex min-w-0 max-w-13/20 shrink-0 items-center justify-end">{children}</div>
    </div>
  );
};
