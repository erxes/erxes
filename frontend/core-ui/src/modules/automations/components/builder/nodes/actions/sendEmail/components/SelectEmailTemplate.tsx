import { useTranslation } from 'react-i18next';
import { useEmailTemplateDetailLazy } from '@/emailTemplates/hooks/useEmailTemplateDetail';
import type { TEmailContentFormat } from '@/emailTemplates/types';
import { IconTemplate } from '@tabler/icons-react';
import { Button, toast } from 'erxes-ui';
import { useEffect } from 'react';
import { EmailTemplatePicker } from 'ui-modules';

interface SelectEmailTemplateProps {
  onSelect: (value: string) => void;
  onContentSelect?: (content: string) => void;
  placeholder?: string;
  format?: TEmailContentFormat;
}

export const SelectEmailTemplate = ({
  onSelect,
  onContentSelect,
  placeholder = 'Select email template',
  format,
}: SelectEmailTemplateProps) => {
  const { t } = useTranslation('automations');
  const { loadEmailTemplate, emailTemplate, loading } =
    useEmailTemplateDetailLazy();
  useEffect(() => {
    if (emailTemplate?.content && onContentSelect)
      onContentSelect(emailTemplate.content);
  }, [emailTemplate?.content, onContentSelect]);
  return (
    <EmailTemplatePicker
      format={format}
      disabled={loading}
      onSelect={(template) => onSelect(template._id)}
      onContentSelect={
        onContentSelect
          ? (template) => {
              void loadEmailTemplate(template._id).catch(() =>
                toast({
                  title: 'Unable to load email template',
                  variant: 'destructive',
                }),
              );
            }
          : undefined
      }
      searchPlaceholder={t('send-email-search-templates-placeholder')}
      emptyLabel={t('send-email-no-templates-found')}
      contentSelectLabel={t('send-email-insert-template-content')}
    >
      <Button type="button" variant="secondary" className="w-full">
        <IconTemplate />
        {placeholder}
      </Button>
    </EmailTemplatePicker>
  );
};
