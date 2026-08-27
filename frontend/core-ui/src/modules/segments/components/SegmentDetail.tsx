import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  FocusSheet,
  ScrollArea,
  Separator,
  Tabs,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Can,
  SegmentForm,
  SegmentOverview,
  useSegmentDetail,
} from 'ui-modules';
import { SegmentDetailSidebar } from './SegmentDetailSidebar';

/**
 * A segment on its own page: what it currently holds and how it got there,
 * with the definition one click away.
 *
 * The overview is the landing tab because a saved segment is read far more
 * often than it is edited - and because the numbers only make sense next to
 * each other, not buried under the condition builder.
 */

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
  const { segment } = useSegmentDetail(segmentId);

  return (
    <FocusSheet.Content>
      {/* A segment that does not exist yet has nothing to look back on, so it
          opens straight into its definition with no sidebar to choose from. */}
      {!!segmentId && (
        <FocusSheet.SideBar>
          <SegmentDetailSidebar />
        </FocusSheet.SideBar>
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
                <SegmentOverview segment={segment} />
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
    </FocusSheet.Content>
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

      <FocusSheet
        open={!!segmentId || isCreatingNew}
        onOpenChange={(open) => {
          if (open) {
            return;
          }

          setOpen(null);
          setIsCreatingNew(false);
        }}
      >
        <FocusSheet.View>
          <FocusSheet.Header
            title={`${segmentId ? t('edit') : t('create')} ${t('a-segment')}`}
          />
          <SegmentDetailBody
            contentType={contentType}
            segmentId={segmentId || ''}
            onRefresh={onRefresh}
            onCreated={() => setIsCreatingNew(false)}
            // The sheet stays open and simply switches to the segment that
            // already answers this, rather than closing on a dead end.
            onOpenExisting={(id) => {
              setIsCreatingNew(false);
              setOpen(id);
            }}
          />
        </FocusSheet.View>
      </FocusSheet>
    </>
  );
}
