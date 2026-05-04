import { TabContentWrapper } from '@/automations/components/builder/sidebar/components/library/TabContentWrapper';
import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { AutomationNodeType } from '@/automations/types';
import { Command, Tabs, Separator, Button } from 'erxes-ui';
import { useAutomationBuilderSidebarHooks } from '../../hooks/useAutomationBuilderSidebarHooks';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

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
    actionsConst,
    setQueryParams,
    activeNodeTab,
    triggersConst,
    loading,
    error,
    refetch,
    onDragStart,
  } = useAutomationNodeLibrarySidebar();
  const { handleClose } = useAutomationBuilderSidebarHooks();
  const { t } = useTranslation('automations');
  const commonTabContentProps = {
    loading,
    error,
    refetch,
    onDragStart,
  };

  return (
    <Tabs
      defaultValue={activeNodeTab || AutomationNodeType.Trigger}
      value={activeNodeTab || AutomationNodeType.Trigger}
      onValueChange={(value) =>
        setQueryParams({ activeNodeTab: value as AutomationNodeType })
      }
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
    >
      <Tabs.Content
        value={AutomationNodeType.Trigger}
        className="shrink-0 bg-background"
      >
        <SidebarPanelHeader
          title={t('choose-trigger-type')}
          description={t('trigger-type-description')}
          onClose={handleClose}
        />
      </Tabs.Content>
      <Tabs.Content
        value={AutomationNodeType.Action}
        className="shrink-0 bg-background"
      >
        <SidebarPanelHeader
          title={t('choose-action-type')}
          description={t('action-type-description')}
          onClose={handleClose}
        />
      </Tabs.Content>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Command className="flex h-full min-h-0 flex-col gap-0 bg-sidebar">
          <div className="shrink-0 px-5 py-4">
            <Command.Input
              placeholder={t('search')}
              variant="primary"
              wrapperClassName="m-0 rounded-md bg-white shadow-xs"
              autoFocus
            />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
            {[
              {
                type: AutomationNodeType.Trigger,
                list: triggersConst,
              },
              { type: AutomationNodeType.Action, list: actionsConst },
            ].map(({ type, list = [] }, index) => (
              <Tabs.Content
                key={index}
                value={type}
                className="h-full w-full overflow-auto p-0 pr-1"
              >
                <Command.Group className="p-0 [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-3">
                  <TabContentWrapper
                    {...commonTabContentProps}
                    type={type}
                    list={list}
                  />
                </Command.Group>
              </Tabs.Content>
            ))}
          </div>
          {/* // TODO  */}
          {/* <Tabs.Content
          className="space-y-2 "
          value={AutomationNodeType.Workflow}
        >
          <Command.Group>
            <WorkflowsNodeLibrary {...commonTabContentProps} />
            </Command.Group>
            </Tabs.Content> */}
        </Command>
      </div>
    </Tabs>
  );
};
