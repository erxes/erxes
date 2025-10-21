import {
  AUTOMATION_NODE_TYPE_LIST_PROERTY,
  CONNECTION_PROPERTY_NAME_MAP,
} from '@/automations/constants';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import {
  AutomationNodeType,
  ConnectionInfo,
  NodeData,
} from '@/automations/types';
import {
  generateBranchConnection,
  generateFindObjectConnection,
  generateFolksConnection,
  generateOptionalConnection,
  generateStandarConnection,
  generateWorkflowConnection,
} from '@/automations/utils/automationBuilderUtils/connectionUtils';
import { generateEdge } from '@/automations/utils/automationBuilderUtils/generateEdges';
import { generateNodeData } from '@/automations/utils/automationBuilderUtils/generateNodes';
import {
  checkIsValidConnect,
  generateConnectInfo,
  splitAwaitingConnectionId,
} from '@/automations/utils/automationConnectionUtils';
import {
  TAutomationBuilderActions,
  TAutomationBuilderForm,
} from '@/automations/utils/automationFormDefinitions';
import { Connection, EdgeProps, Node, useReactFlow } from '@xyflow/react';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  IAutomationsActionFolkConfig,
  TAutomationWorkflowNode,
} from 'ui-modules';

export const useNodeConnect = () => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { workflows, getList } = useAutomationNodes();
  const { getNodes, getEdges, getNode, addEdges, setEdges, updateNodeData } =
    useReactFlow<Node<NodeData>>();

  const nodes = getNodes();
  const edges = getEdges();

  const { triggersConst, actionsConst, actionFolks } = useAutomation();

  // Memoize workflows map for O(1) lookup
  const workflowsMap = useMemo(
    () =>
      new Map<string, TAutomationWorkflowNode>(
        workflows.map((wf) => [wf.id, wf]),
      ),
    [workflows],
  );

  // Apply node update + edges in a single place
  const applyConnectionUpdate = useCallback(
    (sourceNode: any, sourceType: AutomationNodeType, sourceIndex: number) => {
      const listFieldPrefix = AUTOMATION_NODE_TYPE_LIST_PROERTY[sourceType];

      // Update form state minimally
      setAutomationBuilderFormValue(
        `${listFieldPrefix}.${sourceIndex}`,
        sourceNode,
      );

      // Update React Flow node data
      updateNodeData(
        sourceNode.id,
        generateNodeData(sourceNode, sourceType, { nodeIndex: sourceIndex }),
      );
      const folksMap = new Map<string, IAutomationsActionFolkConfig[]>(
        Object.entries(actionFolks),
      );

      // Generate edges and add
      const newEdges = generateEdge(
        sourceType,
        sourceNode,
        CONNECTION_PROPERTY_NAME_MAP[sourceType],
        workflowsMap,
        folksMap,
      );
      if (newEdges.length > 0) addEdges(newEdges);
    },
    [
      setAutomationBuilderFormValue,
      updateNodeData,
      addEdges,
      workflowsMap,
      actionsConst,
    ],
  );

  const onConnection = (info: ConnectionInfo) => {
    const {
      sourceType,
      sourceId,
      targetId,
      sourceHandle,
      sourceIndex,
      connectType,
    } = info;
    if (!sourceType) return;

    const sourceNode = getList(sourceType).find(({ id }) => sourceId === id);
    if (!sourceNode) return;

    // Action-specific flows
    if (sourceType === AutomationNodeType.Action) {
      const actionNode = sourceNode as TAutomationBuilderActions[number];
      if (actionNode.type === 'if' && sourceHandle) {
        const updated = generateBranchConnection(
          actionNode,
          targetId,
          sourceHandle,
        );
        return applyConnectionUpdate(updated, sourceType, sourceIndex);
      }

      if (actionNode.type === 'findObject' && sourceHandle) {
        const updated = generateFindObjectConnection(
          actionNode,
          targetId,
          sourceHandle,
        );
        return applyConnectionUpdate(updated, sourceType, sourceIndex);
      }

      if (connectType === 'folks' && sourceHandle) {
        const updated = generateFolksConnection(
          actionNode,
          targetId,
          sourceHandle,
        );
        return applyConnectionUpdate(updated, sourceType, sourceIndex);
      }

      if (connectType === 'optional') {
        const updated = generateOptionalConnection(
          info.optionalConnectId || '',
          actionNode,
          targetId,
        );
        return applyConnectionUpdate(updated, sourceType, sourceIndex);
      }

      if (connectType === 'workflow') {
        const { sourceAction, workFlow } = generateWorkflowConnection(
          actionNode,
          workflows,
          info,
        );
        if (workFlow) {
          setAutomationBuilderFormValue('workflows', [...workflows, workFlow]);
          return applyConnectionUpdate(sourceAction, sourceType, sourceIndex);
        }
      }
    }

    // Trigger / Workflow standard connections
    const updated = generateStandarConnection(sourceNode, targetId, sourceType);

    return applyConnectionUpdate(updated, sourceType, sourceIndex);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const source = getNode(params.source);
      const target = getNode(params.target);
      if (source && target) {
        const info = generateConnectInfo(params, source, target);
        onConnection(info);
      }
    },
    [nodes, getNode],
  );

  const isValidConnection = useCallback(
    (connection: Connection) =>
      checkIsValidConnect({
        nodes,
        edges,
        connection,
        triggersConst,
        actionsConst,
      }),

    [nodes, edges],
  );

  const onAwaitingNodeConnection = (
    awaitingToConnectNodeId: string,
    targetId: string,
    generatedNode: any,
  ) => {
    const [_, awaitingNodeId] = splitAwaitingConnectionId(
      awaitingToConnectNodeId,
    );
    const source = getNode(awaitingNodeId);
    if (source) {
      const info = generateConnectInfo(
        {
          source: awaitingNodeId,
          target: targetId,
          targetHandle: 'left',
          sourceHandle: null,
        },
        source,
        generatedNode,
      );

      onConnection(info);
    }
  };

  const onDisconnect = (edge: EdgeProps) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));

    const source = getNode(edge.source);
    const target = getNode(edge.target);
    if (source && target) {
      const info = generateConnectInfo(
        {
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandleId || '',
          targetHandle: edge.targetHandleId || '',
        },
        source,
        target,
      );

      onConnection({ ...info, targetId: '' });
    }
  };

  return {
    isValidConnection,
    onConnect,
    onConnection,
    onAwaitingNodeConnection,
    onDisconnect,
  };
};
