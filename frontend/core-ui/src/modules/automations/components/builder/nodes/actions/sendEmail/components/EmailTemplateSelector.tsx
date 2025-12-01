import { SelectEmailTemplate } from '@/automations/components/builder/nodes/actions/sendEmail/components/SelectEmailTemplate';
import { useAutomationEmailTemplateDetailLazy } from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplateDetailLazy';
import { useConfirm } from 'erxes-ui';
import { useEffect } from 'react';

interface EmailTemplateSelectorProps {
  content: string;
  onChange: (content: string) => void;
}

export const EmailTemplateSelector = ({
  content,
  onChange,
}: EmailTemplateSelectorProps) => {
  const { loadEmailTemplate, emailTemplate, loading } =
    useAutomationEmailTemplateDetailLazy();
  const { confirm } = useConfirm();

  const handleTemplateSelect = (templateId: string) => {
    if (templateId) {
      // Check if content already exists
      if (content && content.trim()) {
        confirm({
          message: `Are you sure you want to set this template to the email content? This will replace the current content.`,
        }).then(() => {
          loadEmailTemplate(templateId);
        });
      } else {
        loadEmailTemplate(templateId);
      }
    }
  };

  // Load template content when template is loaded
  useEffect(() => {
    if (emailTemplate?.content) {
      onChange(emailTemplate.content);
    }
  }, [emailTemplate?.content, onChange]);

  return (
    <SelectEmailTemplate
      onSelect={handleTemplateSelect}
      placeholder="Select email template to load"
    />
  );
};
