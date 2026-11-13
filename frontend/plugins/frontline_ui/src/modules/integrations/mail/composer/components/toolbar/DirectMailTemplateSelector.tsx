import { useDirectMailTemplateSelector } from '@/integrations/mail/composer/hooks/useDirectMailTemplateSelector';
import { IconTemplate } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { EmailTemplatePicker } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const DirectMailTemplateSelector = () => {
  const { disabled, selectTemplate } = useDirectMailTemplateSelector();
  const { t } = useTranslation('frontline');
  return (
    <EmailTemplatePicker
      disabled={disabled}
      side="top"
      onSelect={selectTemplate}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-sm"
        title={t('email-templates')}
        aria-label={t('email-templates')}
        disabled={disabled}
      >
        <IconTemplate className="size-4" />
      </Button>
    </EmailTemplatePicker>
  );
};
