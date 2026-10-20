import { InboxPageChangeEffect } from '@/inbox/components/InboxPageChangeEffect';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Inbox = lazy(() =>
  import('~/pages/InboxIndexPage').then((module) => ({
    default: module.InboxIndexPage,
  })),
);

export const InboxMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Inbox />} />
      </Routes>
      <InboxPageChangeEffect />
    </Suspense>
  );
};
