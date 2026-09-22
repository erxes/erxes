import {
  TWorkflowInputBinding,
  useWorkflowInputBindings,
} from '@/automations/components/builder/hooks/useWorkflowInputBindings';
import {
  TWorkflowSummary,
  useWorkflowSummary,
} from '@/automations/components/builder/hooks/useWorkflowSummary';
import { createContext, ReactNode, useContext } from 'react';

type TWorkflowNodeContext = TWorkflowSummary & {
  workflowId: string;
  bindings: TWorkflowInputBinding[];
  danglingCount: number;
  updateBinding: (name: string, expression: string) => void;
};

const WorkflowNodeContext = createContext<TWorkflowNodeContext | null>(null);

export const WorkflowNodeProvider = ({
  workflowId,
  children,
}: {
  workflowId: string;
  children: ReactNode;
}) => {
  const inputBindings = useWorkflowInputBindings(workflowId);
  const summary = useWorkflowSummary(workflowId);

  return (
    <WorkflowNodeContext.Provider
      value={{ workflowId, ...inputBindings, ...summary }}
    >
      {children}
    </WorkflowNodeContext.Provider>
  );
};

export const useWorkflowNodeContext = () => {
  const context = useContext(WorkflowNodeContext);

  if (!context) {
    throw new Error(
      'useWorkflowNodeContext must be used within WorkflowNodeProvider',
    );
  }

  return context;
};
