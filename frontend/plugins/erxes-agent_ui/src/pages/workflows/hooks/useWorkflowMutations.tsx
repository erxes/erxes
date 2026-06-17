import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { MASTRA_WORKFLOWS } from '~/graphql/queries';
import {
  MASTRA_WORKFLOW_CREATE,
  MASTRA_WORKFLOW_REMOVE,
  MASTRA_WORKFLOW_RUN_START,
  MASTRA_WORKFLOW_SET_ENABLED,
  MASTRA_WORKFLOW_UPDATE,
  MASTRA_WORKFLOW_VALIDATE,
} from '~/graphql/mutations';
import {
  IWorkflowCreateResponse,
  IWorkflowDefinition,
  IWorkflowValidateResponse,
  IWorkflowValidation,
} from '../types';

const onError = (e: { message: string }) =>
  toast({ title: 'Error', description: e.message, variant: 'destructive' });

const refetchWorkflows = {
  refetchQueries: [{ query: MASTRA_WORKFLOWS }],
  awaitRefetchQueries: true,
};

/** Create/update/validate mutations for the workflow form. */
export const useWorkflowFormMutations = ({
  onValidated,
  onCreated,
  onUpdated,
}: {
  onValidated: (result: IWorkflowValidation | null) => void;
  onCreated: (id?: string) => void;
  onUpdated: () => void;
}) => {
  const [validateDefinition, { loading: validating }] =
    useMutation<IWorkflowValidateResponse>(MASTRA_WORKFLOW_VALIDATE, {
      onCompleted: (data) => onValidated(data?.mastraWorkflowValidate ?? null),
      onError,
    });

  const [createWorkflow, { loading: creating }] =
    useMutation<IWorkflowCreateResponse>(MASTRA_WORKFLOW_CREATE, {
      ...refetchWorkflows,
      onCompleted: (data) => onCreated(data?.mastraWorkflowCreate?._id),
      onError,
    });

  const [updateWorkflow, { loading: updating }] = useMutation(
    MASTRA_WORKFLOW_UPDATE,
    {
      ...refetchWorkflows,
      onCompleted: () => onUpdated(),
      onError,
    },
  );

  const validate = (definition: IWorkflowDefinition) =>
    validateDefinition({ variables: { definition } });

  return {
    validate,
    validating,
    createWorkflow,
    creating,
    updateWorkflow,
    updating,
  };
};

/** Row/detail actions: remove, toggle enabled, start a run. */
export const useWorkflowActions = (
  refetch: () => void,
  onRunStarted?: () => void,
) => {
  const [removeWorkflow] = useMutation(MASTRA_WORKFLOW_REMOVE, {
    onCompleted: () => refetch(),
    onError,
  });

  const [setEnabled] = useMutation(MASTRA_WORKFLOW_SET_ENABLED, {
    onCompleted: () => refetch(),
    onError,
  });

  const [runStart] = useMutation(MASTRA_WORKFLOW_RUN_START, {
    onCompleted: () => onRunStarted?.(),
    onError,
  });

  return { removeWorkflow, setEnabled, runStart };
};
