import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { useTranslation } from 'react-i18next';
import { AutomationVariableBrowser } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { EmailTemplateInEditor } from '@/automations/components/builder/nodes/actions/sendEmail/components/EmailTemplateInEditor';
import { SendEmailLinkToolbar } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailLinkToolbar';
import { SendEmailContentSheetShell } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailContentSheetShell';
import { useSendEmailEmailContentEditorSheet } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailEmailContentEditorSheet';
import { BlockEditor, cn, IBlockEditor } from 'erxes-ui';
import { AttributeInEditor, useAttributes } from 'ui-modules';

const SendEmailContentAttributes = ({
  contentType,
  editor,
}: {
  contentType: string;
  editor: IBlockEditor;
}) => {
  const { attributes, loading } = useAttributes({
    contentType,
    attributesConfig: {},
    additionalAttributes: [],
    attributeTypes: [],
  });
  return (
    <AttributeInEditor
      editor={editor}
      attributes={attributes}
      loading={loading}
    />
  );
};
export const SendEmailEmailContentEditorSheet = ({
  contentType,
  variableSourceNodes,
  isSheetOpen,
  setIsSheetOpen,
  editor,
  onChange,
}: {
  contentType: string;
  variableSourceNodes: TAutomationVariableSourceNode[];
  editor: IBlockEditor;
  isSheetOpen: boolean;
  setIsSheetOpen: (isOpen: boolean) => void;
  onChange: (content: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const {
    drop: { isDragActive, handleDragOver, handleDragLeave, handleDrop },
    slashMenuItems,
    documentPlaceholderPicker,
    linkDialog,
    handleInsertVariable,
    handleInsertVariableAsLink,
    onSave,
  } = useSendEmailEmailContentEditorSheet({
    editor,
    variableSourceNodes,
    setIsSheetOpen,
    onChange,
  });

  return (
    <SendEmailContentSheetShell
      open={isSheetOpen}
      onOpenChange={setIsSheetOpen}
      title={t('send-email-edit-content-title')}
      description={t('send-email-edit-content-description')}
      onSave={onSave}
      saveLabel={t('save')}
      cancelLabel={t('cancel')}
    >
      <aside className="min-h-0 overflow-hidden border-r bg-muted/20">
        <div className="h-full min-h-0 overflow-y-auto">
          <AutomationVariableBrowser
            sourceNodes={variableSourceNodes}
            onInsertVariable={handleInsertVariable}
            onInsertVariableAsLink={handleInsertVariableAsLink}
            emptyState={{
              title: t('send-email-no-variables-title'),
              description: t('send-email-no-variables-content-description'),
            }}
            sourceSectionTitle={t('send-email-variable-sources')}
          />
        </div>
      </aside>

      <div className="min-h-0 min-w-0 overflow-y-auto bg-background p-6">
        <div
          className={cn(
            'rounded-xl border bg-background p-4 transition-colors',
            isDragActive && 'border-primary bg-primary/5',
          )}
          onDragOverCapture={handleDragOver}
          onDragLeaveCapture={handleDragLeave}
          onDropCapture={handleDrop}
        >
          <BlockEditor
            editor={editor}
            linkToolbar={false}
            additionalSlashMenuItems={slashMenuItems}
          >
            <SendEmailLinkToolbar />
            <SendEmailContentAttributes
              contentType={contentType}
              editor={editor}
            />
            <EmailTemplateInEditor editor={editor} />
          </BlockEditor>
          {documentPlaceholderPicker}
          {linkDialog}
        </div>
      </div>
    </SendEmailContentSheetShell>
  );
};
