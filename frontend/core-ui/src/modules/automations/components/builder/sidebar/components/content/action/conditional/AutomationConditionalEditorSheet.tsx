import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { AutomationBuilderNodeOutputVariables } from '@/automations/components/builder/sidebar/components/AutomationBuilderNodeOutputVariables';
import { useAutomationConditionalEditorSheet } from '@/automations/components/builder/sidebar/hooks/useAutomationConditionalEditorSheet';
import { Button, cn } from 'erxes-ui';
import { AutomationConditionalRulesEditor } from '@/automations/components/builder/sidebar/components/content/action/conditional/AutomationConditionalRulesEditor';
export const AutomationConditionalEditorSheet = () => {
  const { isOpen, editor, draft, setDraft, apply, cancel, onOpenChange } =
    useAutomationConditionalEditorSheet();
  const pagePanel = usePagePanel({
    maxWidth: 1000,
    defaultWidth: 720,
    name: 'automations/builder/sidebar/content/action/conditional/AutomationConditionalEditorSheet',
    open: isOpen,
    onOpenChange: onOpenChange,
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded &&
      pagePanel.allowed &&
      !(!editor || !draft) ? (
        <>
          <RecordSidePanel.Header
            title={<>{editor?.label}</>}
            {...pagePanel.headerProps}
          />
          <div className="grid min-h-0 flex-1 grid-cols-[18rem_minmax(0,1fr)]">
            <div className="min-h-0 overflow-auto border-r bg-sidebar">
              <AutomationBuilderNodeOutputVariables />
            </div>
            <div className="min-h-0 overflow-auto bg-background p-5">
              {editor && draft && (
                <AutomationConditionalRulesEditor
                  conditional={draft}
                  onChange={setDraft}
                  form={editor.form}
                  names={editor.names}
                  render={editor.render}
                />
              )}
            </div>
          </div>
          <div
            className={cn(
              'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
              'border-t px-5 py-3',
            )}
          >
            <Button type="button" variant="outline" onClick={cancel}>
              Cancel
            </Button>
            <Button type="button" onClick={apply}>
              Apply
            </Button>
          </div>
        </>
      ) : (
        <PagePanelStatus entry={pagePanel} />
      )}
    </div>,
    pagePanel,
  );
};
