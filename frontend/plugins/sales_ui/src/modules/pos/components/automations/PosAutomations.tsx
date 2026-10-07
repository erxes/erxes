import {
  IconBolt,
  IconChevronRight,
  IconPlus,
  IconStar,
} from '@tabler/icons-react';
import { Badge, Button, InfoCard, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { usePosAutomations } from '@/pos/hooks/usePosAutomations';

/** What this POS's orders set off, and where new rules for them start. */
export const PosAutomations = ({
  posId,
  posName,
}: {
  posId?: string;
  posName?: string;
}) => {
  const { t } = useTranslation('sales');
  const {
    automations,
    editPath,
    loading,
    error,
    canGivePoints,
    createPointsAutomation,
    createAutomation,
  } = usePosAutomations(posId, posName);

  return (
    <div className="p-6">
      <InfoCard title={t('pos-automations', 'Automations')}>
        <InfoCard.Content className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t(
              'pos-automations-hint',
              'Rules that run on this POS’s orders: points, vouchers, messages. Each one is a regular automation you can edit in the builder.',
            )}
          </p>

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
            <p className="text-sm text-muted-foreground">
              {t(
                'pos-automations-empty',
                'No automation runs on this POS’s orders yet.',
              )}
            </p>
          )}

          {!!automations.length && (
            <div className="flex flex-col gap-2">
              {automations.map(
                ({ _id, name, status, eventTypes, isAllPos }) => (
                  <Link
                    key={_id}
                    to={editPath(_id)}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <IconBolt className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {name || t('untitled', 'Untitled')}
                    </span>
                    {isAllPos && (
                      <Badge variant="secondary">
                        {t('pos-automation-all-pos', 'All POS')}
                      </Badge>
                    )}
                    {!!eventTypes.length && (
                      <span className="truncate text-xs text-muted-foreground">
                        {eventTypes.join(' · ')}
                      </span>
                    )}
                    <Badge
                      variant={status === 'active' ? 'success' : 'secondary'}
                    >
                      {status || 'draft'}
                    </Badge>
                    <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                ),
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {canGivePoints && (
              <Button type="button" onClick={createPointsAutomation}>
                <IconStar />
                {t('pos-give-points-on-purchase', 'Give points on purchase')}
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={createAutomation}
            >
              <IconPlus />
              {t('pos-other-automation', 'Other automation')}
            </Button>
          </div>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
