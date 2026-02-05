import { Routes, Route } from 'react-router';
import { lazy } from 'react';

const LoyaltySettings = lazy(() =>
  import('./settings/components/LoyaltySettings').then((module) => ({
    default: module.default,
  })),
);

const LoyaltySettingsRoutes = () => {
  return (
    <Routes>
      <Route path="/*" element={<LoyaltySettings />} />
    </Routes>
  );
};

export default LoyaltySettingsRoutes;
