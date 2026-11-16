import { useTranslation } from 'react-i18next';
import { SelectEmailTemplate } from '@/automations/components/builder/nodes/actions/sendEmail/components/SelectEmailTemplate';
import { useEmailTemplateSelector } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useEmailTemplateSelector';
import { TEmailContentFormat } from '@/emailTemplates/types';

/**
 * Loading a template into the action brings its format with it: a block
 * template keeps the block editor, an email-editor one switches to that.
 */
export const EmailTemplateSelector = ({
  content,
  format,
}: {
  content: string;
  /** Only offer templates this editor can open without switching away. */
  format?: TEmailContentFormat;
}) => {
  const { t } = useTranslation('automations');
  const { handleTemplateSelect } = useEmailTemplateSelector(content);

  return (
    <SelectEmailTemplate
      onSelect={handleTemplateSelect}
      placeholder={t('send-email-select-template-to-load-placeholder')}
      format={format}
    />
  );
};
