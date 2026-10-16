import {
  IconBolt,
  IconChevronRight,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { Badge, Button, InfoCard, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSourceAutomations } from '../hooks/useSourceAutomations';
import { useSourceAutomationRemove } from '../hooks/useSourceAutomationRemove';

/** A sales record's automations, and where new ones for it start. */
export const SourceAutomations = ({
  hint,
  empty,
  allLabel,
  ...hookOptions
}: Parameters<typeof useSourceAutomations>[0] & {
  hint: string;
  empty: string;
  allLabel: string;
}) => {
  const { t } = useTranslation('sales');
  const { automations, loading, error, editPath, createAutomation } =
    useSourceAutomations(hookOptions);
  const { removeAutomation, removing } = useSourceAutomationRemove();

  return (
    <div className="p-6">
      <InfoCard title={t('pos-automations', 'Automations')}>
        <InfoCard.Content className="space-y-4">
          <p className="text-sm text-muted-foreground">{hint}</p>

          {loading && !automations.length && (
            <Skeleton className="h-9 w-full" />
          )}

          {error && (
            <p className="text-sm text-destructive">
              {t('pos-automations-failed', {
                defaultValue: 'Could not load automations: {{message}}',
                message: error.message,
              })}
            </p>
          )}

          {!loading && !error && !automations.length && (
            <p className="text-sm text-muted-foreground">{empty}</p>
          )}

          {!!automations.length && (
            <div className="flex flex-col gap-2">
              {automations.map(({ _id, name, status, events, isAll }) => (
                <div
                  key={_id}
                  className="flex items-center gap-1 rounded-md border pr-1 transition-colors hover:bg-accent"
                >
                  <Link
                    to={editPath(_id)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-sm"
                  >
                    <IconBolt className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {name || t('untitled', 'Untitled')}
                    </span>
                    {isAll && <Badge variant="secondary">{allLabel}</Badge>}
                    {!!events.length && (
                      <span className="truncate text-xs text-muted-foreground">
                        {events.join(' · ')}
                      </span>
                    )}
                    <Badge
                      variant={status === 'active' ? 'success' : 'secondary'}
                    >
                      {status || 'draft'}
                    </Badge>
                    <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t('delete', 'Delete')}
                    disabled={removing}
                    onClick={() => removeAutomation(_id, name)}
                  >
                    <IconTrash />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="button" variant="secondary" onClick={createAutomation}>
            <IconPlus />
            {t('pos-other-automation', 'Other automation')}
          </Button>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
