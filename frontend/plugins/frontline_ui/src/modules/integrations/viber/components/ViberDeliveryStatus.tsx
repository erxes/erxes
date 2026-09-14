import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client';
import { Button, Spinner, toast } from 'erxes-ui';
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
    } catch (caught) {
      toast({
        title: 'Viber retry did not complete',
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
          title: 'Could not refresh delivery status',
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
        <span>{viberDeliveryLabel(current)}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          disabled={loading || retrying}
          onClick={() => void check().catch(() => undefined)}
        >
          {loading ? <Spinner size="sm" /> : 'Check status'}
        </Button>
        {canRetry && (
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs"
            disabled={loading || retrying}
            onClick={() => void onRetry()}
          >
            {retrying ? <Spinner size="sm" /> : 'Retry unsent parts'}
          </Button>
        )}
      </div>
      {current?.parts.length ? (
        <span>
          {current.parts.filter((part) => part.state === 'sent').length}/
          {current.parts.length} parts accepted
        </span>
      ) : null}
      {failure && <p className="text-destructive">{failure}</p>}
      {error && (
        <p role="alert" className="text-destructive">
          Could not check delivery: {error.message}
        </p>
      )}
    </div>
  );
};
