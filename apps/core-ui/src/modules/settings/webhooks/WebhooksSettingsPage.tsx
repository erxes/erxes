import { IconCheck, IconCopy, IconWebhook } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  Empty,
  Input,
  PageContainer,
  PageHeader,
  ScrollArea,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';
import { useCan } from '~/modules/auth/session';
import { NewWebhook } from './NewWebhook';
import { WebhookRow } from './WebhookRow';

/** The secret, shown once: copy it now. */
const SecretNotice = ({ secret, onClose }: { secret: string; onClose: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = () =>
    navigator.clipboard.writeText(secret).then(
      () => setCopied(true),
      (error: unknown) =>
        toast({
          variant: 'destructive',
          title: t('copy-failed', 'Could not copy'),
          description: messageOf(error),
        }),
    );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('secret-title', 'Signing secret')}
          description={t(
            'secret-description',
            "Copy it now: it won't be shown again. Check every request's Erxes-Signature with it.",
          )}
        />
        <div className="flex gap-2">
          <Input
            readOnly
            value={secret}
            aria-label={t('secret-title', 'Signing secret')}
            text="code"
          />
          <Button variant="outline" aria-label={t('copy', 'Copy')} onClick={() => void copy()}>
            {copied ? <IconCheck /> : <IconCopy />}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

const NoWebhooks = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconWebhook />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No webhooks yet')}</Empty.Title>
        <Empty.Description>
          {t('empty-description', 'Send customer, company and plugin events to your own systems.')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** Settings › Webhooks: endpoints that receive the organisation's events, with each delivery's outcome. */
export const WebhooksSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'webhooks' });
  const can = useCan();
  const [secret, setSecret] = useState<string | null>(null);

  const webhooks = useQuery(
    orpc.webhooks.list.queryOptions({ input: can('webhooks.manage') ? undefined : skipToken }),
  );

  if (!can('webhooks.manage')) return <Navigate to="/settings" replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'Webhooks'), to: '/settings/webhooks', icon: IconWebhook }]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <NewWebhook onCreated={setSecret} />
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-3 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'intro',
              'Each event is POSTed as JSON with an Erxes-Signature header (t=<time>,v1=<HMAC-SHA256 of "<time>.<body>">). Failed deliveries are retried for about a day.',
            )}
          </p>
          <QueryState
            query={webhooks}
            className="py-12"
            isEmpty={({ data }) => !data.length}
            empty={<NoWebhooks />}
          >
            {({ data }) => (
              <ul className="space-y-2">
                {data.map((webhook) => (
                  <WebhookRow key={webhook.id} webhook={webhook} onSecret={setSecret} />
                ))}
              </ul>
            )}
          </QueryState>
        </div>
      </ScrollArea>
      {secret && <SecretNotice secret={secret} onClose={() => setSecret(null)} />}
    </PageContainer>
  );
};
