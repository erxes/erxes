import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { PollSubHeader } from '@/poll/components/poll-page/PollSubHeader';

const PollPageList = lazy(() =>
  import('@/poll/components/poll-page/PollPageList').then((module) => ({
    default: module.PollPageList,
  })),
);

export const ChannelPollsPage = () => {
  const { id: channelId } = useParams<{ id: string }>();

  return (
    <>
      <PollSubHeader canCreate channelId={channelId} />
      <Suspense fallback={<div />}>
        <PollPageList channelId={channelId} />
      </Suspense>
    </>
  );
};
