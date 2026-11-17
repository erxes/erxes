import { BROADCAST_APPROVAL_CONTENT_TYPE } from '@/broadcast/constants';
import { BroadcastScheduleDialog } from '@/broadcast/components/common/BroadcastScheduleDialog';
import { useBroadcastDetail } from '@/broadcast/context/BroadcastDetailContext';
import { useBroadcastCampaignActions } from '@/broadcast/hooks/useBroadcastCampaignActions';
import {
  IconCalendarClock,
  IconCalendarOff,
  IconCopy,
  IconDotsVertical,
  IconLock,
  IconLockOpen,
  IconPencil,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPrinter,
} from '@tabler/icons-react';
import { Button, Dialog, DropdownMenu, Spinner } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ApprovalLockForm,
  ApprovalRequestAccessButton,
  Can,
  PrintDocument,
  useApprovalLock,
  usePermissionCheck,
} from 'ui-modules';

export const BroadcastDetailActions = () => {
  const { t } = useTranslation('broadcasts');
  const { t: approvalT } = useTranslation('approval');
  const { t: documentsT } = useTranslation('documents', {
    keyPrefix: 'document',
  });
  const { messageId, message, error, refetch } = useBroadcastDetail();
  const { hasActionPermission } = usePermissionCheck();
  const trigger = useRef<HTMLButtonElement>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const actions = useBroadcastCampaignActions(message ?? null);
  const lockState = message?.approvalLockState;
  const lock = useApprovalLock({
    contentType: BROADCAST_APPROVAL_CONTENT_TYPE,
    contentId: messageId,
    state: lockState || undefined,
    onChanged: () => refetch(),
  });
  const canStart = actions.canGoLive || actions.canResume;
  const canPrint =
    Boolean(message) &&
    !error &&
    !actions.locked &&
    hasActionPermission('documentsRead');
  const hasActions =
    canPrint ||
    hasActionPermission('approvalLocksManage') ||
    (actions.canCopy && hasActionPermission('broadcastCreate')) ||
    (hasActionPermission('broadcastUpdate') &&
      (actions.canEdit ||
        actions.canSchedule ||
        actions.canCancelSchedule ||
        canStart ||
        actions.canPause));

  return (
    <>
      {actions.locked && (
        <ApprovalRequestAccessButton
          contentType={BROADCAST_APPROVAL_CONTENT_TYPE}
          contentId={messageId}
          pendingRequest={lockState?.pendingRequest}
          onCompleted={() => refetch()}
        />
      )}
      {hasActions && (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              ref={trigger}
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t('actions.more', 'More actions')}
            >
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            align="end"
            className="min-w-48"
            onCloseAutoFocus={(event) => {
              if (lock.open || actions.scheduleDialog.open || printOpen)
                event.preventDefault();
            }}
          >
            {canPrint && (
              <DropdownMenu.Item onSelect={() => setPrintOpen(true)}>
                <IconPrinter />
                {documentsT('print')}
              </DropdownMenu.Item>
            )}
            <Can action="approvalLocksManage">
              <DropdownMenu.Item
                disabled={lock.loading || (lock.isLocked && !lock.canRelease)}
                onSelect={() =>
                  lock.isLocked ? void lock.onRelease() : lock.setOpen(true)
                }
              >
                {lock.isLocked ? <IconLockOpen /> : <IconLock />}
                {lock.isLocked ? approvalT('unlock') : approvalT('lock')}
              </DropdownMenu.Item>
            </Can>
            {actions.canCopy && (
              <Can action="broadcastCreate">
                <DropdownMenu.Item onSelect={actions.duplicate}>
                  <IconCopy />
                  {t('actions.duplicate')}
                </DropdownMenu.Item>
              </Can>
            )}
            {actions.canEdit && (
              <Can action="broadcastUpdate">
                <DropdownMenu.Item onSelect={actions.edit}>
                  <IconPencil />
                  {t('actions.edit')}
                </DropdownMenu.Item>
              </Can>
            )}
            {actions.canSchedule && (
              <Can action="broadcastUpdate">
                <DropdownMenu.Item onSelect={actions.schedule}>
                  <IconCalendarClock />
                  {t('actions.schedule-short')}
                </DropdownMenu.Item>
              </Can>
            )}
            {actions.canCancelSchedule && (
              <Can action="broadcastUpdate">
                <DropdownMenu.Item onSelect={actions.cancelSchedule}>
                  <IconCalendarOff />
                  {t('actions.cancel-schedule')}
                </DropdownMenu.Item>
              </Can>
            )}
            {canStart && (
              <Can action="broadcastUpdate">
                <DropdownMenu.Item
                  className="text-success"
                  onSelect={actions.goLive}
                >
                  <IconPlayerPlayFilled />
                  {actions.goLiveLabel}
                </DropdownMenu.Item>
              </Can>
            )}
            {actions.canPause && (
              <Can action="broadcastUpdate">
                <DropdownMenu.Item
                  className="text-warning"
                  onSelect={actions.pause}
                >
                  <IconPlayerPauseFilled />
                  {t('actions.pause')}
                </DropdownMenu.Item>
              </Can>
            )}
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
      {canPrint && (
        <PrintDocument
          items={[]}
          contentType="core:broadcast"
          open={printOpen}
          onOpenChange={setPrintOpen}
          trigger={null}
        />
      )}
      <Can action="approvalLocksManage">
        <Dialog open={lock.open} onOpenChange={lock.setOpen}>
          <Dialog.Content
            className="max-w-lg"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              trigger.current?.focus();
            }}
          >
            <Dialog.Header>
              <Dialog.Title>{approvalT('lock-dialog-title')}</Dialog.Title>
              <Dialog.Description>
                {approvalT('lock-dialog-description')}
              </Dialog.Description>
            </Dialog.Header>
            <ApprovalLockForm form={lock.form} />
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="ghost">{approvalT('cancel')}</Button>
              </Dialog.Close>
              <Button
                disabled={lock.loading}
                onClick={() => void lock.onCreate()}
              >
                {lock.loading ? <Spinner /> : <IconLock />}
                {approvalT('lock')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </Can>
      <BroadcastScheduleDialog {...actions.scheduleDialog} />
    </>
  );
};
