import { PipelineSidebar } from '@/pipelines/components/PipelineSidebar';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { SettingsPanelContext } from '@/settings/contexts/SettingsPanelContext';
import { IconGitBranch } from '@tabler/icons-react';
import { Empty, ScrollArea, Spinner } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';

export const PipelineLayoutPage = () => {
  const { t } = useTranslation('frontline');
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const { pipeline, loading, error } = useGetPipeline(pipelineId);
  const scope = useMemo(
    () => ({
      channelId: pipeline?.channelId ?? undefined,
      pipelineId: pipeline?._id,
    }),
    [pipeline?.channelId, pipeline?._id],
  );

  if (!pipelineId) return null;

  if (!loading && !pipeline) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media>
            <IconGitBranch />
          </Empty.Media>
          <Empty.Title>{t('not-found', 'Not found')}</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <div className="flex h-full flex-auto flex-col overflow-hidden md:flex-row">
      <PipelineSidebar />
      <ScrollArea className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          {pipeline ? (
            <SettingsPanelContext.Provider key={pipeline._id} value={scope}>
              <Outlet />
            </SettingsPanelContext.Provider>
          ) : (
            <Spinner containerClassName="py-32" />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
