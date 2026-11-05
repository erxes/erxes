import { CoreFocusPanel } from '@/side-panel/components/CoreModulePanel';
import { IconPlus } from '@tabler/icons-react';
import { Button, ScrollArea, Separator, Tabs, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Can,
  SegmentForm,
  SegmentOverview,
  SegmentUnsavedBadge,
  useSegmentDetail,
} from 'ui-modules';
import { SegmentAutomationCreateButton } from '@/segments/components/SegmentAutomationCreateButton';
import { SegmentAutomations } from '@/segments/components/SegmentAutomations';
import { SegmentDetailSidebar } from '@/segments/components/SegmentDetailSidebar';

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

  const title = segmentId
    ? segment?.name || `${t('edit')} ${t('a-segment')}`
    : `${t('create')} ${t('a-segment')}`;

  return (
    <>
      <CoreFocusPanel.Header
        title={title}
        description={segmentId ? segment?.description : undefined}
      >
        <SegmentUnsavedBadge />
      </CoreFocusPanel.Header>
      <CoreFocusPanel.Content>
        {/* A segment that does not exist yet has nothing to look back on, so it
          opens straight into its definition with no sidebar to choose from. */}
        {!!segmentId && (
          <CoreFocusPanel.SideBar>
            <SegmentDetailSidebar />
          </CoreFocusPanel.SideBar>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Separator />
          <div className="flex-1 min-h-0">
            <Tabs
              value={segmentId ? selectedTab ?? 'overview' : 'definition'}
              onValueChange={setSelectedTab}
              className="h-full"
            >
              <Tabs.Content value="overview" className="h-full">
                <ScrollArea className="h-full">
                  <SegmentOverview
                    segment={segment}
                    onRefresh={refetch}
                    actions={
                      <SegmentAutomationCreateButton
                        segment={segment}
                        size="sm"
                      />
                    }
                  />
                </ScrollArea>
              </Tabs.Content>
              <Tabs.Content value="automations" className="h-full">
                <ScrollArea className="h-full">
                  <SegmentAutomations segment={segment} />
                </ScrollArea>
              </Tabs.Content>
              <Tabs.Content value="definition" className="h-full">
                <SegmentForm
                  contentType={contentType}
                  segmentId={segmentId}
                  callback={onRefresh}
                  onCreateSuccess={onCreated}
                  onOpenExisting={onOpenExisting}
                />
              </Tabs.Content>
            </Tabs>
          </div>
        </div>
      </CoreFocusPanel.Content>
    </>
  );
};

export function SegmentDetail({ onRefresh }: Props) {
  const [contentType] = useQueryState<string>('contentType');
  const [segmentId, setOpen] = useQueryState<string>('segmentId');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const { t } = useTranslation('segment');

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

      <CoreFocusPanel
        requiredPermission={segmentId ? undefined : 'segmentsManage'}
        maxWidth={1100}
        defaultWidth={800}
        name={'segments/SegmentDetail'}
        open={!!segmentId || isCreatingNew}
        onOpenChange={(open) => {
          if (open) {
            return;
          }

          setOpen(null);
          setIsCreatingNew(false);
        }}
      >
        <CoreFocusPanel.View
          className={segmentId ? 'lg:max-w-6xl' : 'lg:max-w-5xl'}
        >
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
        </CoreFocusPanel.View>
      </CoreFocusPanel>
    </>
  );
}
