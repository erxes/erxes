import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  usePagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import {
  IconCalendarClock,
  IconCalendarOff,
  IconCopy,
  IconPencil,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconLock,
  IconBroadcast,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ApprovalLockButton,
  ApprovalLockedBadge,
  ApprovalRequestAccessButton,
  Can,
  PageHeader,
  RecordSidePanel,
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

const getDetailSearch = (search: string): string => {
  const params = new URLSearchParams(search);
  [
    'messageId',
    'editMessageId',
    'method',
    'panel',
    'panelHistory',
    'panelTab',
    'panelExpanded',
  ].forEach((key) => params.delete(key));
  const query = params.toString();
  return query ? `?${query}` : '';
};

export const BroadcastDetailSheet = ({ page = false }: { page?: boolean }) => {
  const [queryMessageId, setMessageId] = useQueryState<string>('messageId');
  const { messageId: routeMessageId } = useParams<{ messageId: string }>();
  const messageId = page ? routeMessageId : queryMessageId;
  const { search } = useLocation();
  const navigate = useNavigate();
  const pagePanel = usePagePanel({
    name: 'broadcast/BroadcastDetailSheet',
    page,
    open: !!messageId,
    onOpenChange: (open) => {
      if (open) return;
      if (page) navigate(`/broadcasts${getDetailSearch(search)}`);
      else setMessageId(null);
    },
    onExpand:
      page || !messageId
        ? undefined
        : () =>
            navigate(
              `/broadcasts/${encodeURIComponent(messageId)}${getDetailSearch(
                search,
              )}`,
            ),
    identity: messageId || 'new',
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed ? (
        <BroadcastDetailProvider messageId={messageId || undefined}>
          <BroadcastDetailSheetHeader />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <BroadcastDetail />
          </div>
        </BroadcastDetailProvider>
      ) : (
        <PagePanelStatus entry={pagePanel} />
      )}
    </div>,
    pagePanel,
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
  const controls = (
    <>
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
  );
  const title = message?.title || t('untitled');
  const header = (
    <RecordSidePanel.Header
      className={entry.page ? 'w-full border-0 bg-transparent px-0' : undefined}
      title={
        entry.page ? (
          <Breadcrumb>
            <Breadcrumb.List className="flex-nowrap gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" onClick={entry.onClose}>
                  <IconBroadcast />
                  {t('broadcast')}
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item className="min-w-0">
                <Breadcrumb.Page className="truncate px-3" title={title}>
                  {title}
                </Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        ) : (
          <TextOverflowTooltip value={title} />
        )
      }
      {...entry.headerProps}
      actions={<ApprovalLockedBadge state={lockState ?? undefined} />}
    />
  );

  return (
    <>
      {entry.page ? (
        <PageHeader>
          <PageHeader.Start className="min-w-0 flex-1 pr-0">
            {header}
          </PageHeader.Start>
        </PageHeader>
      ) : (
        header
      )}
      <div className="flex flex-none flex-wrap items-center gap-1 border-b px-3 py-2">
        {controls}
      </div>
    </>
  );
};
