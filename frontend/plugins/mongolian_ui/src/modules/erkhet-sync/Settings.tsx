import { Routes, Route } from 'react-router';
import { lazy } from 'react';

const ErkhetSyncSettings = lazy(() =>
  import('./settings/components/ErkhetSettings').then((module) => ({
    default: module.default,
  })),
);

const ErkhetSyncSettingsRoutes = () => {
  return (
    <Routes>
      <Route path="/*" element={<ErkhetSyncSettings />} />
    </Routes>
  );
};

export default ErkhetSyncSettingsRoutes;
