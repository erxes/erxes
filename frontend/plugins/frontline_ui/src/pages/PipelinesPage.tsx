import { PipelinesList } from '@/pipelines/components/PipelinesList';
import { useParams } from 'react-router-dom';
import { CreatePipeline } from '@/pipelines/components/CreatePipeline';
import { ChannelHeader } from '@/channels/components/settings/channel-details/ChannelHeader';
import { useTranslation } from 'react-i18next';

export const ChannelPipelinesPage = () => {
  const { t } = useTranslation('frontline');
  const { id: channelId } = useParams<{ id: string }>();
  if (!channelId) return null;
  return (
    <div className="h-screen">
      <ChannelHeader />
      <div className="ml-auto flex justify-between px-8 py-6">
        <h1 className="text-xl font-semibold">{t('pipelines')}</h1>
        <CreatePipeline />
      </div>
      <PipelinesList channelId={channelId} />
    </div>
  );
};
