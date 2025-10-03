import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { InboxPageChangeEffect } from './components/InboxPageChangeEffect';

const Inbox = lazy(() =>
  import('~/pages/InboxIndexPage').then((module) => ({
    default: module.default,
  })),
);

const InboxMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Inbox />} />
      </Routes>
      <InboxPageChangeEffect />
    </Suspense>
  );
};

export default InboxMain;
