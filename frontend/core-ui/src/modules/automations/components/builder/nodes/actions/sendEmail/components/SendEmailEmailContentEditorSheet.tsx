import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { AutomationVariableBrowser } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
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
import { BlockEditor, Button, cn, IBlockEditor } from 'erxes-ui';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  AttributeInEditor,
  insertAutomationVariableInBlockEditor,
  useAttributes,
  useAutomationVariableBlockEditorDrop,
  RecordSidePanel,
  SidePanelRecordPathContext,
  TAutomationVariableDragPayload,
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
    useEmailDocumentPlaceholder({
      editor,
    });
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
  const pagePanel = usePagePanel({
    maxWidth: 1200,
    defaultWidth: 900,
    name: 'automations/builder/nodes/actions/sendEmail/SendEmailEmailContentEditorSheet',
    open: isSheetOpen,
    onOpenChange: setIsSheetOpen,
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    <RecordSidePanel.Header
                      title={
                        <>
                          <div className="space-y-1">
                            <span>{t('send-email-edit-content-title')}</span>
                            <p>{t('send-email-edit-content-description')}</p>
                          </div>
                        </>
                      }
                      onBack={pagePanel.onBack}
                      onClose={pagePanel.onClose}
                      expanded={pagePanel.expanded}
                      onExpand={pagePanel.onExpand}
                    />
                    <div
                      className={cn(
                        'flex min-h-0 flex-1 flex-col overflow-y-auto',
                        'grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] overflow-hidden p-0',
                      )}
                    >
                      <aside className="min-h-0 overflow-hidden border-r bg-muted/20">
                        <div className="h-full min-h-0 overflow-y-auto">
                          <AutomationVariableBrowser
                            sourceNodes={variableSourceNodes}
                            onInsertVariable={handleInsertVariable}
                            onInsertVariableAsLink={handleInsertVariableAsLink}
                            emptyState={{
                              title: t('send-email-no-variables-title'),
                              description: t(
                                'send-email-no-variables-content-description',
                              ),
                            }}
                            sourceSectionTitle={t(
                              'send-email-variable-sources',
                            )}
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
                    </div>
                    <div
                      className={cn(
                        'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
                      )}
                    >
                      <Button
                        variant="outline"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        {t('cancel')}
                      </Button>
                      <Button onClick={onSave}>{t('save')}</Button>
                    </div>
                  </>
                ) : (
                  <PagePanelStatus entry={pagePanel} />
                )}
              </div>,
              pagePanel.target,
            )
          : null}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};
