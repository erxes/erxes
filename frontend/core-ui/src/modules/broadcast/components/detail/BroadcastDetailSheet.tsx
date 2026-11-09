import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  usePagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { IconBroadcast } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApprovalLockedBadge, PageHeader, RecordSidePanel } from 'ui-modules';
import {
  BroadcastDetailProvider,
  useBroadcastDetail,
} from '@/broadcast/context/BroadcastDetailContext';
import { BroadcastDetailActions } from '@/broadcast/components/detail/BroadcastDetailActions';
import { BroadcastDetail } from '@/broadcast/components/detail/BroadcastDetail';
import { useTranslation } from 'react-i18next';
import { broadcastPageSearch } from '@/broadcast/utils/broadcastPageSearch';

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
      if (page) navigate(`/broadcasts${broadcastPageSearch(search)}`);
      else setMessageId(null);
    },
    onExpand:
      page || !messageId
        ? undefined
        : () =>
            navigate(
              `/broadcasts/${encodeURIComponent(
                messageId,
              )}${broadcastPageSearch(search)}`,
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
  const { message } = useBroadcastDetail();
  const lockState = message?.approvalLockState;
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
      actions={
        <>
          <ApprovalLockedBadge state={lockState ?? undefined} />
          {message && <BroadcastDetailActions />}
        </>
      }
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
    </>
  );
};
