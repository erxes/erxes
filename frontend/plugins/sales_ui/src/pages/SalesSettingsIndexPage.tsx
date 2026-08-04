import { Button, PageContainer } from 'erxes-ui';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';

import { BoardsList } from '~/modules/deals/boards/components/settings/BoardsList';
import { IconSandbox } from '@tabler/icons-react';
import { PipelineFormBar } from '@/deals/pipelines/components/PipelineFormBar';
import PipelineRecordTable from '@/deals/pipelines/components/PipelineRecordTable';
import { SettingsHeader } from 'ui-modules';

const PosSettingsPage = lazy(() =>
  import('~/pages/PosSettingsPage').then((module) => ({
    default: module.PosSettingsPage,
  })),
);

const PosEditPage = lazy(() =>
  import('~/pages/PosEditPage').then((module) => ({
    default: module.PosEditPage,
  })),
);

const DealsSettings = () => {
  const { t } = useTranslation('sales');
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={[]}>
        <Button variant="ghost" className="font-semibold">
          <IconSandbox className="w-4 h-4 text-accent-foreground" />
          {t('boards-and-pipelines')}
        </Button>
        <PipelineFormBar />
      </SettingsHeader>
      <div className="flex flex-auto overflow-hidden">
        <BoardsList />
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <PipelineRecordTable />
        </div>
      </div>
    </PageContainer>
  );
};

const Settings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/deals" element={<DealsSettings />} />
        <Route path="/pos" element={<PosSettingsPage />} />
        <Route path="/pos/:id" element={<PosEditPage />} />
        <Route path="/" element={<Navigate to="deals" replace />} />
      </Routes>
    </Suspense>
  );
};

export default Settings;
