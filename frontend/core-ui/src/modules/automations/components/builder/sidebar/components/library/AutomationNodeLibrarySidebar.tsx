import { TabContentWrapper } from '@/automations/components/builder/sidebar/components/library/TabContentWrapper';
import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { AutomationNodeType } from '@/automations/types';
import { IconX } from '@tabler/icons-react';
import { Button, Command, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAutomationBuilderSidebarHooks } from '../../hooks/useAutomationBuilderSidebarHooks';

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
        <Command className="flex h-full min-h-0 flex-col gap-0 bg-sidebar">
          <div className="shrink-0 px-5 py-4">
            <Command.Input
              placeholder={t('search')}
              variant="primary"
              wrapperClassName="m-0 rounded-md bg-background shadow-xs"
              autoFocus
            />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden px-5 pb-4">
            <div className="h-full w-full overflow-auto p-0 pr-1">
              <Command.Group className="mx-auto max-w-[420px] p-0 [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-2">
                <TabContentWrapper
                  {...commonTabContentProps}
                  type={
                    activeNodeTab === AutomationNodeType.Action
                      ? AutomationNodeType.Action
                      : AutomationNodeType.Trigger
                  }
                  list={config.list}
                />
              </Command.Group>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
};
