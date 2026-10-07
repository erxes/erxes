import { EmailTemplateSelector } from '@/automations/components/builder/nodes/actions/sendEmail/components/EmailTemplateSelector';
import { SendEmailEmailContentEditorSheet } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailEmailContentEditorSheet';
import { SendEmailEmailContentPreview } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailEmailContentPreview';
import { useSendEmailContentEditor } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailContentEditor';
import { useSendEmailMailyHtml } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailMailyHtml';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { SendEmailMailyContentSheet } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailMailyContentSheet';
import { Button, JSONContent, useConfirm } from 'erxes-ui';
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
  const { confirm } = useConfirm();

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

  // The two editors store different things, so switching starts over.
  const switchEditor = () => {
    const apply = () => {
      setValue('contentFormat', format === 'maily' ? 'blocks' : 'maily', {
        shouldDirty: true,
      });
      setValue('contentJson', undefined, { shouldDirty: true });
      setValue('content', '', { shouldDirty: true });
      setValue('html', '', { shouldDirty: true });
    };

    if (!content.trim() && !contentJson) {
      apply();
      return;
    }

    confirm({
      message:
        'Switching editors clears the current email content. Do you want to continue?',
    }).then(apply);
  };

  const switchButton = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-5 self-end px-1 font-normal text-muted-foreground"
      onClick={switchEditor}
    >
      {format === 'maily' ? 'Use block editor' : 'Use email editor'}
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
      {switchButton}
    </div>
  );
};
