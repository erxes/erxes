import { PersonalChannelGeneralSection } from '@/channels/components/settings/channel-workspace/ChannelGeneralSection';
import { PersonalChannelLayout } from '@/channels/components/settings/channel-workspace/PersonalChannelLayout';
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const IntegrationDetailPage = lazy(() =>
  import('~/pages/IntegrationDetailPage').then((module) => ({
    default: module.IntegrationDetailPage,
  })),
);

export const PersonalChannelPage = () => (
  <Routes>
    <Route element={<PersonalChannelLayout />}>
      <Route index element={<Navigate to="general" replace />} />
      <Route path="general" element={<PersonalChannelGeneralSection />} />
      <Route
        path="details/:id/:integrationType"
        element={<IntegrationDetailPage />}
      />
    </Route>
  </Routes>
);
