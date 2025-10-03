import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const CallIndexPage = lazy(() =>
  import('~/pages/CallIndexPage').then((module) => ({
    default: module.CallIndexPage,
  })),
);
const CallDetailPage = lazy(() =>
  import('~/pages/CallDetailPage').then((module) => ({
    default: module.CallDetailPage,
  })),
);
const Inbox = lazy(() =>
  import('~/pages/InboxIndexPage').then((module) => ({
    default: module.default,
  })),
);

const Ticket = lazy(() =>
  import('~/pages/TicketIndexPage').then((module) => ({
    default: module.default,
  })),
);

const IntegrationsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="/calls" element={<CallIndexPage />} />
        <Route path="/calls/:id" element={<CallDetailPage />} />
      </Routes>
    </Suspense>
  );
};

export default IntegrationsMain;
