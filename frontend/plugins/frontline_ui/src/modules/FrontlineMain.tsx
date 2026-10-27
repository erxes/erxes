import { PluginSettingsRoutes } from 'ui-modules';
import { lazy, Suspense } from 'react';
import { AppLayout, Spinner, useQueryState } from 'erxes-ui';
import {
  FrontlineSidebar,
  FrontlineSidebarFooter,
  FrontlineSettingsLayout,
} from '~/Sidebar';
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
    default: module.InboxIndexPage,
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

const HelpCenter = lazy(() =>
  import('~/pages/HelpCenterIndexPage').then((module) => ({
    default: module.default,
  })),
);

const SurveysView = lazy(() =>
  import('@/survey/components/survey-page/SurveyView').then((module) => ({
    default: module.SurveyView,
  })),
);

const Surveys = lazy(() =>
  import('~/pages/SurveysIndexPage').then((module) => ({
    default: module.SurveysIndexPage,
  })),
);

const SurveyCreatePage = lazy(() =>
  import('~/pages/SurveyCreatePage').then((module) => ({
    default: module.SurveyCreatePage,
  })),
);

const KnowledgeBase = lazy(() =>
  import('@/knowledgebase/Main').then((module) => ({
    default: module.default,
  })),
);

const FormSubmissionIndexPage = lazy(() =>
  import('~/pages/FormSubmissionsPage').then((module) => ({
    default: module.default,
  })),
);

const IntegrationsMain = () => {
  const [inPreview] = useQueryState<boolean>('inPreview');

  const routes = (
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
          <Route path="create" element={<FormCreatePage />} />
          <Route path=":formId" element={<FormDetailPage />} />
          <Route
            path="submissions/:formId"
            element={<FormSubmissionIndexPage />}
          />
        </Route>
        <Route path="/forms/preview" element={<FormPreviewPage />} />
        <Route path="/surveys" element={<SurveysView />}>
          <Route index element={<Surveys />} />
          <Route path="create" element={<SurveyCreatePage />} />
        </Route>
        <Route path="/knowledgebase/*" element={<KnowledgeBase />} />
        <Route path="/helpcenter" element={<HelpCenter />} />
      </Routes>
    </Suspense>
  );

  // The form preview iframe renders bare, as core's DefaultLayout does.
  if (inPreview) {
    return routes;
  }

  return (
    <AppLayout
      id="frontline"
      title="Frontline"
      sidebar={<FrontlineSidebar />}
      footer={<FrontlineSidebarFooter />}
    >
      {routes}
    </AppLayout>
  );
};

const FrontlineSettingsRoutes = lazy(
  () => import('~/modules/FrontlineSettings'),
);
// JSX needs a capitalised name.
const FrontlineAppRoutes = IntegrationsMain;

/** The plugin owns its settings too: `/frontline/settings/*` has its own sidebar. */
const FrontlineEntry = () => (
  <Routes>
    <Route
      path="settings/*"
      element={
        <FrontlineSettingsLayout>
          <Suspense fallback={<Spinner />}>
            <PluginSettingsRoutes
              pluginName="frontline"
              basePath="/frontline/settings"
            >
              <FrontlineSettingsRoutes />
            </PluginSettingsRoutes>
          </Suspense>
        </FrontlineSettingsLayout>
      }
    />
    <Route path="*" element={<FrontlineAppRoutes />} />
  </Routes>
);

export default FrontlineEntry;
