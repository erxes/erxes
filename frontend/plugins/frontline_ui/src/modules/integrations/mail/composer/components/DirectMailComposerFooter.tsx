import { DirectMailInsertTools } from '@/integrations/mail/composer/components/toolbar/DirectMailToolbar';
import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { IconTrash } from '@tabler/icons-react';
import { Button, Sheet, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ComposerFooter = () => {
  const {
    sending: loading,
    failedDelivery,
    sendersLoading,
    sendersError,
    senders,
    close: onDiscard,
  } = useDirectMailComposerContext();
  const retry = Boolean(failedDelivery);
  const disabled =
    loading ||
    (!failedDelivery &&
      (sendersLoading || Boolean(sendersError) || !senders.length));
  const { t } = useTranslation('frontline');
  return (
    <Sheet.Footer className="flex h-auto flex-none flex-col sm:items-stretch sm:justify-start gap-3 bg-background px-4 pb-3 pt-2 text-foreground">
      <div className="flex items-center gap-1">
        <Button type="submit" disabled={disabled} className="mr-2">
          {loading && <Spinner size="sm" />}
          {t(retry ? 'email-delivery-retry' : 'send', retry ? 'Retry' : 'Send')}
        </Button>
        <DirectMailInsertTools />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto size-8"
          title="Discard draft"
          aria-label="Discard draft"
          onClick={onDiscard}
          disabled={loading}
        >
          <IconTrash className="size-4" />
        </Button>
      </div>
    </Sheet.Footer>
  );
};
