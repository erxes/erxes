import type { EbarimtSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconReceiptTax } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Spinner, Switch, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { EbarimtForm } from './EbarimtForm';
import { IntegrationCard } from './IntegrationCard';

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

const EbarimtCardOf = ({ saved }: { saved: EbarimtSettings | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });

  return (
    <IntegrationCard
      icon={IconReceiptTax}
      title="eBarimt"
      description={t(
        'description',
        'Mongolian tax receipts. Each paid invoice of the plugins you pick gets a receipt from your PosAPI; refunds return or replace it.',
      )}
      state={!saved ? 'not-set-up' : saved.status === 'active' ? 'on' : 'off'}
      details={saved && `${saved.companyName} · ${saved.merchantTin} · ${saved.posApiUrl}`}
      actions={
        saved ? (
          <>
            <EbarimtSwitch saved={saved} />
            <EbarimtForm saved={saved} />
            <RemoveEbarimt />
          </>
        ) : (
          <EbarimtForm saved={null} />
        )
      }
    />
  );
};

/** eBarimt as an integration: set it up, turn it on or off, change or remove it. */
export const EbarimtCard = () => {
  const settings = useQuery(orpc.ebarimt.settings.queryOptions());

  return <QueryState query={settings}>{(saved) => <EbarimtCardOf saved={saved} />}</QueryState>;
};
