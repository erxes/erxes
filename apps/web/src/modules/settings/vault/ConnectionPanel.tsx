import type { VaultConnection } from '@erxes/core-contract';
import { IconLock, IconShieldLock, IconTrash } from '@tabler/icons-react';
import {
  Badge,
  Button,
  RelativeDateDisplay,
  Skeleton,
  Spinner,
  useConfirm,
  usePanelExpanded,
  useRecordPanel,
} from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { paths } from '~/lib/paths';
import { RecordPageHeader } from '~/modules/side-panel/RecordPageHeader';
import { RecordSidePanel } from '~/modules/side-panel/RecordSidePanel';
import type { IRecordViewProps } from '~/modules/side-panel/recordView';
import { SidePanelEmpty, SidePanelFailed } from '~/modules/side-panel/SidePanelEmpty';
import type { Integration } from '../integrations/catalog';
import { useIntegrationText } from '../integrations/IntegrationStatusBadge';
import { ConnectionEdit, useConnectionChanges } from './ConnectionEdit';
import { integrationOf, useConnections, useVaultIntegrations } from './useVault';

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
      {integration.fields.flatMap(({ key, label, type }) => {
        const value = connection.settings[key];

        return type === 'text' && typeof value === 'string' && value
          ? [
              <Fact key={key} label={fieldT(`field.${key}`, label)}>
                {value}
              </Fact>,
            ]
          : [];
      })}
      <Fact label={t('keys', 'Keys')}>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <IconLock className="size-3.5" />
          {t('keys-hidden', 'Stored encrypted. Never shown.')}
        </span>
      </Fact>
    </dl>
  );
};

const PluginConnection = ({
  integration,
  connection,
  onRemoved,
}: {
  integration: Integration;
  connection: VaultConnection;
  onRemoved: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const { t: fieldT } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { name } = useIntegrationText()(integration);
  const { remove } = useConnectionChanges(onRemoved);
  const { confirm } = useConfirm();
  const plugin = connection.usedBy.join(', ');

  return (
    <>
      <dl className="space-y-2 rounded-lg border p-3">
        <Fact label={t('service', 'Service')}>{name}</Fact>
        <Fact label={t('kept-by', 'Kept by')}>{plugin}</Fact>
        <Fact label={t('status', 'Status')}>
          {connection.problem ? (
            <Badge variant="warning">{t('attention', 'Needs attention')}</Badge>
          ) : (
            <Badge variant="success">{t('active', 'Active')}</Badge>
          )}
        </Fact>
        {connection.problem && <Fact label={t('problem', 'Problem')}>{connection.problem}</Fact>}
        <Fact label={t('added', 'Added')}>
          <RelativeDateDisplay value={connection.createdAt} render={<span />}>
            <RelativeDateDisplay.Value value={connection.createdAt} />
          </RelativeDateDisplay>
        </Fact>
        <Fact label={t('keys', 'Keys')}>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <IconLock className="size-3.5" />
            {t('plugin-keys-hidden', 'Stored encrypted. Only {{plugin}} reads them.', { plugin })}
          </span>
        </Fact>
      </dl>
      <p className="text-sm text-muted-foreground">
        {t('plugin-managed', '{{plugin}} saved this and changes it on its own pages.', { plugin })}
      </p>
      <Button
        type="button"
        variant="ghost"
        tone="destructive"
        disabled={remove.isPending}
        onClick={() =>
          void confirm({
            message: fieldT('remove-confirm', 'Remove “{{name}}”?', { name: connection.name }),
            options: {
              description: t(
                'plugin-remove-description',
                '{{plugin}} is told and can no longer read its keys.',
                { plugin },
              ),
              okLabel: fieldT('remove', 'Remove'),
              variants: { ok: 'destructive' },
            },
          }).then(() =>
            remove.mutate({
              plugin: integration.plugin ?? undefined,
              key: integration.key,
              id: connection.id,
            }),
          )
        }
      >
        <IconTrash />
        {fieldT('remove', 'Remove')}
      </Button>
    </>
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
        {connection.plugin ? (
          <PluginConnection
            integration={integration}
            connection={connection}
            onRemoved={() => panel?.dismiss()}
          />
        ) : (
          <>
            <ConnectionFacts integration={integration} connection={connection} />
            <ConnectionEdit
              key={connection.id}
              integration={integration}
              connection={connection}
              onRemoved={() => panel?.dismiss()}
            />
          </>
        )}
      </div>
    </>
  );
};

export const ConnectionPanel = ({ record, onBack, onClose }: IRecordViewProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const connections = useConnections();
  const { integrations, loading } = useVaultIntegrations();
  const connection = connections.data?.data.find(({ id }) => id === record.contentId);
  const integration = connection && integrationOf(connection, integrations);

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
