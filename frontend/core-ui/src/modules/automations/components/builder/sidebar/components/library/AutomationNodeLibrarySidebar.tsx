import { AutomationNodeLibraryTabContent } from '@/automations/components/builder/sidebar/components/library/AutomationNodeLibraryTabContent';
import { AutomationNodeLibraryTabs } from '@/automations/components/builder/sidebar/components/library/AutomationNodeLibraryTabs';
import { NodeLibraryPlacementNote } from '@/automations/components/builder/sidebar/components/library/NodeLibraryPlacementNote';
import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { AutomationNodeType } from '@/automations/types';
import { IconCheck, IconFilter, IconX } from '@tabler/icons-react';
import { Badge, Button, cn, Command, Popover, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAutomationBuilderSidebarHooks } from '../../hooks/useAutomationBuilderSidebarHooks';
import { IAutomationsActionConfigConstants } from 'ui-modules';
import {
  nodeLibraryTabContentOf,
  useAutomationNodeLibrarySidebarFilters,
} from '../../hooks/useAutomationNodeLibrarySidebarFilters';
import { AutomationNodeLibraryActionGroupFilterProvider } from '../../context/AutomationNodeLibraryActionGroupFilterContext';
import { AutomationNodeLibraryProvider } from '../../context/AutomationNodeLibraryProvider';
import { WorkflowNodeLibraryContent } from './WorkflowNodeLibraryContent';

const SidebarPanelHeader = ({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('automations');

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
          <Button
            size="icon"
            variant="secondary"
            aria-label={t('sidebar-close')}
            onClick={onClose}
          >
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
        <AutomationNodeLibraryProvider
          loading={loading}
          error={error}
          refetch={refetch}
          onDragStart={onDragStart}
          onSelectNode={onSelectNode}
        >
          <AutomationNodeLibraryActionGroupFilterProvider>
            <AutomationNodeLibrarySidebarContent
              activeNodeTab={activeNodeTab}
              config={config}
            />
          </AutomationNodeLibraryActionGroupFilterProvider>
        </AutomationNodeLibraryProvider>
      </div>
    </div>
  );
};

const AutomationNodeLibrarySidebarContent = ({
  activeNodeTab,
  config,
}: {
  activeNodeTab: AutomationNodeType;
  config: ReturnType<typeof useAutomationNodeLibrarySidebar>['config'];
}) => {
  const { t } = useTranslation('automations');
  const { isWorkflow, listType } = nodeLibraryTabContentOf(activeNodeTab);

  return (
    <Command className="flex h-full min-h-0 flex-col gap-0 bg-sidebar">
      <AutomationNodeLibraryTabs activeNodeTab={activeNodeTab} />
      <NodeLibraryPlacementNote />
      <div className="flex shrink-0 flex-row gap-2 px-5 py-4">
        <Command.Input
          placeholder={t('search')}
          variant="primary"
          wrapperClassName="m-0 flex-1 rounded-md bg-background shadow-xs"
          autoFocus
        />
        {!isWorkflow && (
          <AutomationNodeLibrarySidebarFilters
            activeNodeTab={activeNodeTab}
            list={config.list as IAutomationsActionConfigConstants[]}
          />
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-5 pb-4">
        <div
          key={activeNodeTab}
          className="h-full w-full overflow-auto p-0 pr-1 animate-in fade-in-0 duration-150"
        >
          {isWorkflow ? (
            <WorkflowNodeLibraryContent />
          ) : (
            <AutomationNodeLibraryTabContent
              type={listType}
              list={config.list}
            />
          )}
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
  const { t } = useTranslation('automations');
  const { isOpen, setIsOpen, activeGroup, groupOptions, clearGroup } =
    useAutomationNodeLibrarySidebarFilters(activeNodeTab, list);

  if (!groupOptions.length) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            'size-9 relative',
            activeGroup &&
              'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10',
          )}
          aria-label={t('filter-by-type')}
        >
          <IconFilter className="size-4" />
          {activeGroup && (
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
          )}
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
          {activeGroup && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={clearGroup}
            >
              {t('sidebar-clear')}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {groupOptions.map(({ group, isActive, choose }) => (
            <Badge
              key={group}
              variant={isActive ? 'default' : 'secondary'}
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border bg-muted/40 text-foreground hover:bg-muted',
              )}
              onClick={choose}
            >
              {isActive && <IconCheck className="size-3" />}
              {group}
            </Badge>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
};
