import {
  TWorkflowInputBinding,
  useWorkflowInputBindings,
} from '@/automations/components/builder/hooks/useWorkflowInputBindings';
import {
  TWorkflowForEach,
  TWorkflowForEachError,
  useWorkflowForEach,
} from '@/automations/components/builder/hooks/useWorkflowForEach';
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
  forEach?: TWorkflowForEach;
  forEachError: TWorkflowForEachError | null;
  inputNames: string[];
  toggleForEach: (enabled: boolean) => void;
  updateForEach: (patch: Partial<TWorkflowForEach>) => void;
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
  const forEach = useWorkflowForEach(workflowId);

  return (
    <WorkflowNodeContext.Provider
      value={{ workflowId, ...inputBindings, ...summary, ...forEach }}
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
