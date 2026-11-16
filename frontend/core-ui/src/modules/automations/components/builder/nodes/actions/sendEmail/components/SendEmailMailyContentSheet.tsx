import { EmailTemplateSelector } from '@/automations/components/builder/nodes/actions/sendEmail/components/EmailTemplateSelector';
import { SendEmailContentSheetShell } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailContentSheetShell';
import { useSendEmailMailyContentSheet } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailMailyContentSheet';
import {
  AutomationVariableBrowser,
  TAutomationVariableSourceNode,
} from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { EmailContentEditor } from '@/emailTemplates/components/EmailContentEditor';
import { IconEdit } from '@tabler/icons-react';
import { Button, JSONContent } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SendEmailMailyContentSheet = ({
  contentJson,
  contentType,
  content,
  variableSourceNodes,
  onChange,
}: {
  contentJson?: JSONContent;
  /** Whose fields the editor offers — the record this action runs for. */
  contentType?: string;
  content: string;
  variableSourceNodes: TAutomationVariableSourceNode[];
  onChange: (contentJson: JSONContent) => void;
}) => {
  const { t } = useTranslation('automations');
  const {
    isOpen,
    setIsOpen,
    isHovered,
    showHover,
    hideHover,
    setEditor,
    draft,
    setDraft,
    teaser,
    variables,
    extensions,
    insertFromBrowser,
    openSheet,
    openSheetFromButton,
    onSave,
  } = useSendEmailMailyContentSheet({ contentJson, onChange });

  return (
    <div className="flex flex-col gap-2">
      <EmailTemplateSelector content={content} format="maily" />

      {/* The sidebar is too narrow to write an email in, so it only shows
          which email this is and opens the editor full width. */}
      <div
        className="group relative h-52 cursor-pointer overflow-hidden rounded-lg border bg-background p-4"
        onMouseEnter={showHover}
        onMouseLeave={hideHover}
        onClick={openSheet}
      >
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {teaser || t('send-email-nothing-written')}
        </p>

        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={openSheetFromButton}
            >
              <IconEdit className="size-4" />
              {t('send-email-edit-content')}
            </Button>
          </div>
        )}
      </div>

      <SendEmailContentSheetShell
        open={isOpen}
        onOpenChange={setIsOpen}
        title={t('send-email-edit-content-title')}
        description={t('send-email-edit-content-description')}
        onSave={onSave}
        saveLabel={t('save')}
        cancelLabel={t('cancel')}
      >
        {/* What earlier steps produced, to drag into the email. */}
        <aside className="min-h-0 overflow-hidden border-r bg-muted/20">
          <div className="h-full min-h-0 overflow-y-auto">
            <AutomationVariableBrowser
              sourceNodes={variableSourceNodes}
              onInsertVariable={insertFromBrowser}
              emptyState={{
                title: t('send-email-no-variables-title'),
                description: t('send-email-no-variables-content-description'),
              }}
              sourceSectionTitle={t('send-email-variable-sources')}
            />
          </div>
        </aside>

        <div className="min-h-0 min-w-0 overflow-y-auto bg-background p-6">
          <div className="rounded-xl border bg-background p-4">
            <EmailContentEditor
              contentJson={draft}
              onChange={setDraft}
              onCreate={setEditor}
              contentType={contentType}
              extensions={extensions}
              extraVariables={variables}
            />
          </div>
        </div>
      </SendEmailContentSheetShell>
    </div>
  );
};
