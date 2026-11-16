import { useTranslation } from 'react-i18next';
import { EmailTemplateSelector } from '@/automations/components/builder/nodes/actions/sendEmail/components/EmailTemplateSelector';
import { SendEmailEmailContentEditorSheet } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailEmailContentEditorSheet';
import { SendEmailEmailContentPreview } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailEmailContentPreview';
import { useSendEmailEmailContentBuilder } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailEmailContentBuilder';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { SendEmailMailyContentSheet } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailMailyContentSheet';
import { Button } from 'erxes-ui';

interface SendEmailEmailContentBuilderProps {
  content: string;
  contentType: string;
  variableSourceNodes: TAutomationVariableSourceNode[];
  onChange: (content: string) => void;
}

export const SendEmailEmailContentBuilder = ({
  content,
  contentType,
  variableSourceNodes,
  onChange,
}: SendEmailEmailContentBuilderProps) => {
  const { t } = useTranslation('automations');
  const {
    format,
    contentJson,
    editor,
    isSheetOpen,
    setIsSheetOpen,
    openSheet,
    switchLabelKey,
    handleContentJsonChange,
    switchEditor,
  } = useSendEmailEmailContentBuilder(content);

  const switchButton = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-5 self-end px-1 font-normal text-muted-foreground"
      onClick={switchEditor}
    >
      {t(switchLabelKey)}
    </Button>
  );

  if (format === 'maily') {
    return (
      <div className="flex flex-col gap-1">
        <SendEmailMailyContentSheet
          contentJson={contentJson}
          contentType={contentType}
          content={content}
          variableSourceNodes={variableSourceNodes}
          onChange={handleContentJsonChange}
        />
        {switchButton}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <EmailTemplateSelector content={content} />

      <SendEmailEmailContentPreview content={content} onEdit={openSheet} />

      <SendEmailEmailContentEditorSheet
        contentType={contentType}
        variableSourceNodes={variableSourceNodes}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        editor={editor}
        onChange={onChange}
      />
      {switchButton}
    </div>
  );
};
