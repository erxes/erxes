import { PipelineLayoutEditor } from '@/pipelines/components/PipelineCreateFormLayout';
import { getPipelineRecordId } from '@/pipelines/constants/pipelineTabs';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { PIPELINE_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { SettingsPanelContext } from '@/settings/contexts/SettingsPanelContext';
import { Empty, ScrollArea, Sheet, Skeleton, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActivityLogs, type IRecordPanelProps, useSidePanel } from 'ui-modules';

export const PipelineLayoutRecordPanel = ({
  contentId,
  view,
}: IRecordPanelProps) => {
  const { t } = useTranslation('frontline');
  const { pipeline, loading, error } = useGetPipeline(contentId);
  const { back, canGoBack, openRecord } = useSidePanel();
  const onClose = () => {
    if (canGoBack) {
      back();
      return;
    }
    openRecord(
      {
        contentType: PIPELINE_CONTENT_TYPE,
        contentId: getPipelineRecordId(contentId, 'properties'),
      },
      { replace: true },
    );
  };

  if (view === 'title')
    return loading && !pipeline ? (
      <Skeleton className="h-4 w-32" />
    ) : (
      t('create-form', 'Create form')
    );
  if (view === 'actions') return null;
  if (loading && !pipeline) return <Spinner containerClassName="py-12" />;
  if (!pipeline) {
    return (
      <Empty>
        <Empty.Header>
          <Empty.Title>{t('not-found', 'Not found')}</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }
  if (view === 'activity')
    return (
      <ScrollArea className="min-h-0 flex-1">
        <ActivityLogs targetId={pipeline._id} showInternalNotes={false} />
      </ScrollArea>
    );
  return (
    <SettingsPanelContext.Provider
      value={{
        channelId: pipeline.channelId ?? undefined,
        pipelineId: pipeline._id,
      }}
    >
      <Sheet open onOpenChange={(open) => !open && onClose()}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PipelineLayoutEditor
            key={pipeline._id}
            pipelineId={pipeline._id}
            onClose={onClose}
          />
        </div>
      </Sheet>
    </SettingsPanelContext.Provider>
  );
};
