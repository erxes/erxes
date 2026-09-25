import { useAutomationHistoryFlowGraph } from '@/automations/components/builder/history/hooks/useAutomationHistoryFlowGraph';
import { NodeData } from '@/automations/types';
import { Edge, Node } from '@xyflow/react';
import { createContext, useContext } from 'react';

type TAutomationHistoryFlowContext = {
  nodes: Node<NodeData>[];
  edges: Edge[];
};

const AutomationHistoryFlowContext =
  createContext<TAutomationHistoryFlowContext | null>(null);

export const AutomationHistoryFlowProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { nodes, edges } = useAutomationHistoryFlowGraph();

  return (
    <AutomationHistoryFlowContext.Provider value={{ nodes, edges }}>
      {children}
    </AutomationHistoryFlowContext.Provider>
  );
};

export const useAutomationHistoryFlow = () => {
  const context = useContext(AutomationHistoryFlowContext);

  if (!context) {
    throw new Error(
      'useAutomationHistoryFlow must be used within an AutomationHistoryFlowProvider',
    );
  }

  return context;
};
