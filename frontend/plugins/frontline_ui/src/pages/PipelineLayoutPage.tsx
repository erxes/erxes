import { PipelineSidebar } from '@/pipelines/components/PipelineSidebar';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { IconGitBranch } from '@tabler/icons-react';
import { Empty, ScrollArea, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';

export const PipelineLayoutPage = () => {
  const { t } = useTranslation('frontline');
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const { pipeline, loading } = useGetPipeline(pipelineId);

  if (!pipelineId) return null;

  if (!loading && !pipeline) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media>
            <IconGitBranch />
          </Empty.Media>
          <Empty.Title>{t('not-found')}</Empty.Title>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <div className="flex flex-auto flex-col overflow-hidden md:flex-row">
      <PipelineSidebar />
      <ScrollArea className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          {loading ? <Spinner containerClassName="py-32" /> : <Outlet />}
        </div>
      </ScrollArea>
    </div>
  );
};
