import { Button, PageContainer } from 'erxes-ui';

import { BoardsList } from '@/deals/boards/components/BoardsList';
import { IconSandbox } from '@tabler/icons-react';
import { PipelineFormBar } from '@/deals/pipelines/components/PipelineFormBar';
import PipelineRecordTable from '@/deals/pipelines/components/PipelineRecordTable';
import { SettingsHeader } from 'ui-modules';

const Settings = () => {
  return (
    <PageContainer className="flex-row">
      <BoardsList />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <SettingsHeader breadcrumbs={[]}>
          <Button variant="ghost" className="font-semibold">
            <IconSandbox className="w-4 h-4 text-accent-foreground" />
            Boards & Pipelines
          </Button>
          <PipelineFormBar />
        </SettingsHeader>
        <div className="flex flex-auto w-full overflow-hidden">
          <div className="w-full overflow-hidden flex flex-col">
            <PipelineRecordTable />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings;
