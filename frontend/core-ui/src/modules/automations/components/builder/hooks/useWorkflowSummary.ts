import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useMemo } from 'react';

export type TWorkflowSummary = {
  memberCount: number;
  entryLabel?: string;
};

export const useWorkflowSummary = (workflowId: string): TWorkflowSummary => {
  const { workflows } = useAutomationNodes();

  return useMemo(() => {
    const workflow = (workflows || []).find(({ id }) => id === workflowId);
    const members = workflow?.actions || [];

    return {
      memberCount: members.length,
      entryLabel: members.find(
        (member) => member.id === workflow?.config?.entryActionId,
      )?.label,
    };
  }, [workflows, workflowId]);
};
