import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client';
import { Button, Popover, Spinner, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';
import { VIBER_MESSAGE_REFETCH, VIBER_RETRY, VIBER_STATUS } from '../graphql';
import { viberDeliveryLabel } from '../validation';
import type { ViberDelivery } from '../types';

export const ViberDeliveryStatus = ({
  messageId,
  delivery,
}: {
  messageId: string;
  delivery?: ViberDelivery | null;
}) => {
  const { t } = useTranslation('frontline');
  const client = useApolloClient();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const [check, { data, loading, error }] = useLazyQuery<{
    viberMessageStatus: ViberDelivery | null;
  }>(VIBER_STATUS, { variables: { messageId }, fetchPolicy: 'network-only' });
  const [retry, { loading: retrying }] = useMutation(VIBER_RETRY);
  // Both documents share the normalized ViberMessageStatus identity; receipts
  // arriving on the conversation subscription update this result as well.
  const current = data?.viberMessageStatus ?? delivery;
  const retryable = current && ['pending', 'rejected'].includes(current.state);
  const canRetry =
    retryable && isLoaded && hasActionPermission('conversationMessageAdd');
  const failure =
    current?.error || current?.parts.find((part) => part.error)?.error;
  const onRetry = async (): Promise<void> => {
    try {
      await retry({ variables: { messageId } });
      toast({ title: t('message-sent') });
    } catch (caught) {
      toast({
        title: 'Unable to retry message',
        description:
          caught instanceof Error ? caught.message : 'Check delivery status',
        variant: 'destructive',
      });
    } finally {
      try {
        await Promise.all([
          check(),
          client.refetchQueries({ include: VIBER_MESSAGE_REFETCH }),
        ]);
      } catch {
        toast({
          title: 'Unable to refresh delivery status',
          variant: 'destructive',
        });
      }
    }
  };
  return (
    <div
      className="text-xs text-muted-foreground space-y-1 mt-1"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Popover
          onOpenChange={(open) => open && void check().catch(() => undefined)}
        >
          <Popover.Trigger asChild>
            <Button
              variant="link"
              className="h-auto p-0 text-xs font-normal text-muted-foreground"
              aria-label={t('delivery-status', {
                defaultValue: 'Delivery status',
              })}
            >
              {viberDeliveryLabel(current)}
            </Button>
          </Popover.Trigger>
          <Popover.Content className="w-72 space-y-2 text-xs">
            <p className="font-medium">{viberDeliveryLabel(current)}</p>
            {current && current.parts.length > 1 && (
              <p>
                {t('viber-parts-sent', {
                  defaultValue: '{{sent}} of {{total}} parts sent',
                  sent: current.parts.filter((part) => part.state === 'sent')
                    .length,
                  total: current.parts.length,
                })}
              </p>
            )}
            {current?.state === 'unknown' && (
              <p>
                {t('viber-check-before-resending', {
                  defaultValue:
                    'Check delivery before resending to avoid duplicate messages.',
                })}
              </p>
            )}
            {error && (
              <p role="alert" className="text-destructive">
                {error.message}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={loading || retrying}
              onClick={() => void check().catch(() => undefined)}
            >
              {loading && <Spinner size="sm" />}
              {t('refresh')}
            </Button>
          </Popover.Content>
        </Popover>
        {canRetry && (
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs"
            disabled={loading || retrying}
            onClick={() => void onRetry()}
          >
            {retrying ? (
              <Spinner size="sm" />
            ) : (
              t('retry', { defaultValue: 'Retry' })
            )}
          </Button>
        )}
      </div>
      {failure && <p className="text-destructive">{failure}</p>}
    </div>
  );
};
