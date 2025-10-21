import { useNodeErrorHandler } from '@/automations/components/builder/hooks/useNodeErrorHandler';
import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  AUTOMATION_CREATE,
  AUTOMATION_EDIT,
} from '@/automations/graphql/automationMutations';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationBuilderTabsType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useMutation } from '@apollo/client';
import { Node, useReactFlow } from '@xyflow/react';
import { toast } from 'erxes-ui';
import { SubmitErrorHandler, useFormContext } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

export const useAutomationHeader = () => {
  const { handleSubmit, clearErrors } =
    useFormContext<TAutomationBuilderForm>();
  const navigate = useNavigate();
  const { setAutomationBuilderFormValue, syncPositionUpdates } =
    useAutomationFormController();

  const { setQueryParams, reactFlowInstance } = useAutomation();
  const { actions, triggers } = useAutomationNodes();

  const { getNodes, setNodes } = useReactFlow();
  const { id } = useParams();

  const { handleNodeErrors, clearNodeErrors } = useNodeErrorHandler({
    reactFlowInstance,
    getNodes: getNodes as () => Node<NodeData>[],
    setNodes: setNodes as (nodes: Node<NodeData>[]) => void,
  });

  const [save, { loading }] = useMutation(
    id ? AUTOMATION_EDIT : AUTOMATION_CREATE,
  );

  const handleSave = async ({
    triggers,
    actions,
    name,
    status,
    workflows,
  }: TAutomationBuilderForm) => {
    // Sync all pending position updates to form state
    syncPositionUpdates();

    const generateValues = () => {
      return {
        id,
        name,
        status: status,
        triggers,
        actions,
        workflows,
      };
    };

    return save({
      variables: generateValues(),
      onError: (error) => {
        toast({
          title: 'Something went wrong',
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: ({ automationsAdd }) => {
        clearErrors();
        clearNodeErrors();
        toast({
          title: 'Save successful',
        });
        if (!id && automationsAdd) {
          navigate(`/automations/edit/${automationsAdd._id}`);
        }
      },
    });
  };

  const handleError: SubmitErrorHandler<TAutomationBuilderForm> = (errors) => {
    const { triggers: triggersErrors, actions: actionsErrors } = errors || {};

    const nodeErrorMap: Record<string, string> = {};

    for (const { errors, list = [] } of [
      { errors: triggersErrors, list: triggers },
      { errors: actionsErrors, list: actions },
    ]) {
      if (Array.isArray(errors)) {
        errors.forEach((err, i) => {
          if (err && list[i]?.id) {
            const nodeId = list[i].id;
            const errorKeys = Object.keys(err);
            nodeErrorMap[nodeId] =
              errorKeys.length === 1
                ? err[errorKeys[0]]?.message
                : JSON.stringify(err);
          }
        });
      }
    }

    if (Object.keys(nodeErrorMap).length > 0) {
      // Use the new error handler
      handleNodeErrors(nodeErrorMap);
    } else {
      const errorKeys = Object.keys(errors || {});
      if (errorKeys?.length > 0) {
        const { message, ref } =
          (errors as Record<string, { message?: string; ref: any }>)[
            errorKeys[0]
          ] || {};
        toast({
          title: 'Something went wrong',
          description: message,
          variant: 'destructive',
        });

        if (ref) {
          ref?.focus();
        }
      }
    }
  };

  const toggleTabs = (value: AutomationBuilderTabsType) =>
    setQueryParams({ activeTab: value });

  return {
    loading,
    handleSubmit,
    handleSave,
    handleError,
    toggleTabs,
  };
};
