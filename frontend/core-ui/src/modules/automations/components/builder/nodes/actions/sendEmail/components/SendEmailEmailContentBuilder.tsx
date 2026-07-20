import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { SendEmailEmailContentEditorSheet } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailEmailContentEditorSheet';
import { SendEmailEmailContentPreview } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailEmailContentPreview';
import { useSendEmailContentEditor } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailContentEditor';
import { useState } from 'react';

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
  const editor = useSendEmailContentEditor(content);

  return (
    <>
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
    </>
  );
};
