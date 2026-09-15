import { useMutation, useQuery } from '@apollo/client';
import { Button, Checkbox } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CMS_POSTIZ_DELIVERIES,
  CMS_POSTIZ_RETRY,
  type PostizDelivery,
} from './graphql';

export function PostizDeliveryList({
  postId,
  language,
}: {
  postId: string;
  language: string;
}) {
  const { t } = useTranslation('content');
  const { data, loading, error, refetch } = useQuery<{
    cmsPostizDeliveries: PostizDelivery[];
  }>(CMS_POSTIZ_DELIVERIES, {
    variables: { postId, language },
    fetchPolicy: 'network-only',
    pollInterval: 15000,
  });
  if (loading && !data)
    return (
      <p role="status">
        {t('cms-social-loading-delivery', {
          defaultValue: 'Loading social delivery status…',
        })}
      </p>
    );
  if (error)
    return (
      <div role="alert" className="space-y-2 text-sm">
        <p>
          {t('cms-social-history-error', {
            defaultValue:
              'Could not load social deliveries. Check your sharing access or try again.',
          })}
        </p>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => void refetch().catch(() => undefined)}
        >
          {t('retry', { defaultValue: 'Retry' })}
        </Button>
      </div>
    );
  const deliveries = data?.cmsPostizDeliveries || [];
  if (!deliveries.length)
    return (
      <p className="text-sm text-muted-foreground">
        {t('cms-social-no-deliveries', {
          defaultValue: 'No social shares for this post and language yet.',
        })}
      </p>
    );
  return (
    <div className="space-y-3" aria-live="polite">
      <p className="text-sm text-muted-foreground">
        {t('cms-social-delivery-help', {
          defaultValue:
            'Queued means Postiz accepted the request, not that the channel has published it. Review failed or unconfirmed deliveries in Postiz before sharing again.',
        })}
      </p>
      <ul className="divide-y border rounded">
        {deliveries.map((delivery) => (
          <li key={delivery._id} className="p-3 space-y-1 text-sm break-words">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-medium">{delivery.channelName}</span>
              <span>
                {t(`cms-social-state-${delivery.state.toLowerCase()}`, {
                  defaultValue: delivery.state.toLowerCase().replace('_', ' '),
                })}
              </span>
            </div>
            {delivery.message && (
              <p className="text-muted-foreground">{delivery.message}</p>
            )}
            {delivery.state === 'FAILED' && (
              <RetryDelivery
                id={delivery._id}
                onRetried={() => void refetch().catch(() => undefined)}
              />
            )}
            {delivery.url?.startsWith('https://') && (
              <a
                className="inline-flex items-center min-h-11 underline"
                href={delivery.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('cms-social-view-post', {
                  defaultValue: 'View published post',
                })}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RetryDelivery({
  id,
  onRetried,
}: {
  id: string;
  onRetried: () => void;
}) {
  const { t } = useTranslation('content');
  const [reviewed, setReviewed] = useState(false);
  const [requested, setRequested] = useState(false);
  const [retry, { loading, error }] = useMutation(CMS_POSTIZ_RETRY);
  if (requested)
    return (
      <p role="status">
        {t('cms-social-retry-queued', {
          defaultValue: 'Retry requested. See its delivery status above.',
        })}
      </p>
    );
  return (
    <div className="space-y-2 pt-2">
      <label className="flex items-center gap-3 min-h-11">
        <Checkbox
          checked={reviewed}
          disabled={loading}
          onCheckedChange={(value) => setReviewed(value === true)}
        />
        <span>
          {t('cms-social-reviewed', {
            defaultValue:
              'I checked Postiz and the channel. This post was not published.',
          })}
        </span>
      </label>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={!reviewed || loading}
        onClick={async () => {
          try {
            await retry({ variables: { id, reviewedInPostiz: true } });
            setRequested(true);
            onRetried();
          } catch {
            /* Apollo keeps the error visible below. */
          }
        }}
      >
        {t('cms-social-retry-delivery', { defaultValue: 'Retry this channel' })}
      </Button>
      {error && (
        <p role="alert" className="text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
