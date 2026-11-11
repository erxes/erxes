import type { Icon } from '@tabler/icons-react';
import { IconChevronLeft, IconMaximize, IconX } from '@tabler/icons-react';
import { Button, cn, Tabs } from 'erxes-ui';
import { createContext, type ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';

/*
 * The part of old ui-modules `RecordSidePanel` a team member needs: a panel
 * beside the list (400px), or the record's own page (`expanded`), where the
 * overview sits in a left column and the other tabs beside it. Resizing and
 * the "+N More" overflow menu are left out: a member has only a few tabs.
 */

export interface IRecordSidePanelTab {
  value: string;
  label: string;
  icon: Icon;
  content: ReactNode;
}

const PanelExpansionContext = createContext(false);

/** Whether the nearest record panel is a full page. */
export const usePanelExpanded = () => useContext(PanelExpansionContext);

const RecordSidePanelRoot = ({
  expanded = false,
  className,
  children,
}: {
  expanded?: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <PanelExpansionContext.Provider value={expanded}>
    <aside
      data-record-side-panel
      data-expanded={expanded || undefined}
      style={{ width: expanded ? '100%' : 400 }}
      className={cn(
        '@container/record-panel relative flex flex-col flex-none max-w-full min-h-0 border-l bg-background',
        expanded
          ? 'h-full min-w-0 flex-1 border-l-0'
          : 'animate-in fade-in-0 slide-in-from-right-8 duration-200 ease-out motion-reduce:animate-none',
        className,
      )}
    >
      {children}
    </aside>
  </PanelExpansionContext.Provider>
);

/** Back, avatar and title, the record's actions, then expand and close. */
const RecordSidePanelHeader = ({
  className,
  avatar,
  title,
  actions,
  onBack,
  onExpand,
  onClose,
}: {
  className?: string;
  avatar?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  onBack?: () => void;
  onExpand?: () => void;
  onClose?: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    // Lines up with a page's breadcrumb row: h-10 plus its 1px rule.
    <div className={cn('box-content flex items-center gap-1 h-10 px-2 border-b bg-sidebar flex-none', className)}>
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 flex-none"
          onClick={onBack}
          title={t('back', 'Back')}
          aria-label={t('back', 'Back')}
        >
          <IconChevronLeft className="size-4" />
        </Button>
      )}
      {avatar}
      <div className="flex-1 min-w-0 px-1 text-sm font-medium truncate">{title}</div>
      {actions && <div className="flex flex-none items-center gap-1">{actions}</div>}
      {onExpand && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onExpand}
          title={t('expand', 'Open full view')}
          aria-label={t('expand', 'Open full view')}
        >
          <IconMaximize className="size-4" />
        </Button>
      )}
      {onClose && (
        <Button variant="ghost" size="icon" className="size-7" onClick={onClose} title={t('close', 'Close')}>
          <IconX className="size-4" />
        </Button>
      )}
    </div>
  );
};

/** Tabs under the header; on a record's page the overview becomes the left column. */
const RecordSidePanelTabs = ({
  tabs,
  value,
  onValueChange,
  overviewTab,
  overviewHeader,
}: {
  tabs: IRecordSidePanelTab[];
  value: string;
  onValueChange: (value: string) => void;
  overviewTab: string;
  overviewHeader?: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const expanded = usePanelExpanded();
  const navigationTabs = expanded ? tabs.filter((tab) => tab.value !== overviewTab) : tabs;
  const selectedValue = expanded && value === overviewTab ? (navigationTabs[0]?.value ?? value) : value;

  return (
    <Tabs
      value={selectedValue}
      onValueChange={onValueChange}
      className={cn(
        'flex-1 min-h-0 min-w-0',
        expanded
          ? 'grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] md:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)]'
          : 'flex flex-col',
      )}
    >
      {/* Lines up with a page's filter row: h-9 plus its 1px rule. */}
      <div
        className={cn(
          'flex flex-none min-w-0 overflow-hidden box-content h-9 items-center gap-1 border-b bg-background',
          expanded ? 'col-start-1 row-start-2 px-3 md:col-start-2 md:row-start-1' : 'px-2',
        )}
      >
        <Tabs.List
          aria-label={t('navigation', 'Record navigation')}
          className="flex min-w-0 items-stretch border-b-0 gap-1 py-0 h-full"
        >
          {navigationTabs.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="text-xs motion-reduce:transition-none h-full gap-1.5 rounded-none after:-mb-px"
            >
              <tab.icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>
      {tabs.map((tab) => {
        const overview = expanded && tab.value === overviewTab;

        return (
          <Tabs.Content
            key={tab.value}
            value={tab.value}
            forceMount={overview || undefined}
            className={cn(
              'flex-1 min-h-0 min-w-0 flex-col mt-0',
              overview
                ? 'col-start-1 row-start-1 flex border-b bg-background md:row-span-2 md:border-b-0 md:border-r'
                : 'data-[state=active]:flex data-[state=inactive]:hidden',
              expanded && !overview && 'col-start-1 row-start-3 md:col-start-2 md:row-start-2',
              !expanded &&
                'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-150 motion-reduce:animate-none',
            )}
          >
            {overview && overviewHeader && (
              <div className="box-content flex h-9 min-w-0 flex-none items-center gap-2 border-b px-3">
                {overviewHeader}
              </div>
            )}
            {tab.content}
          </Tabs.Content>
        );
      })}
    </Tabs>
  );
};

export const RecordSidePanel = Object.assign(RecordSidePanelRoot, {
  Header: RecordSidePanelHeader,
  Tabs: RecordSidePanelTabs,
});
