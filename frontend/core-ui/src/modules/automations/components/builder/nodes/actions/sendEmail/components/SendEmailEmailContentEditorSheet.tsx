import { AutomationVariableBrowser } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { useEmailDocumentPlaceholder } from '@/automations/components/common/EmailDocumentPlaceholderPicker';
import { EmailTemplateInEditor } from '@/automations/components/builder/nodes/actions/sendEmail/components/EmailTemplateInEditor';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import {
  EmailEditorBlock,
  renderEmailBlocks,
} from '@/automations/components/builder/nodes/actions/sendEmail/utils/renderEmailBlocks';
import { BlockEditor, Button, cn, IBlockEditor, Sheet } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AttributeInEditor,
  insertAutomationVariableInBlockEditor,
  TAutomationVariableDragPayload,
  useAttributes,
  useAutomationVariableBlockEditorDrop,
} from 'ui-modules';

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
  const { setValue } = useFormContext<TAutomationSendEmailConfig>();
  const { isDragActive, handleDragOver, handleDragLeave, handleDrop } =
    useAutomationVariableBlockEditorDrop({
      editor,
    });
  const { additionalSlashMenuItems, documentPlaceholderPicker } =
    useEmailDocumentPlaceholder({ editor });

  const handleInsertVariable = (payload: TAutomationVariableDragPayload) => {
    insertAutomationVariableInBlockEditor({
      editor,
      payload,
    });
  };

  const onSave = () => {
    onChange(JSON.stringify(editor.document));
    setValue(
      'html',
      renderEmailBlocks(editor.document as readonly EmailEditorBlock[]),
    );
    setIsSheetOpen(false);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <Sheet.View className="md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
        <Sheet.Header>
          <div className="space-y-1">
            <Sheet.Title>{t('edit-email-content', 'Edit Email Content')}</Sheet.Title>
            <Sheet.Description>
              {t(
                'edit-email-content-description',
                'Edit the email content for the email action.',
              )}
            </Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] overflow-hidden p-0">
          <aside className="min-h-0 overflow-hidden border-r bg-muted/20">
            <div className="h-full min-h-0 overflow-y-auto">
              <AutomationVariableBrowser
                sourceNodes={variableSourceNodes}
                onInsertVariable={handleInsertVariable}
                emptyState={{
                  title: t(
                    'no-variables-available-yet',
                    'No variables available yet',
                  ),
                  description: t(
                    'no-variables-available-description',
                    'Add a trigger or an earlier action to this automation to insert variables into the email content.',
                  ),
                }}
                sourceSectionTitle={t('variable-sources', 'Variable Sources')}
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
                additionalSlashMenuItems={additionalSlashMenuItems}
              >
                <SendEmailContentAttributes
                  contentType={contentType}
                  editor={editor}
                />
                <EmailTemplateInEditor editor={editor} />
              </BlockEditor>
              {documentPlaceholderPicker}
            </div>
          </div>
        </Sheet.Content>
        <Sheet.Footer>
          <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={onSave}>{t('save', 'Save')}</Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
