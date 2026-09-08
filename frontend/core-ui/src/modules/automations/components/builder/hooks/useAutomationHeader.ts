import { useNodeErrorHandler } from '@/automations/components/builder/hooks/useNodeErrorHandler';
import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  AUTOMATION_CREATE,
  AUTOMATION_EDIT,
} from '@/automations/graphql/automationMutations';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationBuilderTabsType, NodeData } from '@/automations/types';
import {
  TAutomationBuilderForm,
  TAutomationBuilderSaveValues,
} from '@/automations/utils/automationFormDefinitions';
import {
  collectNodeErrors,
  findFirstErrorMessage,
} from '@/automations/utils/automationBuilderUtils/collectNodeErrors';
import { setAutomationSettingsReturnPath } from '@/automations/utils/settingsReturn';
import { useMutation } from '@apollo/client';
import { Node, useReactFlow } from '@xyflow/react';
import { toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { SubmitErrorHandler, useFormContext } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router';
import { currentUserState } from 'ui-modules';

export const useAutomationHeader = () => {
  const {
    handleSubmit,
    clearErrors,
    reset,
    formState: { isDirty },
  } = useFormContext<TAutomationBuilderForm>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentUser = useAtomValue(currentUserState);
  const { setQueryParams, detail } = useAutomation();
  const automationId = detail?._id;
  const automationCreatedBy = detail?.createdBy;

  const isAutomationCreator = currentUser?._id === automationCreatedBy;
  const { actions, triggers, workflows } = useAutomationNodes();

  const { getNode } = useReactFlow();
  const { id } = useParams();

  const { handleNodeErrors, clearNodeErrors } = useNodeErrorHandler();

  const [save, { loading }] = useMutation(
    id ? AUTOMATION_EDIT : AUTOMATION_CREATE,
  );

  const handleSave = async ({
    triggers,
    actions,
    name,
    status,
    edgeType,
    flowDirection,
    workflows,
    acknowledgeDuplicate,
  }: TAutomationBuilderSaveValues) => {
    const generateValues = () => {
      return {
        id,
        name,
        status: status,
        edgeType,
        flowDirection,
        triggers: triggers.map((t) => ({
          ...t,
          position: getNode(t.id)?.position || t.position,
        })),
        actions: actions.map((a) => ({
          ...a,
          position: getNode(a.id)?.position || a.position,
        })),
        workflows: workflows?.map((w) => ({
          ...w,
          position: getNode(w.id)?.position || w.position,
        })),
      };
    };

    return save({
      variables: {
        ...generateValues(),
        ...(acknowledgeDuplicate && { acknowledgeDuplicate }),
      },
      onError: (error) => {
        toast({
          title: 'Something went wrong',
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: ({ automationsAdd }) => {
        reset(generateValues());
        clearErrors();
        clearNodeErrors();
        toast({
          title: 'Save successful',
          variant: 'success',
        });
        if (!id && automationsAdd) {
          navigate(`/automations/edit/${automationsAdd._id}`);
        }
      },
    });
  };

  const handleError: SubmitErrorHandler<TAutomationBuilderForm> = (errors) => {
    const nodeErrorMap = collectNodeErrors(errors, {
      triggers,
      actions,
      workflows,
    });

    if (Object.keys(nodeErrorMap).length > 0) {
      handleNodeErrors(nodeErrorMap);
    }

    // The marked node can be off-canvas — a collapsed workflow, another scope —
    // so the reason is always stated outright as well.
    const { message, ref } = findFirstErrorMessage(errors) || {};

    if (message) {
      toast({
        title: 'Something went wrong',
        description: message,
        variant: 'destructive',
      });

      ref?.focus?.();
    }
  };

  const toggleTabs = (value: AutomationBuilderTabsType) =>
    setQueryParams({ activeTab: value });

  const gotoAutomationSettings = () =>
    setAutomationSettingsReturnPath(pathname);

  return {
    isDirty,
    loading,
    handleSubmit,
    handleSave,
    handleError,
    toggleTabs,
    automationId,
    automationCreatedBy,
    isAutomationCreator,
    gotoAutomationSettings,
  };
};
