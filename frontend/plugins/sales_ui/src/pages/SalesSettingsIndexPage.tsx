import { Button, PageContainer } from 'erxes-ui';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

import { BoardsList } from '@/deals/boards/components/BoardsList';
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
  return (
    <PageContainer className="flex-row">
      <BoardsList />
      <div className="flex overflow-hidden relative flex-col flex-1">
        <SettingsHeader breadcrumbs={[]}>
          <Button variant="ghost" className="font-semibold">
            <IconSandbox className="w-4 h-4 text-accent-foreground" />
            Boards & Pipelines
          </Button>
          <PipelineFormBar />
        </SettingsHeader>
        <div className="flex overflow-hidden flex-auto w-full">
          <div className="flex overflow-hidden flex-col w-full">
            <PipelineRecordTable />
          </div>
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
        <Route path="/" element={<Navigate to="/deals" replace />} />
      </Routes>
    </Suspense>
  );
};

export default Settings;
