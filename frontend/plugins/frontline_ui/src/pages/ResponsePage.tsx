import { ResponseList } from '@/responseTemplate/components/ResponseList';
import { ResponseSubHeader } from '@/responseTemplate/components/ResponseSubHeader';
import { useParams } from 'react-router-dom';

export const ChannelResponsePage = () => {
  const { id: channelId } = useParams<{ id: string }>();

  if (!channelId) return null;

  return (
    <>
      <div className="px-8 flex justify-between py-6">
        <h1 className="text-xl font-semibold">Response Templates</h1>
      </div>

      <ResponseSubHeader channelId={channelId} />
      <ResponseList channelId={channelId} />
    </>
  );
};
