import { useTranslation } from 'react-i18next';
import { AutomationVariableBrowser } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { useEmailDocumentPlaceholder } from '@/automations/components/common/EmailDocumentPlaceholderPicker';
import { EmailTemplateInEditor } from '@/automations/components/builder/nodes/actions/sendEmail/components/EmailTemplateInEditor';
import { useSendEmailLinkInsert } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailLinkDialog';
import { SendEmailLinkToolbar } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailLinkToolbar';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import {
  EmailEditorBlock,
  renderEmailBlocks,
} from '@/automations/components/builder/nodes/actions/sendEmail/utils/renderEmailBlocks';
import { insertEmailLink } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailLinkUtils';
import { BlockEditor, Button, cn, IBlockEditor, Sheet } from 'erxes-ui';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
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
  const { linkSlashMenuItems, linkDialog } = useSendEmailLinkInsert({
    editor,
    variableSourceNodes,
  });
  const slashMenuItems = useMemo(
    () => [...additionalSlashMenuItems, ...linkSlashMenuItems],
    [additionalSlashMenuItems, linkSlashMenuItems],
  );

  const handleInsertVariable = (payload: TAutomationVariableDragPayload) => {
    insertAutomationVariableInBlockEditor({
      editor,
      payload,
    });
  };

  const handleInsertVariableAsLink = (
    payload: TAutomationVariableDragPayload,
  ) => {
    insertEmailLink(editor, payload.token, payload.label);
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
            <Sheet.Title>{t('send-email-edit-content-title')}</Sheet.Title>
            <Sheet.Description>
              {t('send-email-edit-content-description')}
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
        </Sheet.Content>
        <Sheet.Footer>
          <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={onSave}>{t('save')}</Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
