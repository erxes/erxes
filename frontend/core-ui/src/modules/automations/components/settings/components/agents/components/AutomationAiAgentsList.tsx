import { AutomationAiAgentRecordTable } from '@/automations/components/settings/components/agents/components/AutomationAiAgentRecordTable';
import { AiAgentsSubHeader } from '@/automations/components/settings/components/agents/components/list/AiAgentsSubHeader';
import { Suspense } from 'react';
import { Outlet } from 'react-router';

export const AutomationAiAgentsList = () => (
  <div className="flex h-full min-h-0 min-w-0 flex-col">
    <AiAgentsSubHeader />
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <AutomationAiAgentRecordTable />
    </div>
    <Suspense>
      <Outlet />
    </Suspense>
  </div>
);
