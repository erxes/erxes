import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType, NodeData } from '@/automations/types';
import {
  BRANCH_CONFIG_KEYS,
  remapConnectionRefs,
  rewriteActionsToInputs,
  substituteInputsBack,
} from '@/automations/utils/workflowInputs';
import { Node, useReactFlow } from '@xyflow/react';
import { generateAutomationElementId, TAutomationAction } from 'ui-modules';

export const useConvertSelectionToWorkflow = () => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { triggers, actions, workflows } = useAutomationNodes();
  const { actionFolks } = useAutomation();
  const { getNodes } = useReactFlow<Node<NodeData>>();

  const remapConnections = (
    sourceActions: TAutomationAction[],
    mapValue: (value?: string) => string | undefined,
  ) => {
    const { actions: newActions, triggers: newTriggers } = remapConnectionRefs(
      { actions: sourceActions, triggers },
      mapValue,
      actionFolks,
    );

    return { newActions, newTriggers };
  };

  const convertSelectionToWorkflow = (
    memberIds: string[],
    meta?: { name?: string; description?: string },
  ) => {
    if (!memberIds.length) {
      return;
    }

    const memberSet = new Set(memberIds);
    const members = actions.filter((action) => memberSet.has(action.id));
    const remainingActions = actions.filter(
      (action) => !memberSet.has(action.id),
    );
    const workflowId = generateAutomationElementId(
      [...triggers, ...actions, ...(workflows || [])].map((node) => node.id),
    );

    const memberNodes = getNodes().filter((node) => memberSet.has(node.id));
    const position = memberNodes.length
      ? {
          x:
            memberNodes.reduce((sum, node) => sum + node.position.x, 0) /
            memberNodes.length,
          y:
            memberNodes.reduce((sum, node) => sum + node.position.y, 0) /
            memberNodes.length,
        }
      : { x: 0, y: 0 };

    // Entry point: the member external connections pointed to; falls back to
    // the member no other member points to.
    const collectTargets = (
      sourceActions: TAutomationAction[],
      predicate: (actionId: string) => boolean,
    ) => {
      const targets: string[] = [];

      for (const action of sourceActions) {
        const config = action.config || {};
        const candidates = [
          action.nextActionId,
          ...BRANCH_CONFIG_KEYS.map((key) => config[key]),
          ...(config.optionalConnects || []).map(
            (connect: { actionId?: string }) => connect.actionId,
          ),
        ];

        for (const candidate of candidates) {
          if (typeof candidate === 'string' && predicate(candidate)) {
            targets.push(candidate);
          }
        }
      }

      return targets;
    };

    const externalTargets = [
      ...triggers
        .map((trigger) => trigger.actionId)
        .filter(
          (actionId): actionId is string =>
            !!actionId && memberSet.has(actionId),
        ),
      ...collectTargets(remainingActions, (actionId) =>
        memberSet.has(actionId),
      ),
    ];
    const internalTargets = new Set(
      collectTargets(members, (actionId) => memberSet.has(actionId)),
    );
    const entryActionId =
      externalTargets[0] ||
      memberIds.find((memberId) => !internalTargets.has(memberId)) ||
      memberIds[0];

    const { newActions, newTriggers } = remapConnections(
      remainingActions,
      (value) => (value && memberSet.has(value) ? workflowId : value),
    );

    // Extract-function step: external refs become named inputs with the
    // original expressions kept as default bindings.
    const { actions: rewrittenMembers, inputs } =
      rewriteActionsToInputs(members);

    const newWorkflow = {
      id: workflowId,
      name: meta?.name?.trim() || 'New workflow',
      description: meta?.description || '',
      automationId: '',
      actions: rewrittenMembers,
      config: {
        entryActionId,
        ...(Object.keys(inputs).length ? { inputs } : {}),
      },
      position,
    };

    setAutomationBuilderFormValue(AutomationNodesType.Actions, newActions);
    setAutomationBuilderFormValue(AutomationNodesType.Triggers, newTriggers);
    setAutomationBuilderFormValue(AutomationNodesType.Workflows, [
      ...(workflows || []),
      newWorkflow,
    ]);
  };

  const unconvertWorkflow = (workflowNodeId: string) => {
    const workflow = (workflows || []).find(({ id }) => id === workflowNodeId);

    if (!workflow) {
      return;
    }

    const members = substituteInputsBack(
      workflow.actions || [],
      workflow.config?.inputs || {},
    );
    const entryActionId: string | undefined =
      workflow.config?.entryActionId || members[0]?.id;

    const { newActions, newTriggers } = remapConnections(actions, (value) =>
      value === workflowNodeId ? entryActionId : value,
    );

    setAutomationBuilderFormValue(AutomationNodesType.Actions, [
      ...newActions,
      ...members,
    ]);
    setAutomationBuilderFormValue(AutomationNodesType.Triggers, newTriggers);
    setAutomationBuilderFormValue(
      AutomationNodesType.Workflows,
      (workflows || []).filter(({ id }) => id !== workflowNodeId),
    );
  };

  return { convertSelectionToWorkflow, unconvertWorkflow };
};
