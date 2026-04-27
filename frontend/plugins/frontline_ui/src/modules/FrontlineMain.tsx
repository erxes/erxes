import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

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

const Forms = lazy(() =>
  import('~/pages/FormsIndexPage').then((module) => ({
    default: module.default,
  })),
);

const FormDetailPage = lazy(() =>
  import('~/pages/FormDetailPage').then((module) => ({
    default: module.FormDetailPage,
  })),
);

const FormCreatePage = lazy(() =>
  import('~/pages/FormCreatePage').then((module) => ({
    default: module.FormCreatePage,
  })),
);

const FormPreviewPage = lazy(() =>
  import('~/pages/FormPreviewPage').then((module) => ({
    default: module.FormPreviewPage,
  })),
);

const KnowledgeBase = lazy(() =>
  import('~/pages/knowledgebase/IndexPage').then((module) => ({
    default: module.default,
  })),
);

const IntegrationsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/tickets" element={<Ticket />} />
        <Route
          path="/calls"
          element={<Navigate to="/frontline/calls/dashboard" replace />}
        />
        <Route path="/calls/dashboard" element={<CallDashboardIndexPage />} />
        <Route
          path="/calls/dashboard/:id"
          element={<CallDashboardDetailPage />}
        />
        <Route path="/calls/statistics" element={<CallStatisticsIndexPage />} />
        <Route
          path="/calls/statistics/:id"
          element={<CallStatisticsDetailPage />}
        />
        <Route path="/calls/:id" element={<CallDashboardDetailPage />} />
        <Route path="/reports/*" element={<Report />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/forms/:formId" element={<FormDetailPage />} />
        <Route path="/forms/create" element={<FormCreatePage />} />
        <Route path="/forms/preview" element={<FormPreviewPage />} />
        <Route path="/knowledgebase" element={<KnowledgeBase />} />
      </Routes>
    </Suspense>
  );
};

export default IntegrationsMain;
