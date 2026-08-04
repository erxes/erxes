import { useEffect } from 'react';
import { AgentRecordTable } from '~/modules/loyalties/agents/components/AgentRecordTable';
import { AgentAddSheet } from '~/modules/loyalties/agents/components/AgentAddSheet';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { AgentFilter } from '~/modules/loyalties/agents/components/AgentFilter';
import { PageSubHeader } from 'erxes-ui';

export const AgentPage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<AgentAddSheet />);
    return () => setAction(null);
  }, [setAction]);

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <PageSubHeader>
        <AgentFilter />
      </PageSubHeader>
      <AgentRecordTable />
    </div>
  );
};
