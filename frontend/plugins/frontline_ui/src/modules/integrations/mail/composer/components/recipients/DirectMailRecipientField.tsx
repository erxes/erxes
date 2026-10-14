import { VerifiedEmailField } from '@/integrations/mail/composer/components/recipients/DirectMailVerifiedEmailField';
import { useDirectMailRecipientControl } from '@/integrations/mail/composer/hooks/recipients/useDirectMailRecipientControl';
import { useDirectMailComposerFields } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { Button, Form, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const RecipientRow = () => {
  const { name: fieldName } = useDirectMailRecipientControl();
  const { t } = useTranslation('frontline');
  const { showCc, showBcc, openCc, openBcc } = useDirectMailComposerFields();
  return (
    <Form.Item className="grid flex-none space-y-0 gap-y-1 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center border-b px-4 py-1.5">
      <Label
        variant="peer"
        className="text-xs leading-5 text-muted-foreground"
        htmlFor={`direct-mail-${fieldName}`}
      >
        {fieldName === 'to' ? 'To' : t(fieldName)}
      </Label>
      <VerifiedEmailField />
      {(fieldName === 'to' || fieldName === 'cc') && (
        <div className="flex items-center gap-1">
          {fieldName === 'to' && !showCc && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={openCc}
            >
              {t('cc')}
            </Button>
          )}
          {!showBcc && (fieldName === 'cc' || !showCc) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={openBcc}
            >
              {t('bcc')}
            </Button>
          )}
        </div>
      )}
      <Form.Message
        id={`direct-mail-${fieldName}-error`}
        className="col-start-2 col-span-2 text-xs"
        role="alert"
      />
    </Form.Item>
  );
};
