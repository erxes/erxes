import {
  IconAlertTriangle,
  IconCake,
  IconChevronRight,
  IconUnlink,
} from '@tabler/icons-react';
import { Badge, Button, RelativeDateDisplay, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useBirthdayRewardParts } from '../hooks/useBirthdayRewardParts';
import { TBirthdayReward } from '../hooks/useVoucherBirthdayReward';

export const BirthdayRewardRow = ({ reward }: { reward: TBirthdayReward }) => {
  const { t } = useTranslation('loyalty');
  const {
    busy,
    on,
    broken,
    canToggle,
    nextRunAt,
    lastRunAt,
    broadcastPath,
    automationPath,
    toggle,
    disconnect,
  } = useBirthdayRewardParts(reward);

  return (
    <div className="flex flex-col gap-2 rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <IconCake className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-medium">
          {t('birthday-reward-title')}
        </span>
        {broken && (
          <Badge variant="warning">
            <IconAlertTriangle />
            {t('birthday-reward-broken')}
          </Badge>
        )}
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Switch
            checked={on}
            disabled={busy || !canToggle}
            onCheckedChange={toggle}
          />
          {on ? t('loyalty-source-on') : t('loyalty-source-off')}
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={disconnect}
        >
          <IconUnlink />
          {t('loyalty-source-disconnect')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-6 text-xs text-muted-foreground">
        <span>
          {t('birthday-reward-next-run')}{' '}
          {nextRunAt ? (
            <RelativeDateDisplay value={nextRunAt}>
              <RelativeDateDisplay.Value value={nextRunAt} />
            </RelativeDateDisplay>
          ) : (
            '—'
          )}
        </span>
        <span>
          {t('birthday-reward-last-run')}{' '}
          {lastRunAt ? (
            <RelativeDateDisplay value={lastRunAt}>
              <RelativeDateDisplay.Value value={lastRunAt} />
            </RelativeDateDisplay>
          ) : (
            t('birthday-reward-never')
          )}
        </span>
        {broadcastPath && (
          <Link
            to={broadcastPath}
            className="inline-flex items-center hover:underline"
          >
            {t('birthday-reward-nightly')}
            <IconChevronRight className="size-3" />
          </Link>
        )}
        {automationPath && (
          <Link
            to={automationPath}
            className="inline-flex items-center hover:underline"
          >
            {t('birthday-reward-daytime')}
            <IconChevronRight className="size-3" />
          </Link>
        )}
      </div>
    </div>
  );
};
