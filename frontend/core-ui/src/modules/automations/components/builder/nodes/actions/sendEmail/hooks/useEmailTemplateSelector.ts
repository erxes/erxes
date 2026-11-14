import { useEmailTemplateDetailLazy } from '@/emailTemplates/hooks/useEmailTemplateDetail';
import { emailTemplateFormat, IEmailTemplate } from '@/emailTemplates/types';
import { useConfirm } from 'erxes-ui';
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/** The fields a template writes: its format, and its content in that format. */
const templateValuesOf = (template: IEmailTemplate) => {
  const format = emailTemplateFormat(template);

  return format === 'maily'
    ? { contentFormat: format, contentJson: template.contentJson }
    : { contentFormat: format, content: template.content || '' };
};

/**
 * Loading a template into the action brings its format with it. Replacing
 * content already written asks first.
 */
export const useEmailTemplateSelector = (content: string) => {
  const { t } = useTranslation('automations');
  const { setValue } = useFormContext();
  const { loadEmailTemplate, emailTemplate } = useEmailTemplateDetailLazy();
  const { confirm } = useConfirm();

  const handleTemplateSelect = useCallback(
    (templateId: string) => {
      if (!templateId) {
        return;
      }

      if (!content?.trim()) {
        loadEmailTemplate(templateId);
        return;
      }

      confirm({ message: t('send-email-template-replace-confirm') }).then(() =>
        loadEmailTemplate(templateId),
      );
    },
    [content, confirm, loadEmailTemplate, t],
  );

  useEffect(() => {
    if (!emailTemplate) {
      return;
    }

    for (const [key, value] of Object.entries(
      templateValuesOf(emailTemplate),
    )) {
      setValue(key, value, { shouldDirty: true });
    }
  }, [emailTemplate, setValue]);

  return { handleTemplateSelect };
};
