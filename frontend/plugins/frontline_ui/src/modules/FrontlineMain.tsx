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

const FormsView = lazy(() =>
  import('@/forms/components/form-page/FormView').then((module) => ({
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
    default: module.default,
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

const FormSubmissionIndexPage = lazy(() =>
  import('~/pages/FormSubmissionsPage').then((module) => ({
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
          element={
            <CallDashboardDetailPage backPath="/frontline/calls/statistics" />
          }
        />
        <Route path="/calls/:id" element={<CallDashboardDetailPage />} />
        <Route path="/reports/*" element={<Report />} />
        <Route path="/forms" element={<FormsView />}>
          <Route index element={<Forms />} />
          <Route path=":formId" element={<FormDetailPage />} />
          <Route
            path="submissions/:formId"
            element={<FormSubmissionIndexPage />}
          />
        </Route>
        <Route path="/forms/preview" element={<FormPreviewPage />} />
        <Route path="/knowledgebase" element={<KnowledgeBase />} />
      </Routes>
    </Suspense>
  );
};

export default IntegrationsMain;
