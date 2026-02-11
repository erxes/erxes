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

const Report = lazy(() =>
  import('~/pages/ReportIndexPage').then((module) => ({
    default: module.default,
  })),
);

const KnowledgeBase = lazy(() =>
  import('~/pages/knowledgebase/IndexPage').then((module) => ({
    default: module.default,
  })),
);

const Forms = lazy(() =>
  import('~/pages/FormsIndexPage').then((module) => ({
    default: module.default,
  })),
);

const IntegrationsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/tickets" element={<Ticket />} />
        <Route path="/calls" element={<CallIndexPage />} />
        <Route path="/calls/:id" element={<CallDetailPage />} />
        <Route path="/reports" element={<Report />} />
        <Route path="/knowledgebase" element={<KnowledgeBase />} />
        <Route path="/forms" element={<Forms />} />
      </Routes>
    </Suspense>
  );
};

export default IntegrationsMain;
