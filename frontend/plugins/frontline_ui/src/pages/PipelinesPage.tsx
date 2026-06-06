import { PipelinesList } from '@/pipelines/components/PipelinesList';
import { useParams } from 'react-router-dom';
import { CreatePipeline } from '@/pipelines/components/CreatePipeline';
import { ChannelHeader } from '@/channels/components/settings/channel-details/ChannelHeader';

export const ChannelPipelinesPage = () => {
  const { id: channelId } = useParams<{ id: string }>();
  if (!channelId) return null;
  return (
    <div className="h-screen">
      <ChannelHeader />
      <div className="ml-auto flex justify-between px-8 py-6">
        <h1 className="text-xl font-semibold">Pipelines</h1>
        <CreatePipeline />
      </div>
      <PipelinesList channelId={channelId} />
    </div>
  );
};
