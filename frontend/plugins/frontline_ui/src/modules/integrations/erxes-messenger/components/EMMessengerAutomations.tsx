import { useQuery } from '@apollo/client';
import { IconBolt, IconExternalLink } from '@tabler/icons-react';
import { Badge, Button, Label, Skeleton, isDefined } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buildAutomationSeedLink } from 'ui-modules';
import { EM_MESSENGER_AUTOMATIONS } from '@/integrations/erxes-messenger/graphql/queries/emAutomationsQueries';

const MESSENGER_MESSAGE_TRIGGER = 'frontline:inbox.messages';

const isForMessenger = (config: unknown, integrationId: string) =>
  typeof config === 'object' &&
  config !== null &&
  'integrationId' in config &&
  config.integrationId === integrationId;

/**
 * Automations answering this messenger, like a Facebook bot's. Links open in a
 * new tab so the setup sheet keeps its unsaved changes.
 */
export const EMMessengerAutomations = ({
  integrationId,
}: {
  integrationId?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { data, loading } = useQuery(EM_MESSENGER_AUTOMATIONS, {
    variables: { triggerTypes: [MESSENGER_MESSAGE_TRIGGER] },
    skip: !integrationId,
  });

  if (!integrationId) {
    return (
      <p className="text-sm text-muted-foreground">
        {t(
          'messenger-automations-after-save',
          'Save the messenger first; then automations can listen to it.',
        )}
      </p>
    );
  }

  const automations = (data?.automations ?? [])
    .filter(isDefined)
    .filter((automation) =>
      (automation.triggers ?? []).some(
        (trigger) =>
          trigger?.type === MESSENGER_MESSAGE_TRIGGER &&
          isForMessenger(trigger.config, integrationId),
      ),
    );

  const seedLink = buildAutomationSeedLink({
    triggerType: MESSENGER_MESSAGE_TRIGGER,
    triggerConfig: { integrationId },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Label>
          {t('connected-automations', {
            defaultValue: 'Connected automations',
          })}
        </Label>
        {!loading && automations.length > 0 && (
          <Badge variant="secondary">{automations.length}</Badge>
        )}
      </div>
      {loading && <Skeleton className="h-8 w-full" />}
      {!loading && !automations.length && (
        <p className="text-sm text-muted-foreground">
          {t(
            'no-messenger-automations',
            'No automation listens to this messenger yet.',
          )}
        </p>
      )}
      {automations.map(({ _id, name, status }) => (
        <Link
          key={_id}
          to={`/automations/edit/${_id}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
        >
          <IconBolt className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">{name}</span>
          <Badge variant={status === 'active' ? 'success' : 'secondary'}>
            {status || 'draft'}
          </Badge>
          <IconExternalLink className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      ))}
      <Button type="button" variant="secondary" className="self-start" asChild>
        <Link to={seedLink} target="_blank" rel="noreferrer">
          <IconBolt />
          {t('create-automation', { defaultValue: 'Create automation' })}
        </Link>
      </Button>
    </div>
  );
};
