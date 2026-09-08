import { Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const HrmSettingsPage = lazy(() =>
  import('~/pages/HrmSettingsPage').then((module) => ({
    default: module.HrmSettingsPage,
  })),
);

const ContributionProfilesPage = lazy(() =>
  import('~/pages/ContributionProfilesPage').then((module) => ({
    default: module.ContributionProfilesPage,
  })),
);

const GradesPage = lazy(() =>
  import('~/pages/GradesPage').then((module) => ({
    default: module.GradesPage,
  })),
);

const SeniorityRulesPage = lazy(() =>
  import('~/pages/SeniorityRulesPage').then((module) => ({
    default: module.SeniorityRulesPage,
  })),
);

const SkillsPage = lazy(() =>
  import('~/pages/SkillsPage').then((module) => ({
    default: module.SkillsPage,
  })),
);

export const HrmSettingsMain = () => (
  <Suspense
    fallback={
      <div className="flex h-full items-center justify-center">
        <Spinner size="sm" />
      </div>
    }
  >
    <Routes>
      <Route path="/config" element={<HrmSettingsPage />} />
      <Route
        path="/config/contribution-profiles"
        element={<ContributionProfilesPage />}
      />
      <Route path="/config/grades" element={<GradesPage />} />
      <Route path="/config/seniority-rules" element={<SeniorityRulesPage />} />
      <Route path="/config/skills" element={<SkillsPage />} />
    </Routes>
  </Suspense>
);

export const HrmSettings = HrmSettingsMain;
