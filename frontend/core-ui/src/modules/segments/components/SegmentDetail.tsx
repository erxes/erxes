import {
  PagePanelStatus,
  PanelEmptyState,
} from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanelContext,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import {
  IconPlus,
  IconCode,
  IconChartBar,
  IconBolt,
} from '@tabler/icons-react';
import { Button, ScrollArea, useQueryState, Spinner } from 'erxes-ui';
import { type MutableRefObject, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Can,
  SegmentForm,
  SegmentOverview,
  useSegmentDetail,
  RecordSidePanel,
  type TSegmentForm,
} from 'ui-modules';
import { SegmentAutomationCreateButton } from '@/segments/components/SegmentAutomationCreateButton';
import { SegmentAutomations } from '@/segments/components/SegmentAutomations';
import { SegmentDetailHeader } from '@/segments/components/SegmentDetailHeader';
import { SegmentPageDraft } from '@/segments/components/SegmentPageDraft';
type Props = {
  onRefresh: () => void;
  page?: boolean;
};
const SegmentDetailBody = ({
  contentType,
  segmentId,
  onRefresh,
  onCreated,
  onOpenExisting,
  draft,
  initialDraft,
}: {
  contentType: string;
  segmentId: string;
  onRefresh: () => void;
  onCreated: (id: string) => void;
  onOpenExisting: (id: string) => void;
  draft: MutableRefObject<(() => TSegmentForm) | null>;
  initialDraft?: TSegmentForm;
}) => {
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { segment, refetch } = useSegmentDetail(segmentId);
  const { t } = useTranslation('segment');
  const { t: detailT } = useTranslation('segment', {
    keyPrefix: 'detail',
  });
  const pagePanel = usePagePanelContext();
  const title = segmentId
    ? segment?.name || `${t('edit')} ${t('a-segment')}`
    : `${t('create')} ${t('a-segment')}`;
  const definition = {
    value: 'definition',
    label: detailT('definition'),
    icon: IconCode,
    content: (
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <SegmentForm.Root contentType={contentType} segmentId={segmentId}>
          <SegmentForm.Wrapper>
            <SegmentPageDraft draft={draft} initialDraft={initialDraft} />
            <SegmentForm.Header />
            <SegmentForm.Content className="px-5 pb-4" />
            <SegmentForm.Footer
              callback={onRefresh}
              onCreateSuccess={onCreated}
              onOpenExisting={onOpenExisting}
            />
          </SegmentForm.Wrapper>
        </SegmentForm.Root>
      </div>
    ),
  };
  const tabs = segmentId
    ? [
        {
          value: 'overview',
          label: detailT('overview'),
          icon: IconChartBar,
          content: (
            <ScrollArea className="min-h-0 flex-1">
              <SegmentOverview
                segment={segment}
                onRefresh={refetch}
                actions={
                  <SegmentAutomationCreateButton segment={segment} size="sm" />
                }
              />
            </ScrollArea>
          ),
        },
        definition,
        {
          value: 'automations',
          label: detailT('automations'),
          icon: IconBolt,
          content: (
            <ScrollArea className="min-h-0 flex-1">
              <SegmentAutomations segment={segment} />
            </ScrollArea>
          ),
        },
      ]
    : [definition];
  const value = tabs.some((tab) => tab.value === selectedTab)
    ? selectedTab || tabs[0].value
    : tabs[0].value;
  return (
    <>
      <SegmentDetailHeader title={title} />
      <RecordSidePanel.Layout
        expanded={pagePanel.expanded && Boolean(segmentId)}
        tabs={tabs}
        value={value}
        onValueChange={setSelectedTab}
      />
    </>
  );
};
export function SegmentDetail({ onRefresh, page = false }: Props) {
  const [queryType] = useQueryState<string>('contentType');
  const [queryId, setOpen] = useQueryState<string>('segmentId');
  const { id } = useParams<{ id: string }>();
  const segmentId = page ? (id === 'new' ? '' : id) : queryId;
  const { segment, segmentLoading } = useSegmentDetail(segmentId || undefined);
  const contentType = queryType || segment?.contentType;
  const navigate = useNavigate();
  const location = useLocation();
  const state: { segmentDraft?: TSegmentForm } | null = location.state;
  const draft = useRef<(() => TSegmentForm) | null>(null);
  const search = contentType ? `?${new URLSearchParams({ contentType })}` : '';
  const openPage = (recordId: string) =>
    navigate(`/segments/${encodeURIComponent(recordId)}${search}`);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const { t } = useTranslation('segment');
  const pagePanel = usePagePanel({
    requiredPermission: segmentId ? undefined : 'segmentsManage',
    maxWidth: 1100,
    defaultWidth: 800,
    page,
    onExpand: () => {
      const params = new URLSearchParams({ contentType: contentType || '' });
      if (draft.current) params.set('tab', 'definition');
      navigate(
        `/segments/${encodeURIComponent(segmentId || 'new')}?${params}`,
        {
          state: { segmentDraft: draft.current?.() },
        },
      );
    },
    name: 'segments/SegmentDetail',
    open: page || (Boolean(contentType) && (!!segmentId || isCreatingNew)),
    onOpenChange: (open) => {
      if (page) {
        if (!open) navigate(`/segments${search}`);
        return;
      }
      if (open) {
        setIsCreatingNew(!segmentId);
        return;
      }
      setOpen(null);
      setIsCreatingNew(false);
    },
    identity: segmentId || 'new',
  });
  if (!contentType) {
    if (!page) return null;
    return segmentLoading ? (
      <Spinner />
    ) : (
      <PanelEmptyState
        title={t('not-found', 'Segment not found')}
        action={
          <Button variant="outline" onClick={() => navigate('/segments')}>
            {t('segments')}
          </Button>
        }
      />
    );
  }
  return (
    <>
      {!page && (
        <Can action="segmentsManage">
          <Button onClick={() => setIsCreatingNew(true)}>
            <IconPlus /> {t('create-segment')}
          </Button>
        </Can>
      )}

      {createPortal(
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
          {pagePanel.permissionsLoaded && pagePanel.allowed ? (
            <SegmentDetailBody
              contentType={contentType}
              segmentId={segmentId || ''}
              onRefresh={onRefresh}
              draft={draft}
              initialDraft={page ? state?.segmentDraft : undefined}
              onCreated={(id) =>
                page ? openPage(id) : setIsCreatingNew(false)
              }
              onOpenExisting={(id) => {
                if (page) {
                  openPage(id);
                  return;
                }
                setIsCreatingNew(false);
                setOpen(id);
              }}
            />
          ) : (
            <PagePanelStatus entry={pagePanel} />
          )}
        </div>,
        pagePanel,
      )}
    </>
  );
}
