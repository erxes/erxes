import { AutomationBuilderNodeOutputVariables } from '@/automations/components/builder/sidebar/components/AutomationBuilderNodeOutputVariables';
import { useAutomationConditionalEditorSheet } from '@/automations/components/builder/sidebar/hooks/useAutomationConditionalEditorSheet';
import { Button, Sheet } from 'erxes-ui';
import { AutomationConditionalRulesEditor } from '@/automations/components/builder/sidebar/components/content/action/conditional/AutomationConditionalRulesEditor';

export const AutomationConditionalEditorSheet = () => {
  const { isOpen, editor, draft, setDraft, apply, cancel, onOpenChange } =
    useAutomationConditionalEditorSheet();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <Sheet.View
        side="right"
        className="flex w-screen max-w-none flex-col p-0 sm:max-w-[min(72rem,calc(100vw-2rem))]"
      >
        <Sheet.Header className="h-auto flex-col items-start gap-1 py-4">
          <Sheet.Title>{editor?.label}</Sheet.Title>
          <Sheet.Description>
            Rows are checked top to bottom; the first match sets the value.
          </Sheet.Description>
        </Sheet.Header>
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
        <Sheet.Footer className="border-t px-5 py-3">
          <Button type="button" variant="outline" onClick={cancel}>
            Cancel
          </Button>
          <Button type="button" onClick={apply}>
            Apply
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
