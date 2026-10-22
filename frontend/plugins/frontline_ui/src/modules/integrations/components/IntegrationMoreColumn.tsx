import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconArrowBarToRight } from '@tabler/icons-react';
import { Popover, Command, Combobox, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IIntegration } from '../types/Integration';
import { ArchiveIntegration } from '@/integrations/components/ArchiveIntegration';
import { RemoveIntegration } from '@/integrations/components/RemoveIntegration';
import { IntegrationType } from '@/types/Integration';
import { FacebookIntegrationRepair } from '../facebook/components/FacebookIntegrationRepair';
import { InstagramIntegrationRepair } from '../instagram/components/InstagramIntegrationRepair';
import { DiscordIntegrationRepair } from '../discord/components/DiscordIntegrationActions';
import { EMInstallScript } from '../erxes-messenger/components/EMInstallScript';
import { MoveToChannelDialog } from '@/channels/components/move-resources/MoveToChannelDialog';
import { ChannelResourceType } from '@/channels/types';
import { lazy, ReactNode, Suspense, useState } from 'react';

const ErxesMessengerActions = lazy(() =>
  import('../erxes-messenger/components/ErxesMessengerDetail').then(
    (module) => ({
      default: module.ErxesMessengerActions,
    }),
  ),
);

const FacebookIntegrationActions = lazy(() =>
  import('../facebook/components/FacebookIntegrationDetail').then((module) => ({
    default: module.FacebookIntegrationActions,
  })),
);

const CallIntegrationActions = lazy(() =>
  import('../call/components/CallIntegrationDetail').then((module) => ({
    default: module.CallIntegrationActions,
  })),
);

const CallProIntegrationActions = lazy(() =>
  import('../callpro/components/CallProIntegrationDetail').then((module) => ({
    default: module.CallProIntegrationActions,
  })),
);

const MailIntegrationActions = lazy(() =>
  import('../mail/components/MailIntegrationDetail').then((module) => ({
    default: module.MailIntegrationActions,
  })),
);

const InstagramIntegrationActions = lazy(() =>
  import('../instagram/components/InstagramIntegrationDetail').then(
    (module) => ({
      default: module.InstagramIntegrationActions,
    }),
  ),
);

const DiscordIntegrationActions = lazy(() =>
  import('../discord/components/DiscordIntegrationActions').then((module) => ({
    default: module.DiscordIntegrationActions,
  })),
);

const TelegramIntegrationActions = lazy(() =>
  import('../telegram/TelegramIntegrationDetail').then((module) => ({
    default: module.TelegramIntegrationActions,
  })),
);

const FACEBOOK_KINDS: string[] = [
  IntegrationType.FACEBOOK_MESSENGER,
  IntegrationType.FACEBOOK_POST,
];

const INSTAGRAM_KINDS: string[] = [
  IntegrationType.INSTAGRAM_MESSENGER,
  IntegrationType.INSTAGRAM_POST,
];

// Kinds with an edit action below; others (e.g. lead forms) get no Edit item.
const EDITABLE_KINDS: string[] = [
  IntegrationType.ERXES_MESSENGER,
  ...FACEBOOK_KINDS,
  ...INSTAGRAM_KINDS,
  IntegrationType.CALL,
  IntegrationType.CALLPRO,
  IntegrationType.MAIL,
  IntegrationType.DISCORD_MESSENGER,
  IntegrationType.TELEGRAM_MESSENGER,
];

export const isRepairableIntegration = (kind: string) =>
  FACEBOOK_KINDS.includes(kind) ||
  INSTAGRAM_KINDS.includes(kind) ||
  kind === IntegrationType.DISCORD_MESSENGER;

/** The kind's own repair action, for every place an integration is listed. */
export const IntegrationRepairAction = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  if (FACEBOOK_KINDS.includes(integration.kind)) {
    return <FacebookIntegrationRepair integration={integration} />;
  }

  if (INSTAGRAM_KINDS.includes(integration.kind)) {
    return <InstagramIntegrationRepair integration={integration} />;
  }

  if (integration.kind === IntegrationType.DISCORD_MESSENGER) {
    return <DiscordIntegrationRepair integration={integration} />;
  }

  return null;
};

const IntegrationEditAction = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  const { kind } = integration;

  return (
    <Suspense fallback={<div />}>
      {kind === IntegrationType.ERXES_MESSENGER && (
        <ErxesMessengerActions integration={integration} />
      )}
      {FACEBOOK_KINDS.includes(kind) && (
        <FacebookIntegrationActions integration={integration} />
      )}
      {kind === IntegrationType.CALL && (
        <CallIntegrationActions integration={integration} />
      )}
      {kind === IntegrationType.CALLPRO && (
        <CallProIntegrationActions integration={integration} />
      )}
      {kind === IntegrationType.MAIL && (
        <MailIntegrationActions integration={integration} />
      )}
      {INSTAGRAM_KINDS.includes(kind) && (
        <InstagramIntegrationActions integration={integration} />
      )}
      {kind === IntegrationType.DISCORD_MESSENGER && (
        <DiscordIntegrationActions integration={integration} />
      )}
      {kind === IntegrationType.TELEGRAM_MESSENGER && (
        <TelegramIntegrationActions integration={integration} />
      )}
    </Suspense>
  );
};

/** Row actions of one integration, independent of the page it is listed on. */
export const IntegrationActionsMenu = ({
  integration,
  trigger,
}: {
  integration: IIntegration;
  trigger?: ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, name, isActive, channelId, kind } = integration;
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <Popover.Trigger asChild>
          {trigger ?? <RecordTable.MoreButton className="w-full h-full" />}
        </Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              {EDITABLE_KINDS.includes(kind) && (
                <Command.Item value="edit">
                  <IntegrationEditAction integration={integration} />
                </Command.Item>
              )}
              {kind === IntegrationType.ERXES_MESSENGER && (
                <Command.Item value="install">
                  <EMInstallScript integrationId={_id} />
                </Command.Item>
              )}
              {isRepairableIntegration(kind) && (
                <Command.Item value="repair">
                  <IntegrationRepairAction integration={integration} />
                </Command.Item>
              )}
              <Command.Item
                value="move"
                onSelect={() => {
                  setMenuOpen(false);
                  setMoveOpen(true);
                }}
              >
                <IconArrowBarToRight />
                {t('move-to-channel', 'Move to Channel')}
              </Command.Item>
              <Command.Item value="archive">
                <ArchiveIntegration
                  _id={_id}
                  name={name}
                  isActive={isActive ?? false}
                />
              </Command.Item>
              <Command.Item value="remove">
                <RemoveIntegration _id={_id} name={name} />
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <MoveToChannelDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        resourceType={ChannelResourceType.INTEGRATION}
        resourceIds={[_id]}
        sourceChannelId={channelId ?? ''}
      />
    </>
  );
};

export const integrationMoreColumn = (
  showColumnSelector = false,
): ColumnDef<IIntegration> => ({
  id: 'more',
  header: showColumnSelector ? () => <RecordTable.ColumnSelector /> : undefined,
  cell: (cell: CellContext<IIntegration, unknown>) => (
    <IntegrationActionsMenu integration={cell.row.original} />
  ),
  size: 33,
});
