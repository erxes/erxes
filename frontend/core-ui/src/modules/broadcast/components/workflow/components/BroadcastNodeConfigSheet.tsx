import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { AutomationBuilderNodeMetaEditor } from '@/automations/components/builder/sidebar/components/AutomationBuilderNodeMetaEditor';
import { AutomationBuilderNodeOutputVariables } from '@/automations/components/builder/sidebar/components/AutomationBuilderNodeOutputVariables';
import { AutomationBuilderReadOnlyFieldset } from '@/automations/components/builder/sidebar/components/AutomationBuilderReadOnlyFieldset';
import { AutomationBuilderVariablesHelpPopover } from '@/automations/components/builder/sidebar/components/AutomationBuilderVariablesHelpPopover';
import { AutomationActionContentSidebar } from '@/automations/components/builder/sidebar/components/content/action/AutomationActionContentSidebar';
import { AutomationActionTargetSelector } from '@/automations/components/builder/sidebar/components/content/action/AutomationActionTargetSelector';
import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { Empty, IconComponent, Separator } from 'erxes-ui';
import { AutomationVariableInsertionProvider } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const BroadcastNodeConfigSheet = () => {
  const { t } = useTranslation('broadcasts');

  const { activeNode, handleClose } = useAutomationBuilderSidebarHooks();

  return (
    <CoreModulePanel
      maxWidth={1000}
      defaultWidth={720}
      name={'broadcast/workflow/BroadcastNodeConfigSheet'}
      open={!!activeNode}
      onOpenChange={(open) => !open && handleClose()}
    >
      <CoreModulePanel.View
        notFound={!activeNode}
        className="w-[calc(100vw-1rem)] bg-background p-0 sm:max-w-none md:w-auto md:max-w-[calc(100vw-1rem)]"
      >
        {activeNode && (
          <AutomationVariableInsertionProvider>
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex shrink-0 items-start gap-3 px-4 py-4">
                <Empty.Media variant="icon" className="size-8 [&>svg]:size-4">
                  <IconComponent name={activeNode.icon} />
                </Empty.Media>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <AutomationBuilderNodeMetaEditor activeNode={activeNode} />
                </div>
                <CoreModulePanel.Close className="size-7" />
              </div>
              <Separator />

              <div className="flex min-h-0 min-w-0 flex-1 flex-row">
                {/* The width the widest built-in action form lays itself out
                    at. It never grows past that, and shrinks (scrolling its
                    own content) when the viewport cannot give it that much. */}
                <div className="flex w-[650px] min-w-0 flex-col overflow-auto">
                  <AutomationActionTargetSelector activeNode={activeNode} />
                  <AutomationBuilderReadOnlyFieldset>
                    <AutomationActionContentSidebar />
                  </AutomationBuilderReadOnlyFieldset>
                </div>

                {/* Kept open rather than toggled: a variable is inserted into
                    whichever field was last focused, so the browser is only
                    useful while the form it feeds is on screen. */}
                <div className="flex w-72 shrink-0 flex-col border-l bg-sidebar">
                  <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
                    <h3 className="text-sm font-semibold">
                      {t('workflow.variables')}
                    </h3>
                    <AutomationBuilderVariablesHelpPopover />
                  </div>
                  <Separator />
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <AutomationBuilderNodeOutputVariables />
                  </div>
                </div>
              </div>
            </div>
          </AutomationVariableInsertionProvider>
        )}
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
