import { useBroadcastCampaignActions } from '@/broadcast/hooks/useBroadcastCampaignActions';
import { useTranslation } from 'react-i18next';
import {
  IconCalendarClock,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import {
  Badge,
  Combobox,
  Command,
  Popover,
  RecordTableInlineCell,
} from 'erxes-ui';
import { ApprovalLockedBadge, Can } from 'ui-modules';
import { campaignStatus, TCampaignRow } from '../../../utils/campaignStatus';
import { BroadcastScheduleDialog } from '../../common/BroadcastScheduleDialog';

export const BroadcastStatusCell = ({ row }: { row: TCampaignRow }) => {
  const { t } = useTranslation('broadcasts');
  const { labelKey, style } = campaignStatus(row);
  const {
    canGoLive,
    canResume,
    canPause,
    canSchedule,
    goLiveLabel,
    goLive,
    pause,
    schedule,
    scheduleDialog,
  } = useBroadcastCampaignActions(row);

  const canStart = canGoLive || canResume;
  const badge = (
    <span className="flex items-center gap-1">
      <Badge variant={style}>{t(labelKey)}</Badge>
      {/* Says why nothing is on offer here, which an unresponsive badge would
          otherwise leave to guesswork. */}
      <ApprovalLockedBadge state={row.approvalLockState ?? undefined} />
    </span>
  );

  if (!canPause && !canStart) {
    return <RecordTableInlineCell>{badge}</RecordTableInlineCell>;
  }

  return (
    <Can action="broadcastUpdate" fallback={badge}>
      <BroadcastScheduleDialog {...scheduleDialog} />
      <Popover>
        <Popover.Trigger asChild>
          <RecordTableInlineCell className="cursor-pointer">
            {badge}
          </RecordTableInlineCell>
        </Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              {canStart && (
                <Command.Item value="live" onSelect={goLive}>
                  <IconPlayerPlayFilled /> {goLiveLabel}
                </Command.Item>
              )}
              {canSchedule && (
                <Command.Item value="schedule" onSelect={schedule}>
                  <IconCalendarClock /> {t('actions.schedule')}
                </Command.Item>
              )}
              {canPause && (
                <Command.Item value="pause" onSelect={pause}>
                  <IconPlayerPauseFilled /> {t('actions.pause')}
                </Command.Item>
              )}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Can>
  );
};
