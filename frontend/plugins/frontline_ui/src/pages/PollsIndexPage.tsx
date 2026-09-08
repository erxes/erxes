import { lazy, Suspense } from 'react';
import { PollSubHeader } from '@/poll/components/poll-page/PollSubHeader';

const PollResultsBoard = lazy(() =>
  import('@/poll/components/poll-results/PollResultsBoard').then((module) => ({
    default: module.PollResultsBoard,
  })),
);

export const PollsIndexPage = () => (
  <>
    <PollSubHeader />
    <Suspense fallback={<div />}>
      <PollResultsBoard />
    </Suspense>
  </>
);
