import { TabContentWrapper } from '@/automations/components/builder/sidebar/components/library/TabContentWrapper';
import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { AutomationNodeType } from '@/automations/types';
import { IconCheck, IconFilter, IconX } from '@tabler/icons-react';
import { Badge, Button, cn, Command, Popover, Separator } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutomationBuilderSidebarHooks } from '../../hooks/useAutomationBuilderSidebarHooks';
import { IAutomationsActionConfigConstants } from 'ui-modules';
import {
  groupActionsByType,
  getActionGroupBadges,
} from '../../utils/automationNodeLibrarySidebarUtils';
import {
  AutomationNodeLibraryActionGroupFilterProvider,
  useAutomationNodeLibraryActionGroupFilter,
} from '../../context/AutomationNodeLibraryActionGroupFilterContext';

const SidebarPanelHeader = ({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) => {
  return (
    <>
      <div className="shrink-0 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold leading-none">{title}</h3>
            <p className="max-w-sm text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
          <Button size="icon" variant="secondary" onClick={onClose}>
            <IconX className="size-4" />
          </Button>
        </div>
      </div>
      <Separator />
    </>
  );
};

export const AutomationNodeLibrarySidebar = () => {
  const {
    activeNodeTab,
    loading,
    error,
    refetch,
    onDragStart,
    onSelectNode,
    config,
  } = useAutomationNodeLibrarySidebar();
  const { handleClose } = useAutomationBuilderSidebarHooks();
  const { t } = useTranslation('automations');
  const commonTabContentProps = {
    loading,
    error,
    refetch,
    onDragStart,
    onSelectNode,
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 bg-background">
        <SidebarPanelHeader
          title={t(config.title)}
          description={t(config.description)}
          onClose={handleClose}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AutomationNodeLibraryActionGroupFilterProvider>
          <AutomationNodeLibrarySidebarContent
            activeNodeTab={activeNodeTab}
            config={config}
            commonTabContentProps={commonTabContentProps}
          />
        </AutomationNodeLibraryActionGroupFilterProvider>
      </div>
    </div>
  );
};

const AutomationNodeLibrarySidebarContent = ({
  activeNodeTab,
  config,
  commonTabContentProps,
}: {
  activeNodeTab: AutomationNodeType;
  config: ReturnType<typeof useAutomationNodeLibrarySidebar>['config'];
  commonTabContentProps: Pick<
    ReturnType<typeof useAutomationNodeLibrarySidebar>,
    'loading' | 'error' | 'refetch' | 'onDragStart' | 'onSelectNode'
  >;
}) => {
  const { t } = useTranslation('automations');
  const { activeActionGroup } = useAutomationNodeLibraryActionGroupFilter();
  const actionGroups = useMemo(
    () =>
      activeNodeTab === AutomationNodeType.Action
        ? getActionGroupBadges(
            config.list as IAutomationsActionConfigConstants[],
          )
        : [],
    [activeNodeTab, config.list],
  );
  const groupedActions = useMemo(() => {
    if (activeNodeTab !== AutomationNodeType.Action) {
      return undefined;
    }

    return groupActionsByType({
      actions: config.list as IAutomationsActionConfigConstants[],
      groups: actionGroups,
      activeGroup: activeActionGroup,
    });
  }, [activeActionGroup, activeNodeTab, actionGroups, config.list]);

  return (
    <Command className="flex h-full min-h-0 flex-col gap-0 bg-sidebar">
      <div className="flex shrink-0 flex-row gap-2 px-5 py-4">
        <Command.Input
          placeholder={t('search')}
          variant="primary"
          wrapperClassName="m-0 flex-1 rounded-md bg-background shadow-xs"
          autoFocus
        />
        <AutomationNodeLibrarySidebarFilters
          activeNodeTab={activeNodeTab}
          list={config.list as IAutomationsActionConfigConstants[]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-5 pb-4">
        <div className="h-full w-full overflow-auto p-0 pr-1">
          <TabContentWrapper
            {...commonTabContentProps}
            type={
              activeNodeTab === AutomationNodeType.Action
                ? AutomationNodeType.Action
                : AutomationNodeType.Trigger
            }
            list={config.list}
            groups={groupedActions}
          />
        </div>
      </div>
    </Command>
  );
};

const AutomationNodeLibrarySidebarFilters = ({
  activeNodeTab,
  list,
}: {
  activeNodeTab: AutomationNodeType;
  list: IAutomationsActionConfigConstants[];
}) => {
  const [isGroupPopoverOpen, setIsGroupPopoverOpen] = useState(false);
  const { activeActionGroup, setActiveActionGroup } =
    useAutomationNodeLibraryActionGroupFilter();

  const { t } = useTranslation('automations');

  const actionGroups = useMemo(
    () =>
      activeNodeTab === AutomationNodeType.Action
        ? getActionGroupBadges(list as IAutomationsActionConfigConstants[])
        : [],
    [activeNodeTab, list],
  );

  if (!actionGroups?.length) {
    return null;
  }

  return (
    <Popover open={isGroupPopoverOpen} onOpenChange={setIsGroupPopoverOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            'size-9 relative',
            activeActionGroup &&
              'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10',
          )}
          aria-label={t('filter-by-type')}
        >
          <IconFilter className="size-4" />
          {activeActionGroup ? (
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
          ) : null}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="end"
        sideOffset={8}
        className="w-96 rounded-lg border bg-background p-3 shadow-xl"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('filter-by-type')}
          </span>
          {activeActionGroup ? (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => {
                setActiveActionGroup(null);
                setIsGroupPopoverOpen(false);
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {actionGroups.map((group) => {
            const isActive = activeActionGroup === group;

            return (
              <Badge
                key={group}
                variant={isActive ? 'default' : 'secondary'}
                className={cn(
                  'flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : 'border-border bg-muted/40 text-foreground hover:bg-muted',
                )}
                onClick={() => {
                  setActiveActionGroup(isActive ? null : group);
                  setIsGroupPopoverOpen(false);
                }}
              >
                {isActive ? <IconCheck className="size-3" /> : null}
                {group}
              </Badge>
            );
          })}
        </div>
      </Popover.Content>
    </Popover>
  );
};
