import { ResponseList } from '@/responseTemplate/components/ResponseList';
import { ResponseSubHeader } from '@/responseTemplate/components/ResponseSubHeader';
import { useParams } from 'react-router-dom';

export const ChannelResponsePage = () => {
  const { id: channelId } = useParams<{ id: string }>();

  if (!channelId) return null;

  return (
    <>
      <ResponseSubHeader channelId={channelId} />
      <ResponseList channelId={channelId} />
    </>
  );
};
