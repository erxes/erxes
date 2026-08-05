import { PipelinesList } from '@/pipelines/components/PipelinesList';
import { useParams } from 'react-router-dom';

export const ChannelPipelinesPage = () => {
  const { id: channelId } = useParams<{ id: string }>();
  if (!channelId) return null;

  return <PipelinesList channelId={channelId} />;
};
