import { HistoryFlowStatusBadge } from '@/automations/components/builder/history/components/flow/HistoryFlowStatusBadge';
import { useAutomationExecutionDetail } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { buildExecutionFlowGraph } from '@/automations/utils/automationHistoryUtils/buildExecutionFlowGraph';
import { getExecutionActionStatus } from '@/automations/utils/automationHistoryUtils/executionFormat';
import { useMemo } from 'react';

export const useAutomationHistoryFlowGraph = () => {
  const { executionDetail, loading } = useAutomationExecutionDetail();
  const { triggersConst, actionsConst } = useAutomation();

  const { nodes, edges } = useMemo(() => {
    const graph = buildExecutionFlowGraph({
      execution: executionDetail,
      triggersConst,
      actionsConst,
    });
    const actions = executionDetail?.actions || [];

    return {
      ...graph,
      nodes: graph.nodes.map((node) => {
        const action = actions.find(({ actionId }) => actionId === node.id);
        const status = action ? getExecutionActionStatus(action) : 'success';

        return {
          ...node,
          data: {
            ...node.data,
            beforeTitleContent: () => (
              <HistoryFlowStatusBadge status={status} />
            ),
          },
        };
      }),
    };
  }, [executionDetail, triggersConst, actionsConst]);

  return { nodes, edges, loading };
};
