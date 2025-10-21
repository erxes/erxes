import { CONNECTION_PROPERTY_NAME_MAP } from '@/automations/constants';
import {
  AutomationNodeType,
  ConnectionInfo,
  NodeData,
} from '@/automations/types';
import { checkValidOptionalConnect } from '@/automations/utils/automationBuilderUtils/connectionUtils';
import { Connection, Edge, getOutgoers, Node } from '@xyflow/react';

export const generateConnectInfo = (
  params: Connection,
  source: Node<NodeData>,
  target: Node<NodeData>,
): ConnectionInfo => {
  const { sourceHandle, targetHandle } = params;

  const info: ConnectionInfo = {
    ...params,
    sourceId: params.source,
    targetId: params.target,
    sourceType: source.data.nodeType,
    targetType: target.data.nodeType,
    sourceIndex: source.data.nodeIndex,
    targetIndex: target.data.nodeIndex,
  };

  if (sourceHandle) {
    if (sourceHandle.includes(params?.source)) {
      const [_sourceId, optionalConnectId] = sourceHandle.split('-');
      info.optionalConnectId = optionalConnectId;
      info.connectType = 'optional';
    }
  }
  if (targetHandle?.includes('workflow')) {
    const [_, automationId, actionId] = targetHandle.split('-');
    info.automationId = automationId;
    info.actionId = actionId;
    info.connectType = 'workflow';
  }

  return info;
};

export const checkIsValidConnect = ({
  nodes,
  edges,
  connection,
  triggersConst,
  actionsConst,
}: {
  nodes: Node<NodeData>[];
  connection: Connection;
  edges: Edge[];
  triggersConst: any[];
  actionsConst: any[];
}) => {
  const target = nodes.find((node) => node.id === connection.target);
  const source = nodes.find((node) => node.id === connection.source);

  const hasCycle = (node: Node<NodeData>, visited = new Set()) => {
    if (node?.data?.nodeType === AutomationNodeType.Trigger) return true;
    if (visited.has(node.id)) return false;

    visited.add(node.id);

    for (const outgoer of getOutgoers(node, nodes, edges)) {
      if (outgoer.id === connection.source) return true;
      if (hasCycle(outgoer, visited)) return true;
    }
  };

  if (!target || !source) {
    return false;
  }

  const connectionInfo = generateConnectInfo(connection, source, target);

  if (connectionInfo.connectType === 'optional') {
    if (!checkValidOptionalConnect(source)) {
      return false;
    }
  }

  if (source.data.type === 'if') {
    const [sourceHandleType] = (connection.sourceHandle || '').split('-');

    if (!!source.data?.config[sourceHandleType]) {
      return false;
    }
  }

  if (source.data.nodeType !== AutomationNodeType.Workflow) {
    const fieldName = CONNECTION_PROPERTY_NAME_MAP[source.data.nodeType];
    if (!!source.data[fieldName]) {
      return false;
    }
  }

  if (source.data.nodeType === AutomationNodeType.Trigger) {
    const targetId = target.data.id;
    const trigger = nodes.find(
      (node) =>
        node.data.actionId === targetId &&
        node.data.nodeType === AutomationNodeType.Trigger,
    );
    if (trigger && source.data.type !== trigger?.data.type) {
      return false;
    }

    // check if the trigger is already connected to another triggers

    const node = nodes.find(
      ({ data }) =>
        data.nodeType === AutomationNodeType.Trigger &&
        data.actionId === targetId,
    ) as Node<NodeData>;
    if (node) {
      return false;
    }
  }

  const allNodes = [...triggersConst, ...actionsConst];
  const sourceDef = allNodes.find((n) => n.type === source.data?.type);

  if (
    sourceDef?.connectableActionTypes &&
    !sourceDef.connectableActionTypes.includes(target.data?.type)
  ) {
    return false;
  }

  return !hasCycle(target);
};

export const splitAwaitingConnectionId = (awaitingToConnectNodeId: string) => {
  return awaitingToConnectNodeId.split('__') as [
    AutomationNodeType.Trigger | AutomationNodeType.Action,
    string,
    string | undefined,
  ];
};
