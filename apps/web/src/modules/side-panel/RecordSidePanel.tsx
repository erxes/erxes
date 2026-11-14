import { cn } from 'erxes-ui';
import { type RefObject, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PanelExpansionContext } from './panelExpansion';
import { RecordSidePanelHeader } from './RecordSidePanelHeader';
import { RecordSidePanelResizeHandle } from './RecordSidePanelResizeHandle';
import { RecordSidePanelTabs } from './RecordSidePanelTabs';
import type { RecordSidePanelLayoutProps, RecordSidePanelRootProps } from './recordSidePanelTypes';
import { clampWidth } from './resizeDrag';
import { SIDE_PANEL_WIDTH } from './sidePanelPaths';

export { usePanelExpanded } from './panelExpansion';

export type { IRecordSidePanelTab } from './recordSidePanelTypes';

/** Animates the panel growing or shrinking when it expands or collapses (not on mount). */
const useExpandMotion = (panelRef: RefObject<HTMLElement | null>, expanded: boolean) => {
  const previousExpanded = useRef(expanded);

  useLayoutEffect(() => {
    const changed = previousExpanded.current !== expanded;
    previousExpanded.current = expanded;

    const panel = panelRef.current;

    if (!changed || !panel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    // Animate the committed layout without fading or restarting entry motion.
    const animation = panel.animate(
      [
        {
          transform: `translateX(${expanded ? 20 : -12}px) scaleX(0.985)`,
          transformOrigin: 'top right',
        },
        { transform: 'none', transformOrigin: 'top right' },
      ],
      { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );

    return () => animation.cancel();
  }, [panelRef, expanded]);
};

/** A record shown beside its list, the list staying usable: a header and tabs. */
const RecordSidePanelRoot = ({
  className,
  width = SIDE_PANEL_WIDTH.default,
  maxWidth = SIDE_PANEL_WIDTH.max,
  onWidthChange,
  expanded: controlledExpanded,
  expandedMode = 'viewport',
  onExpandedChange,
  expandable = true,
  children,
}: RecordSidePanelRootProps) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;
  // A panel opening expanded is a page, which has nothing to slide in from.
  const [entering, setEntering] = useState(!expanded);
  const [wasExpanded, setWasExpanded] = useState(expanded);
  const panelRef = useRef<HTMLElement>(null);

  if (wasExpanded !== expanded) {
    setWasExpanded(expanded);
    setEntering(false);
  }

  useExpandMotion(panelRef, expanded);

  const toggle = useCallback(() => {
    setEntering(false);
    setInternalExpanded(!expanded);
    onExpandedChange?.(!expanded);
  }, [expanded, onExpandedChange]);

  const expansion = useMemo(
    () => ({ expanded, toggle: expandable ? toggle : undefined }),
    [expanded, expandable, toggle],
  );

  const upperBound = Math.max(SIDE_PANEL_WIDTH.min, maxWidth);
  const panelWidth = clampWidth(width, upperBound);

  return (
    <PanelExpansionContext.Provider value={expansion}>
      <aside
        ref={panelRef}
        data-record-side-panel
        data-expanded={expanded || undefined}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) setEntering(false);
        }}
        style={{ '--panel-width': `${panelWidth}px` }}
        className={cn(
          '@container/record-panel relative flex flex-col flex-none max-w-full min-h-0 border-l bg-background transition-none',
          expanded ? 'w-full' : 'w-(--panel-width)',
          expanded &&
            (expandedMode === 'page'
              ? 'relative h-full min-w-0 flex-1 border-l-0'
              : 'fixed inset-0 z-40 h-svh border-l-0'),
          // Animate entry only: duration-200 must never ease drag width changes.
          entering &&
            'animate-in fade-in-0 slide-in-from-right-8 duration-200 ease-out motion-reduce:animate-none',
          className,
        )}
      >
        {onWidthChange && !expanded && (
          <RecordSidePanelResizeHandle
            width={panelWidth}
            maxWidth={upperBound}
            onWidthChange={onWidthChange}
          />
        )}
        {children}
      </aside>
    </PanelExpansionContext.Provider>
  );
};

/** Shares the customer record layout across core and plugin-owned records. */
const RecordSidePanelLayout = ({
  header,
  profile,
  overviewTab,
  expandedDefaultTab,
  ...props
}: RecordSidePanelLayoutProps) => {
  const detailTab =
    overviewTab ??
    props.tabs.find((tab) => tab.value === 'detail' || tab.value === 'overview')?.value;

  const activityTab =
    expandedDefaultTab ?? props.tabs.find((tab) => tab.value === 'activity')?.value;

  return (
    <>
      {header}
      {profile}
      <RecordSidePanelTabs {...props} overviewTab={detailTab} expandedDefaultTab={activityTab} />
    </>
  );
};

export const RecordSidePanel = Object.assign(RecordSidePanelRoot, {
  Header: RecordSidePanelHeader,
  Layout: RecordSidePanelLayout,
  Tabs: RecordSidePanelTabs,
});
