import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const CallDashboardIndexPage = lazy(() =>
  import('~/pages/CallIndexPage').then((module) => ({
    default: module.CallIndexPage,
  })),
);
const CallDashboardDetailPage = lazy(() =>
  import('~/pages/CallDetailPage').then((module) => ({
    default: module.CallDetailPage,
  })),
);

const CallStatisticsIndexPage = lazy(() =>
  import('~/pages/CallStatisticsIndexPage').then((module) => ({
    default: module.CallIndexPage,
  })),
);
const CallStatisticsDetailPage = lazy(() =>
  import('~/pages/CallStatisticsDetailPage').then((module) => ({
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
const IntegrationsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/tickets" element={<Ticket />} />
        <Route path="/reports/*" element={<Report />} />
      </Routes>
    </Suspense>
  );
};

export default IntegrationsMain;
