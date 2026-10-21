import { useDirectMailTemplateSelector } from '@/integrations/mail/composer/hooks/useDirectMailTemplateSelector';
import { IconTemplate } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { EmailTemplatePicker } from 'ui-modules';

export const DirectMailTemplateSelector = () => {
  const { disabled, selectTemplate } = useDirectMailTemplateSelector();
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
        title="Email templates"
        aria-label="Email templates"
        disabled={disabled}
      >
        <IconTemplate className="size-4" />
      </Button>
    </EmailTemplatePicker>
  );
};
