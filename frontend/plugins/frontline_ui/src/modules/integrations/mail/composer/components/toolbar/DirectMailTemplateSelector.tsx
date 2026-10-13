import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { IconTemplate } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { EmailTemplatePicker, useRenderEmailTemplate } from 'ui-modules';

export const DirectMailTemplateSelector = () => {
  const { editor, sending, failedDelivery } = useDirectMailComposerContext();
  const renderTemplate = useRenderEmailTemplate();
  const disabled = sending || Boolean(failedDelivery);
  return (
    <EmailTemplatePicker
      disabled={disabled}
      side="top"
      onSelect={async (template) => {
        const blocks = await editor.tryParseHTMLToBlocks(
          await renderTemplate(template),
        );
        editor.insertBlocks(
          blocks,
          editor.getTextCursorPosition().block,
          'after',
        );
        editor.focus();
      }}
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
