import { EmailTemplateSelector } from '@/automations/components/builder/nodes/actions/sendEmail/components/EmailTemplateSelector';
import { SendEmailEmailContentEditorSheet } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailEmailContentEditorSheet';
import { SendEmailEmailContentPreview } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailEmailContentPreview';
import { useSendEmailContentEditor } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailContentEditor';
import { useSendEmailMailyHtml } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailMailyHtml';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { SendEmailMailyContentSheet } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailMailyContentSheet';
import { JSONContent } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { watch, setValue } = useFormContext<TAutomationSendEmailConfig>();

  const contentJson = watch('contentJson');
  // An action that already carries block content keeps the editor it was
  // written in; a new one is written in the email editor.
  const format =
    watch('contentFormat') || (contentJson || !content ? 'maily' : 'blocks');

  const editor = useSendEmailContentEditor(format === 'blocks' ? content : '');
  useSendEmailMailyHtml(format === 'maily' ? contentJson : undefined, setValue);

  const handleContentJsonChange = (value: JSONContent) => {
    setValue('contentJson', value, { shouldDirty: true });
    setValue('contentFormat', 'maily', { shouldDirty: true });
  };

  if (format === 'maily') {
    // The template picker lives inside the editor now: it replaces the email,
    // and that decision belongs next to the email it replaces.
    return (
      <SendEmailMailyContentSheet
        contentJson={contentJson}
        contentType={contentType}
        content={content}
        variableSourceNodes={variableSourceNodes}
        onChange={handleContentJsonChange}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <EmailTemplateSelector content={content} />

      <SendEmailEmailContentPreview
        content={content}
        onEdit={() => setIsSheetOpen(true)}
      />

      <SendEmailEmailContentEditorSheet
        contentType={contentType}
        variableSourceNodes={variableSourceNodes}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        editor={editor}
        onChange={onChange}
      />
    </div>
  );
};
