import { useWorkflowEditScope } from '@/automations/context/WorkflowEditScopeProvider';
import { ChangeEvent, FormEvent, useCallback, useState } from 'react';

/** The workflow's declared inputs, by name. */
export const useWorkflowInputNames = () =>
  Object.keys(useWorkflowEditScope()?.inputs || {});

/** Registering a new named input from the entry node. */
export const useWorkflowAddInput = () => {
  const workflowEditScope = useWorkflowEditScope();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const onNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setName(event.currentTarget.value),
    [],
  );

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      workflowEditScope?.addInput?.(name);
      setName('');
      setOpen(false);
    },
    [workflowEditScope, name],
  );

  return {
    canAdd: !!workflowEditScope?.addInput,
    open,
    setOpen,
    name,
    onNameChange,
    handleSubmit,
  };
};
