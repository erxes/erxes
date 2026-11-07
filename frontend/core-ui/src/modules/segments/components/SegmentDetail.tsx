import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanelContext,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import {
  IconPlus,
  IconCode,
  IconChartBar,
  IconBolt,
} from '@tabler/icons-react';
import { Button, ScrollArea, useQueryState, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Can,
  SegmentForm,
  SegmentOverview,
  SegmentUnsavedBadge,
  useSegmentDetail,
  RecordSidePanel,
  SidePanelRecordPathContext,
} from 'ui-modules';
import { SegmentAutomationCreateButton } from '@/segments/components/SegmentAutomationCreateButton';
import { SegmentAutomations } from '@/segments/components/SegmentAutomations';
type Props = {
  onRefresh: () => void;
};
const SegmentDetailBody = ({
  contentType,
  segmentId,
  onRefresh,
  onCreated,
  onOpenExisting,
}: {
  contentType: string;
  segmentId: string;
  onRefresh: () => void;
  onCreated: () => void;
  onOpenExisting: (id: string) => void;
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
        <SegmentForm
          contentType={contentType}
          segmentId={segmentId}
          callback={onRefresh}
          onCreateSuccess={onCreated}
          onOpenExisting={onOpenExisting}
        />
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
      <RecordSidePanel.Header
        title={title}
        onBack={pagePanel.onBack}
        onClose={pagePanel.onClose}
        expanded={pagePanel.expanded}
        onExpand={pagePanel.onExpand}
        actions={<SegmentUnsavedBadge />}
      />
      <RecordSidePanel.Layout
        expanded={pagePanel.expanded}
        tabs={tabs}
        value={value}
        onValueChange={setSelectedTab}
      />
    </>
  );
};
export function SegmentDetail({ onRefresh }: Props) {
  const [contentType] = useQueryState<string>('contentType');
  const [segmentId, setOpen] = useQueryState<string>('segmentId');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const { t } = useTranslation('segment');
  const pagePanel = usePagePanel({
    requiredPermission: segmentId ? undefined : 'segmentsManage',
    maxWidth: 1100,
    defaultWidth: 800,
    name: 'segments/SegmentDetail',
    open: Boolean(contentType) && (!!segmentId || isCreatingNew),
    onOpenChange: (open) => {
      if (open) {
        return;
      }
      setOpen(null);
      setIsCreatingNew(false);
    },
    identity: segmentId || 'new',
  });
  if (!contentType) {
    return null;
  }
  return (
    <>
      <Can action="segmentsManage">
        <Button onClick={() => setIsCreatingNew(true)}>
          <IconPlus /> {t('create-segment')}
        </Button>
      </Can>

      <PagePanelContext.Provider value={pagePanel}>
        <SidePanelRecordPathContext.Provider value={pagePanel.path}>
          {pagePanel.open && pagePanel.target
            ? createPortal(
                <div
                  className={cn(
                    'flex min-h-0 flex-1 flex-col overflow-hidden bg-background',
                    segmentId ? 'lg:max-w-6xl' : 'lg:max-w-5xl',
                    'relative! inset-auto! h-full! w-full! min-w-0! max-w-none! rounded-none! shadow-none!',
                  )}
                >
                  {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                    <>
                      <SegmentDetailBody
                        contentType={contentType}
                        segmentId={segmentId || ''}
                        onRefresh={onRefresh}
                        onCreated={() => setIsCreatingNew(false)}
                        onOpenExisting={(id) => {
                          setIsCreatingNew(false);
                          setOpen(id);
                        }}
                      />
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
    </>
  );
}
