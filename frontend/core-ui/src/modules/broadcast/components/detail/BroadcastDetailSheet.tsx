import {
  IconCalendarClock,
  IconCalendarOff,
  IconCopy,
  IconPencil,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  Sheet,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import {
  ApprovalLockButton,
  ApprovalLockedBadge,
  ApprovalRequestAccessButton,
  Can,
} from 'ui-modules';
import { IconLock } from '@tabler/icons-react';
import { BROADCAST_APPROVAL_CONTENT_TYPE } from '../../constants';
import { useBroadcastCampaignActions } from '../../hooks/useBroadcastCampaignActions';
import {
  BroadcastDetailProvider,
  useBroadcastDetail,
} from '../../context/BroadcastDetailContext';
import { BroadcastScheduleDialog } from '../common/BroadcastScheduleDialog';
import { BroadcastDetail } from './BroadcastDetail';
import { useTranslation } from 'react-i18next';

export const BroadcastDetailSheet = () => {
  const [messageId, setMessageId] = useQueryState<string>('messageId');

  return (
    <Sheet
      open={!!messageId}
      onOpenChange={() => {
        setMessageId(null);
      }}
    >
      <Sheet.View
        className={cn(
          'p-0 md:max-w-5xl md:w-[calc(100vw-(--spacing(4)))] xl:w-3/4 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none',
        )}
      >
        <BroadcastDetailProvider>
          <Sheet.Header>
            <BroadcastDetailSheetHeader />
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="overflow-y-auto">
            <BroadcastDetail />
          </Sheet.Content>
        </BroadcastDetailProvider>
      </Sheet.View>
    </Sheet>
  );
};

const BroadcastDetailSheetHeader = () => {
  const { t } = useTranslation('broadcasts');
  const { messageId, message, refetch } = useBroadcastDetail();

  const {
    canEdit,
    canGoLive,
    canResume,
    canPause,
    canCopy,
    canCancelSchedule,
    canSchedule,
    goLiveLabel,
    edit,
    duplicate,
    goLive,
    pause,
    schedule,
    scheduleDialog,
    cancelSchedule,
    locked,
  } = useBroadcastCampaignActions(message ?? null);

  const canStart = canGoLive || canResume;
  const lockState = message?.approvalLockState;

  return (
    <div className="flex flex-1 items-center gap-2">
      <Sheet.Title className="lg:max-w-xl max-w-[18rem] sm:max-w-sm truncate">
        <TextOverflowTooltip value={message?.title} />
      </Sheet.Title>

      <ApprovalLockedBadge state={lockState ?? undefined} />

      <div className="ml-auto mr-2 flex items-center gap-2">
        {/* Locked and not ours: asking is the only thing left to offer. */}
        {locked && (
          <ApprovalRequestAccessButton
            contentType={BROADCAST_APPROVAL_CONTENT_TYPE}
            contentId={messageId}
            pendingRequest={lockState?.pendingRequest}
            onCompleted={() => refetch?.()}
          />
        )}

        <Can action="approvalLocksManage">
          {/* No owner is named: whoever locks the campaign keeps access and
                names who else does, so its author can be kept outside the
                decision to send. */}
          <ApprovalLockButton
            contentType={BROADCAST_APPROVAL_CONTENT_TYPE}
            contentId={messageId}
            state={lockState || undefined}
            onChanged={() => refetch?.()}
            whenUnlocked={({ loading }) => (
              <Button variant="outline" size="sm" disabled={loading}>
                <IconLock className="size-4" />
                {t('approval.lock')}
              </Button>
            )}
          />
        </Can>

        {canCopy && (
          <Can action="broadcastCreate">
            <Button variant="outline" size="sm" onClick={duplicate}>
              <IconCopy className="size-4" />
              {t('actions.duplicate')}
            </Button>
          </Can>
        )}

        {canEdit && (
          <Can action="broadcastUpdate">
            <Button variant="outline" size="sm" onClick={edit}>
              <IconPencil className="size-4" />
              {t('actions.edit')}
            </Button>
          </Can>
        )}

        {canSchedule && (
          <Can action="broadcastUpdate">
            <Button variant="outline" size="sm" onClick={schedule}>
              <IconCalendarClock className="size-4" />
              {t('actions.schedule-short')}
            </Button>
          </Can>
        )}

        {canCancelSchedule && (
          <Can action="broadcastUpdate">
            <Button variant="outline" size="sm" onClick={cancelSchedule}>
              <IconCalendarOff className="size-4" />
              {t('actions.cancel-schedule')}
            </Button>
          </Can>
        )}

        {canStart && (
          <Can action="broadcastUpdate">
            <Button
              variant="outline"
              size="sm"
              className="text-success"
              onClick={goLive}
            >
              <IconPlayerPlayFilled className="size-4" />
              {goLiveLabel}
            </Button>
          </Can>
        )}

        {canPause && (
          <Can action="broadcastUpdate">
            <Button
              variant="outline"
              size="sm"
              className="text-warning"
              onClick={pause}
            >
              <IconPlayerPauseFilled className="size-4" />
              {t('actions.pause')}
            </Button>
          </Can>
        )}
      </div>

      <BroadcastScheduleDialog {...scheduleDialog} />
    </div>
  );
};
