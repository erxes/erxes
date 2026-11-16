import {
  PagePanelStatus,
  PanelEmptyState,
} from '@/side-panel/components/PagePanelStatus';
import { createPagePanelPortal as createPortal } from '@/side-panel/hooks/usePagePanel';
import {
  useSegmentDetailBody,
  useSegmentDetailPanel,
} from '@/segments/hooks/useSegmentDetailPanel';
import {
  IconPlus,
  IconTemplate,
  IconCode,
  IconChartBar,
  IconBolt,
} from '@tabler/icons-react';
import { Button, ScrollArea, Spinner } from 'erxes-ui';
import { type MutableRefObject } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Can,
  SegmentForm,
  SegmentOverview,
  RecordSidePanel,
  type TSegmentForm,
} from 'ui-modules';
import { SegmentAutomationCreateButton } from '@/segments/components/SegmentAutomationCreateButton';
import { SegmentAutomations } from '@/segments/components/SegmentAutomations';
import { SegmentDetailHeader } from '@/segments/components/SegmentDetailHeader';
import { SegmentPageDraft } from '@/segments/components/SegmentPageDraft';
type Props = Readonly<{
  onRefresh: () => void;
  page?: boolean;
}>;
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
  const { t: detailT } = useTranslation('segment', {
    keyPrefix: 'detail',
  });
  const {
    segment,
    refetch,
    pagePanel,
    isPending,
    segmentLoading,
    title,
    expanded,
    tabValueOf,
    setSelectedTab,
  } = useSegmentDetailBody(segmentId);

  if (isPending) {
    return <PagePanelStatus entry={pagePanel} loading={segmentLoading} />;
  }

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
  return (
    <>
      <SegmentDetailHeader title={title} />
      <RecordSidePanel.Layout
        expanded={expanded}
        tabs={tabs}
        value={tabValueOf(tabs)}
        onValueChange={setSelectedTab}
      />
    </>
  );
};
export function SegmentDetail({ onRefresh, page = false }: Props) {
  const { t } = useTranslation('segment');
  const {
    contentType,
    segmentId,
    segmentLoading,
    pagePanel,
    draft,
    initialDraft,
    startCreating,
    goToSegments,
    onCreated,
    onOpenExisting,
  } = useSegmentDetailPanel(page);

  if (!contentType) {
    if (!page) return null;
    return segmentLoading ? (
      <Spinner />
    ) : (
      <PanelEmptyState
        title={t('not-found', 'Segment not found')}
        action={
          <Button variant="outline" onClick={goToSegments}>
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
          <>
            <Button variant="outline" asChild>
              <Link to="/templates?group=segment">
                <IconTemplate /> {t('from-template')}
              </Link>
            </Button>
            <Button onClick={startCreating}>
              <IconPlus /> {t('create-segment')}
            </Button>
          </>
        </Can>
      )}

      {createPortal(
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
          {pagePanel.permissionsLoaded && pagePanel.allowed ? (
            <SegmentDetailBody
              contentType={contentType}
              segmentId={segmentId}
              onRefresh={onRefresh}
              draft={draft}
              initialDraft={initialDraft}
              onCreated={onCreated}
              onOpenExisting={onOpenExisting}
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
