import type { VaultConnection } from '@erxes/core-contract';
import { IconLock, IconShieldLock } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Skeleton,
  Spinner,
  usePanelExpanded,
  useRecordPanel,
  AppBreadcrumb,
} from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { paths } from '~/lib/paths';
import { RecordPageHeader } from '~/modules/side-panel/RecordPageHeader';
import { RecordSidePanel } from '~/modules/side-panel/RecordSidePanel';
import type { IRecordViewProps } from '~/modules/side-panel/recordView';
import { SidePanelEmpty, SidePanelFailed } from '~/modules/side-panel/SidePanelEmpty';
import type { Integration } from '../integrations/catalog';
import { useIntegrationText } from '../integrations/IntegrationStatusBadge';
import { ConnectionEdit, useConnectionChanges } from './ConnectionEdit';
import { useConnections, useKeyedIntegrations } from './useVault';

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-start gap-3 text-sm">
    <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
    <dd className="min-w-0 flex-1 break-words">{children}</dd>
  </div>
);

const ConnectionFacts = ({
  integration,
  connection,
}: {
  integration: Integration;
  connection: VaultConnection;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const { t: fieldT } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { update } = useConnectionChanges();
  const active = connection.status === 'active';
  const { name } = useIntegrationText()(integration);

  return (
    <dl className="space-y-2 rounded-lg border p-3">
      <Fact label={t('service', 'Service')}>{name}</Fact>
      <Fact label={t('status', 'Status')}>
        <span className="flex items-center gap-2">
          <Badge variant={active ? 'success' : 'secondary'}>
            {active ? t('active', 'Active') : t('off', 'Off')}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            disabled={update.isPending}
            onClick={() =>
              update.mutate({
                key: integration.key,
                id: connection.id,
                status: active ? 'disabled' : 'active',
              })
            }
          >
            {active ? fieldT('turn-off', 'Turn off') : fieldT('turn-on', 'Turn on')}
          </Button>
        </span>
      </Fact>
      <Fact label={t('used-by', 'Used by')}>
        {connection.usedBy.length ? connection.usedBy.join(', ') : t('unused', 'Nothing')}
      </Fact>
      <Fact label={t('keys', 'Keys')}>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <IconLock className="size-3.5" />
          {t('keys-hidden', 'Stored encrypted. Never shown.')}
        </span>
      </Fact>
    </dl>
  );
};

const ConnectionView = ({
  integration,
  connection,
  onBack,
  onClose,
}: Omit<IRecordViewProps, 'record'> & {
  integration: Integration;
  connection: VaultConnection;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const expanded = usePanelExpanded();
  const panel = useRecordPanel();

  return (
    <>
      {expanded ? (
        <RecordPageHeader
          breadcrumb={
            <AppBreadcrumb
              items={[
                { label: t('title', 'Vault'), to: paths.settings.vault, icon: IconShieldLock },
                { label: connection.name, to: paths.settings.vaultConnection(connection.id) },
              ]}
            />
          }
        />
      ) : (
        <RecordSidePanel.Header
          avatar={<integration.icon className="size-5 flex-none text-primary-text" />}
          title={connection.name}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      <div className="mx-auto min-h-0 w-full max-w-2xl flex-1 space-y-4 overflow-y-auto p-4">
        <ConnectionFacts integration={integration} connection={connection} />
        <ConnectionEdit
          key={connection.id}
          integration={integration}
          connection={connection}
          onRemoved={() => panel?.dismiss()}
        />
      </div>
    </>
  );
};

export const ConnectionPanel = ({ record, onBack, onClose }: IRecordViewProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const connections = useConnections();
  const { integrations, loading } = useKeyedIntegrations();
  const connection = connections.data?.data.find(({ id }) => id === record.contentId);
  const integration = integrations.find(({ key }) => key === connection?.key);

  if (connection && integration) {
    return (
      <ConnectionView
        integration={integration}
        connection={connection}
        onBack={onBack}
        onClose={onClose}
      />
    );
  }

  if (connections.isPending || loading) {
    return (
      <>
        <RecordSidePanel.Header
          title={<Skeleton className="h-4 w-32" />}
          onBack={onBack}
          onClose={onClose}
        />
        <Spinner area="lg" />
      </>
    );
  }

  if (connections.error) {
    return <SidePanelFailed error={connections.error} onBack={onBack} onClose={onClose} />;
  }

  return (
    <SidePanelEmpty
      title={t('not-found-title', 'Nothing here')}
      description={t('record-not-found', 'This record no longer exists.')}
      onBack={onBack}
      onClose={onClose}
    />
  );
};
