import type { EbarimtSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconPlugConnected, IconReceiptTax } from '@tabler/icons-react';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  Switch,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { EbarimtForm } from './EbarimtForm';

const useRefreshFailed = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.ebarimt.settings.key() }),
    onError: (error: Error) =>
      toast({
        variant: 'destructive',
        title: t('save-failed', 'Could not save'),
        description: messageOf(error),
      }),
  };
};

/** Turns receipts on or off, keeping the settings. */
const EbarimtSwitch = ({ saved }: { saved: EbarimtSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const save = useMutation(orpc.ebarimt.saveSettings.mutationOptions(useRefreshFailed()));

  return (
    <Switch
      aria-label={t('active', 'Send receipts')}
      checked={saved.status === 'active'}
      disabled={save.isPending}
      onCheckedChange={(on) => save.mutate({ ...saved, status: on ? 'active' : 'disabled' })}
    />
  );
};

const RemoveEbarimt = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const { confirm } = useConfirm();
  const remove = useMutation(orpc.ebarimt.removeSettings.mutationOptions(useRefreshFailed()));

  return (
    <Button
      variant="ghost"
      disabled={remove.isPending}
      onClick={() =>
        void confirm({
          message: t('remove-confirm', 'Remove eBarimt? Issued receipts stay with their invoices.'),
        }).then(() => remove.mutate({}))
      }
    >
      {remove.isPending ? <Spinner size="sm" /> : t('remove', 'Remove')}
    </Button>
  );
};

/** eBarimt as an integration: set it up, turn it on or off, change or remove it. */
const EbarimtCard = ({ saved }: { saved: EbarimtSettings | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });
  const id = useId();

  return (
    <section aria-labelledby={id} className="flex items-start gap-4 rounded-lg border p-4">
      <IconReceiptTax className="mt-0.5 size-8 shrink-0 text-primary" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h2 id={id} className="font-medium">
            eBarimt
          </h2>
          {saved ? (
            <Badge variant={saved.status === 'active' ? 'success' : 'secondary'}>
              {saved.status === 'active' ? t('on', 'On') : t('off', 'Off')}
            </Badge>
          ) : (
            <Badge variant="secondary">{t('not-set-up', 'Not set up')}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {t(
            'description',
            'Mongolian tax receipts. Each paid invoice of the plugins you pick gets a receipt from your PosAPI; refunds return or replace it.',
          )}
        </p>
        {saved && (
          <p className="text-xs text-muted-foreground">
            {saved.companyName} · {saved.merchantTin} · {saved.posApiUrl}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {saved ? (
          <>
            <EbarimtSwitch saved={saved} />
            <EbarimtForm saved={saved} />
            <RemoveEbarimt />
          </>
        ) : (
          <EbarimtForm saved={null} />
        )}
      </div>
    </section>
  );
};

/** Settings › Integrations: outside services core connects to for the organisation. */
export const IntegrationsSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const canManage = useCan()('payments.manage');

  const settings = useQuery(
    orpc.ebarimt.settings.queryOptions({ input: canManage ? undefined : skipToken }),
  );

  if (!canManage) return <Navigate to={paths.settings.root} replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Integrations'),
                to: paths.settings.integrations,
                icon: IconPlugConnected,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-4 p-6">
          <QueryState query={settings}>{(saved) => <EbarimtCard saved={saved} />}</QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
