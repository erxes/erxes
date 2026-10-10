import {
  IconAlertTriangle,
  IconChevronRight,
  IconCoins,
  IconPlus,
  IconStairs,
  IconUnlink,
} from '@tabler/icons-react';
import { Alert, Badge, Button, InfoCard, Skeleton, Switch } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { IRelationSettingsWidgetProps } from 'ui-modules';
import { AddLoyaltyWorkflow } from './components/AddLoyaltyWorkflow';
import {
  TLoyaltyBuiltInConnection,
  TLoyaltySourceConnection,
  useLoyaltySourceAutomations,
} from './hooks/useLoyaltySourceAutomations';
import { useLoyaltySourceAutomationRemove } from './hooks/useLoyaltySourceAutomationRemove';
import { useLoyaltySourceAutomationStatus } from './hooks/useLoyaltySourceAutomationStatus';

// Set in the source's own settings; loyalty only shows it.
const BuiltInRow = ({
  connection: { target, inactive },
  icon,
}: {
  connection: TLoyaltyBuiltInConnection;
  icon: ReactNode;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm">
      {icon}
      <span className="min-w-0 flex-1 truncate">
        <span className="font-medium">{target || t('untitled')}</span>
        <span className="text-muted-foreground">
          {' ← '}
          {t('loyalty-source-built-in-from')}
        </span>
      </span>
      {inactive && (
        <Badge variant="warning">
          <IconAlertTriangle />
          {t('loyalty-source-campaign-inactive')}
        </Badge>
      )}
      <Badge variant="secondary">{t('loyalty-source-built-in')}</Badge>
    </div>
  );
};

const ConnectionRow = ({
  connection: {
    _id,
    name,
    status,
    scopeLabel,
    target,
    incomplete,
    alsoBuiltIn,
  },
  icon,
  incompleteLabel,
  editPath,
  onDisconnect,
  disconnecting,
}: {
  connection: TLoyaltySourceConnection;
  icon: ReactNode;
  incompleteLabel: string;
  editPath: string;
  onDisconnect: () => void;
  disconnecting: boolean;
}) => {
  const { t } = useTranslation('loyalty');
  const { toggle, toggling } = useLoyaltySourceAutomationStatus();
  const isActive = status === 'active';

  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
      {icon}
      <span className="min-w-0 flex-1 truncate">
        <span className="font-medium">{target || name || t('untitled')}</span>
        <span className="text-muted-foreground">
          {' ← '}
          {t('loyalty-source-from', { scope: scopeLabel })}
        </span>
      </span>
      {incomplete && (
        <Badge variant="warning">
          <IconAlertTriangle />
          {incompleteLabel}
        </Badge>
      )}
      {alsoBuiltIn && (
        <Badge variant="warning">
          <IconAlertTriangle />
          {t('loyalty-source-also-built-in')}
        </Badge>
      )}
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Switch
          checked={isActive}
          // A step without its campaign or wallet would run and do nothing.
          disabled={toggling || (incomplete && !isActive)}
          onCheckedChange={(checked) => toggle(_id, checked)}
        />
        {isActive ? t('loyalty-source-on') : t('loyalty-source-off')}
      </label>
      <Button variant="ghost" size="sm" asChild>
        <Link to={editPath}>
          {t('loyalty-source-details')}
          <IconChevronRight />
        </Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disconnecting}
        onClick={onDisconnect}
      >
        <IconUnlink />
        {t('loyalty-source-disconnect')}
      </Button>
    </div>
  );
};

// What a purchase source sends to loyalty, set up from that source's own page.
export const RelationSettingsWidget = ({
  context,
}: IRelationSettingsWidgetProps) => {
  const { t } = useTranslation('loyalty');
  const state = useLoyaltySourceAutomations(context);
  const {
    adding,
    setAdding,
    pointConnections,
    tierConnections,
    loading,
    error,
    noActivePoints,
    editPath,
    builtInPoints,
    builtInTiers,
  } = state;
  const { removeAutomation, removing } = useLoyaltySourceAutomationRemove();

  // Only a source that hands over a purchase trigger has anything to send.
  if (!context.triggerType || !context.scopes?.length) {
    return null;
  }

  const rows = (
    connections: TLoyaltySourceConnection[],
    icon: ReactNode,
    incompleteLabel: string,
  ) =>
    connections.map((connection) => (
      <ConnectionRow
        key={connection._id}
        connection={connection}
        icon={icon}
        incompleteLabel={incompleteLabel}
        editPath={editPath(connection._id)}
        disconnecting={removing}
        onDisconnect={() =>
          removeAutomation(connection._id, connection.target || connection.name)
        }
      />
    ));

  return (
    <div className="p-6">
      <InfoCard title={t('loyalty-source-title')}>
        <InfoCard.Content className="space-y-3">
          {noActivePoints && (
            <Alert variant="warning">
              <IconAlertTriangle />
              <Alert.Title>{t('loyalty-source-no-rule')}</Alert.Title>
            </Alert>
          )}

          {loading && !pointConnections.length && !tierConnections.length && (
            <Skeleton className="h-9 w-full" />
          )}

          {error && <p className="text-sm text-destructive">{error.message}</p>}

          {builtInPoints.map((connection) => (
            <BuiltInRow
              key={connection.id}
              connection={connection}
              icon={
                <IconCoins className="size-4 shrink-0 text-muted-foreground" />
              }
            />
          ))}
          {builtInTiers.map((connection) => (
            <BuiltInRow
              key={connection.id}
              connection={connection}
              icon={
                <IconStairs className="size-4 shrink-0 text-muted-foreground" />
              }
            />
          ))}
          {rows(
            pointConnections,
            <IconCoins className="size-4 shrink-0 text-muted-foreground" />,
            t('loyalty-source-no-campaign'),
          )}
          {rows(
            tierConnections,
            <IconStairs className="size-4 shrink-0 text-muted-foreground" />,
            t('loyalty-source-no-wallet'),
          )}

          {adding ? (
            <AddLoyaltyWorkflow scopes={context.scopes} state={state} />
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAdding(true)}
            >
              <IconPlus />
              {t('loyalty-source-add')}
            </Button>
          )}
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
