import { IconBolt, IconChevronRight } from '@tabler/icons-react';
import { Badge, Label, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useFacebookBotAutomations } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotAutomations';

/** Automations already listening to this bot, linked from its own form. */
export const FacebookBotAutomations = ({ botId }: { botId?: string }) => {
  const { t } = useTranslation('frontline');
  const { automations, loading } = useFacebookBotAutomations(botId);

  if (!botId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Label>
          {t('connected-automations', { defaultValue: 'Connected automations' })}
        </Label>
        {!loading && automations.length > 0 && (
          <Badge variant="secondary">{automations.length}</Badge>
        )}
      </div>
      {loading && <Skeleton className="h-8 w-full" />}
      {!loading && !automations.length && (
        <p className="text-sm text-muted-foreground">
          {t('no-connected-automations', {
            defaultValue: 'No automation listens to this bot yet.',
          })}
        </p>
      )}
      {automations.length > 0 && (
        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
          {automations.map(({ _id, name, status }) => (
            <Link
              key={_id}
              to={`/automations/edit/${_id}`}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <IconBolt className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{name}</span>
              <Badge variant={status === 'active' ? 'success' : 'secondary'}>
                {status || 'draft'}
              </Badge>
              <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
