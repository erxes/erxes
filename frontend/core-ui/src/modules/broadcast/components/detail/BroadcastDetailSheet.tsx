import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  usePagePanelContext,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import {
  IconCalendarClock,
  IconCalendarOff,
  IconCopy,
  IconPencil,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconLock,
} from '@tabler/icons-react';
import { Button, cn, TextOverflowTooltip, useQueryState } from 'erxes-ui';
import {
  ApprovalLockButton,
  ApprovalLockedBadge,
  ApprovalRequestAccessButton,
  Can,
  RecordSidePanel,
  SidePanelRecordPathContext,
} from 'ui-modules';
import { BROADCAST_APPROVAL_CONTENT_TYPE } from '@/broadcast/constants';
import { useBroadcastCampaignActions } from '@/broadcast/hooks/useBroadcastCampaignActions';
import {
  BroadcastDetailProvider,
  useBroadcastDetail,
} from '@/broadcast/context/BroadcastDetailContext';
import { BroadcastScheduleDialog } from '@/broadcast/components/common/BroadcastScheduleDialog';
import { BroadcastDetail } from '@/broadcast/components/detail/BroadcastDetail';
import { useTranslation } from 'react-i18next';
export const BroadcastDetailSheet = () => {
  const [messageId, setMessageId] = useQueryState<string>('messageId');
  const pagePanel = usePagePanel({
    name: 'broadcast/BroadcastDetailSheet',
    open: !!messageId,
    onOpenChange: (open) => {
      if (!open) setMessageId(null);
    },
    identity: messageId || 'new',
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    <BroadcastDetailProvider>
                      <BroadcastDetailSheetHeader />
                      <div
                        className={cn(
                          'flex min-h-0 flex-1 flex-col overflow-y-auto',
                          'overflow-y-auto',
                        )}
                      >
                        <BroadcastDetail />
                      </div>
                    </BroadcastDetailProvider>
                  </>
                ) : (
                  <PagePanelStatus entry={pagePanel} />
                )}
              </div>,
              pagePanel.target,
            )
          : null}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};
const BroadcastDetailSheetHeader = () => {
  const { t } = useTranslation('broadcasts');
  const entry = usePagePanelContext();
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
    <RecordSidePanel.Header
      className="h-auto min-h-10 flex-wrap gap-y-1 py-1 [&>div]:max-w-full"
      title={<TextOverflowTooltip value={message?.title} />}
      onBack={entry.onBack}
      onClose={entry.onClose}
      expanded={entry.expanded}
      onExpand={entry.onExpand}
      actions={
        <>
          <ApprovalLockedBadge state={lockState ?? undefined} />

          <div className="flex max-w-full flex-wrap items-center gap-1">
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
        </>
      }
    />
  );
};
