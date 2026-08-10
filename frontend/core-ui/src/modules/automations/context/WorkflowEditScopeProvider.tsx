import { TWorkflowInputBindings } from '@/automations/utils/workflowInputs';
import { createContext, useContext } from 'react';

// Present when the builder canvas is editing a workflow's member actions
// instead of the root automation. Null on the main canvas.
type TWorkflowEditScope = {
  workflowId: string;
  entryActionId?: string;
  // Derived input bindings of the workflow being edited (outer form data)
  inputs?: TWorkflowInputBindings;
  // Registers a new named input on the workflow (writes to the outer form)
  addInput?: (name: string) => void;
};

const WorkflowEditScopeContext = createContext<TWorkflowEditScope | null>(
  null,
);

export const WorkflowEditScopeProvider = ({
  children,
  ...scope
}: TWorkflowEditScope & { children: React.ReactNode }) => (
  <WorkflowEditScopeContext.Provider value={scope}>
    {children}
  </WorkflowEditScopeContext.Provider>
);

export const useWorkflowEditScope = () => useContext(WorkflowEditScopeContext);
