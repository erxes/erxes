import { FrontlinePaths } from '@/types/FrontlinePaths';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const ConfigsSettings = lazy(() => import('@/integrations-config/Settings'));

const TicketSettings = lazy(() => import('@/ticket/Settings'));

const ChannelsSettings = lazy(
  () => import('@/channels/components/settings/Settings'),
);

const FormsSettings = lazy(() =>
  import('@/forms/FormsSettings').then((module) => ({
    default: module.FormsSettings,
  })),
);

const FrontlineSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route
          path={FrontlinePaths.IntegrationConfig}
          element={<ConfigsSettings />}
        />
        <Route path={FrontlinePaths.TicketTags} element={<TicketSettings />} />
        <Route
          path={FrontlinePaths.ChannelsCatchAll}
          element={<ChannelsSettings />}
        />
        <Route
          path={FrontlinePaths.FormsCatchAll}
          element={<FormsSettings />}
        />
      </Routes>
    </Suspense>
  );
};

export default FrontlineSettings;
