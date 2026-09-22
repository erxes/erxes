import { SelectEmailTemplate } from '@/automations/components/builder/nodes/actions/sendEmail/components/SelectEmailTemplate';
import { useEmailTemplateDetailLazy } from '@/emailTemplates/hooks/useEmailTemplateDetail';
import { emailTemplateFormat } from '@/emailTemplates/types';
import { useConfirm } from 'erxes-ui';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

/**
 * Loading a template into the action brings its format with it: a block
 * template keeps the block editor, an email-editor one switches to that.
 */
export const EmailTemplateSelector = ({ content }: { content: string }) => {
  const { setValue } = useFormContext();
  const { loadEmailTemplate, emailTemplate } = useEmailTemplateDetailLazy();
  const { confirm } = useConfirm();

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) {
      return;
    }

    if (content?.trim()) {
      confirm({
        message:
          'Are you sure you want to set this template to the email content? This will replace the current content.',
      }).then(() => loadEmailTemplate(templateId));

      return;
    }

    loadEmailTemplate(templateId);
  };

  useEffect(() => {
    if (!emailTemplate) {
      return;
    }

    const format = emailTemplateFormat(emailTemplate);

    setValue('contentFormat', format, { shouldDirty: true });

    if (format === 'maily') {
      setValue('contentJson', emailTemplate.contentJson, {
        shouldDirty: true,
      });

      return;
    }

    setValue('content', emailTemplate.content || '', { shouldDirty: true });
  }, [emailTemplate, setValue]);

  return (
    <SelectEmailTemplate
      onSelect={handleTemplateSelect}
      placeholder="Select email template to load"
    />
  );
};
