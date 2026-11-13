import { IconChevronDown } from '@tabler/icons-react';
import { Button, cn, DropdownMenu, Tabs } from 'erxes-ui';
import { type Ref, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelExpansionContext } from './panelExpansion';
import type { IRecordSidePanelTab, RecordSidePanelTabsProps } from './recordSidePanelTypes';
import { useTabFit } from './useTabFit';

/** Collapsed: a row of tabs over the content. Expanded: a sidebar, or an overview column beside the tabs. */
const layoutOf = (expanded: boolean, splitOverview: boolean) => {
  if (splitOverview) {
    return {
      content:
        'grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] md:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)]',
      navigation:
        'col-start-1 row-start-2 box-content h-9 items-center gap-1 border-b bg-background px-3 md:col-start-2 md:row-start-1',
    };
  }

  if (expanded) {
    return {
      content: 'flex flex-row',
      navigation: 'w-14 flex-col overflow-y-auto border-r bg-sidebar p-2 sm:w-48 sm:p-3',
    };
  }

  return {
    content: 'flex flex-col',
    navigation: 'box-content items-center gap-1 h-9 px-2 border-b bg-background',
  };
};

/** The tab triggers that fit, and a "+N More" menu with the rest. */
const TabBar = ({
  barRef,
  className,
  visible,
  overflow,
  sidebar,
  compact,
  expanded,
  onValueChange,
}: {
  barRef: Ref<HTMLDivElement>;
  className: string;
  visible: IRecordSidePanelTab[];
  overflow: IRecordSidePanelTab[];
  /** Expanded without an overview: the tabs run down a sidebar. */
  sidebar: boolean;
  compact: boolean;
  expanded: boolean;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    // Lines up with a page's filter row: h-9 plus its 1px rule. Never wider than its
    // container: pinning a tab moves tabs into More instead of widening the panel's holder.
    <div ref={barRef} className={cn('flex flex-none min-w-0 overflow-hidden', className)}>
      <Tabs.List
        aria-label={t('navigation', 'Record navigation')}
        className={cn(
          'flex min-w-0 items-stretch border-b-0 gap-1 py-0',
          sidebar ? 'flex-col' : 'h-full',
        )}
      >
        {visible.map((tab) => (
          // Full row height, so the active underline lands on the row's bottom border.
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            data-panel-tab={tab.value}
            title={expanded ? tab.label : undefined}
            className={cn(
              'text-xs motion-reduce:transition-none',
              sidebar
                ? 'h-9 justify-start gap-2.5 rounded-md px-2.5 after:hidden data-[state=active]:bg-primary/10 data-[state=active]:hover:bg-primary/10'
                : 'h-full gap-1.5 rounded-none after:-mb-px',
            )}
          >
            <tab.icon
              className={cn('size-4 shrink-0', compact && !sidebar && 'hidden')}
              aria-hidden="true"
            />
            <span className={sidebar ? 'sr-only sm:not-sr-only' : undefined}>{tab.label}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenu.Trigger
            render={<Button variant="ghost" size="sm" className="text-accent-foreground" />}
          >
            {t('more', '+{{count}} More', { count: overflow.length })}
            <IconChevronDown />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            {overflow.map((tab) => (
              <DropdownMenu.Item key={tab.value} onClick={() => onValueChange(tab.value)}>
                <tab.icon />
                {tab.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    </div>
  );
};

/** One tab's content; the overview gets its own column (and header) on a split layout. */
const TabContent = ({
  tab,
  isOverview,
  splitOverview,
  keepMounted,
  overviewHeader,
}: {
  tab: IRecordSidePanelTab;
  isOverview: boolean;
  splitOverview: boolean;
  keepMounted: boolean;
  overviewHeader?: React.ReactNode;
}) => (
  <Tabs.Content
    value={tab.value}
    forceMount={keepMounted || undefined}
    // A widget's own header lines up with a page's filter row (37px). A quick fade when
    // switching tabs or opening another record in the panel; a record's page opens without one.
    className={cn(
      'flex-1 min-h-0 min-w-0 flex-col [&_[data-side-menu-header]]:h-9',
      !splitOverview &&
        'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-150 motion-reduce:animate-none',
      splitOverview && isOverview
        ? 'col-start-1 row-start-1 flex border-b bg-background md:row-span-2 md:border-b-0 md:border-r'
        : 'data-[state=active]:flex data-[state=inactive]:hidden',
      splitOverview && !isOverview && 'col-start-1 row-start-3 md:col-start-2 md:row-start-2',
    )}
  >
    {splitOverview && isOverview && overviewHeader && (
      <div className="box-content flex h-9 min-w-0 flex-none items-center gap-2 border-b px-3">
        {overviewHeader}
      </div>
    )}
    {tab.content}
  </Tabs.Content>
);

/** The tabs that show: an active tab picked from More takes the last visible slot. */
const visibleTabs = (tabs: IRecordSidePanelTab[], shownCount: number, selected: string) => {
  const activeIndex = tabs.findIndex((tab) => tab.value === selected);
  const activeTab = tabs[activeIndex];

  return activeTab && activeIndex >= shownCount
    ? [...tabs.slice(0, shownCount - 1), activeTab]
    : tabs.slice(0, shownCount);
};

/**
 * The first `visibleCount` tabs show as triggers; the rest sit behind a "+N More" menu.
 * Visited editors stay mounted when there is an overview tab.
 */
export const RecordSidePanelTabs = ({
  expanded: controlledExpanded,
  tabs,
  value,
  onValueChange,
  visibleCount = 3,
  overviewTab,
  overviewHeader,
  expandedDefaultTab,
}: RecordSidePanelTabsProps) => {
  const contextExpanded = useContext(PanelExpansionContext)?.expanded ?? false;
  const expanded = controlledExpanded ?? contextExpanded;
  const splitOverview = expanded && Boolean(overviewTab);
  const sidebar = expanded && !splitOverview;
  const navigationTabs = splitOverview ? tabs.filter((tab) => tab.value !== overviewTab) : tabs;

  const selectedValue =
    splitOverview && value === overviewTab
      ? expandedDefaultTab || navigationTabs[0]?.value || value
      : value;

  const [visitedTabs, setVisitedTabs] = useState<string[]>([]);

  if (overviewTab && !visitedTabs.includes(selectedValue)) {
    setVisitedTabs([...visitedTabs, selectedValue]);
  }

  const { barRef, fitCount, compact } = useTabFit({
    tabValues: navigationTabs.map((tab) => tab.value),
    visibleCount,
    active: !sidebar,
  });

  const visible = visibleTabs(
    navigationTabs,
    sidebar ? navigationTabs.length : fitCount,
    selectedValue,
  );

  const layout = layoutOf(expanded, splitOverview);

  return (
    <Tabs
      value={selectedValue}
      onValueChange={onValueChange}
      orientation={sidebar ? 'vertical' : 'horizontal'}
      className={cn('flex-1 min-h-0 min-w-0', layout.content)}
    >
      <TabBar
        barRef={barRef}
        className={layout.navigation}
        visible={visible}
        overflow={navigationTabs.filter((tab) => !visible.includes(tab))}
        sidebar={sidebar}
        compact={compact}
        expanded={expanded}
        onValueChange={onValueChange}
      />
      {tabs.map((tab) => (
        <TabContent
          key={tab.value}
          tab={tab}
          isOverview={tab.value === overviewTab}
          splitOverview={splitOverview}
          keepMounted={
            tab.value === overviewTab || (Boolean(overviewTab) && visitedTabs.includes(tab.value))
          }
          overviewHeader={overviewHeader}
        />
      ))}
    </Tabs>
  );
};
