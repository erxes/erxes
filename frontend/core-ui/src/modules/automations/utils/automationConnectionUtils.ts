import { NodeData } from '@/automations/types';
import { Connection, Edge, EdgeProps, getOutgoers, Node } from '@xyflow/react';
import { SetStateAction } from 'jotai';
import { Dispatch } from 'react';
import { IAction, ITrigger, OptionalConnect } from 'ui-modules';

export const connectionHandler = (
  triggers: ITrigger[],
  actions: IAction[],
  info: any,
  actionId: any,
  workFlowActions: { workflowId: string; actions: IAction[] }[],
) => {
  const { sourceId, type, connectType, optionalConnectId } = info || {};

  if (type === 'trigger') {
    const trigger = triggers.find((t) => t.id.toString() === sourceId);

    if (trigger) {
      trigger.actionId = actionId;

      if (info?.workflowId) {
        trigger.workflowId = info.workflowId;
      }
    }
  } else {
    const sourceAction = actions.find((a) => a.id.toString() === sourceId);

    if (sourceAction) {
      if (sourceAction.type === 'if') {
        if (!sourceAction.config) {
          sourceAction.config = {};
        }

        const [sourceHandle] = info.sourceHandle.split('-');

        sourceAction.config[sourceHandle] = actionId;
      }

      if (connectType === 'optional') {
        const sourceConfig = sourceAction?.config || {};

        const optionalConnects = sourceConfig?.optionalConnects || [];

        //update optionalConnects if optional connect exists in sourceAction
        let updatedOptionalConnects = optionalConnects.map(
          (optConnect: OptionalConnect) =>
            optConnect.sourceId === sourceId &&
            optConnect.optionalConnectId === info.optionalConnectId
              ? { ...optConnect, actionId }
              : optConnect,
        );

        // add optionalConnect if optional connect not exists in sourceAction
        if (
          !optionalConnects.some(
            (optConnect: OptionalConnect) =>
              optConnect.sourceId === sourceId &&
              optConnect.optionalConnectId === info?.optionalConnectId,
          )
        ) {
          updatedOptionalConnects.push({
            sourceId,
            actionId,
            optionalConnectId: info?.optionalConnectId,
          });
        }

        // disconnect optionalConnect if optional connect exists in sourceAction but info.optionalConnectId is undefined

        if (
          optionalConnects.some(
            (optConnect: OptionalConnect) =>
              optConnect.sourceId === sourceId &&
              optConnect.optionalConnectId === optionalConnectId,
          )
        ) {
          updatedOptionalConnects = optionalConnects.filter(
            (optConnect: OptionalConnect) =>
              optConnect.optionalConnectId !== optionalConnectId,
          );
        }

        sourceAction.config = {
          ...sourceConfig,
          optionalConnects: updatedOptionalConnects,
        };
      } else {
        sourceAction.nextActionId = actionId;
      }
    }

    const workflow = workFlowActions.find(
      ({ workflowId, actions }) =>
        workflowId === info?.workflowId &&
        actions.some(({ id }) => id.toString() === sourceId),
    );

    if (workflow) {
      const sourceAction = actions.find(({ id }) => id === workflow.workflowId);

      if (sourceAction) {
        sourceAction.config = {
          ...(sourceAction.config || {}),
          workflowConnection: { sourceId, targetId: actionId },
        };
      }
    }
  }

  return { triggers, actions };
};

export const generateConnect = (
  params: Connection,
  source?: Node<NodeData>,
) => {
  const { sourceHandle } = params;

  let info: any = {
    ...params,
    sourceId: params.source,
    targetId: params.target,
    type: source?.data?.nodeType,
  };

  if (sourceHandle) {
    if (sourceHandle.includes(params?.source)) {
      const [_sourceId, optionalConnectId] = sourceHandle.split('-');
      info.optionalConnectId = optionalConnectId;
      info.connectType = 'optional';
    }
  }

  // const targetWorkflow = workFlowActions?.find(({ actions }) =>
  //   actions.some(action => action.id === info.targetId)
  // );
  // if (targetWorkflow) {
  //   info.workflowId = targetWorkflow.workflowId;
  // }

  // const sourceWorkflow = workFlowActions?.find(({ actions }) =>
  //   actions.some(action => action.id === info.sourceId)
  // );

  // if (sourceWorkflow && info.targetId) {
  //   info.workflowId = sourceWorkflow.workflowId;
  // }

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
    if (node?.data?.nodeType === 'trigger') return true;
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

export const onDisconnect = ({
  edge,
  setEdges,
  nodes,
  triggers,
  actions,
}: {
  edge: EdgeProps;
  setEdges: Dispatch<SetStateAction<Edge<EdgeProps>[]>>;
  nodes: Node<NodeData>[];
  triggers: ITrigger[];
  actions: IAction[];
}) => {
  setEdges((eds: Edge<EdgeProps>[]) => eds.filter((e) => e.id !== edge.id));
  const info: any = { source: edge.source, target: undefined };

  const sourceNode = nodes.find((n) => n.id === edge.source);

  if ((edge?.sourceHandleId || '').includes(sourceNode?.id || '')) {
    const [_action, _sourceId, optionalConnectId] = (edge.id || '').split('-');
    info.optionalConnectId = optionalConnectId;
    info.connectType = 'optional';
  }

  connectionHandler(
    triggers,
    actions,
    generateConnect(
      {
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandleId || '',
        targetHandle: edge.targetHandleId || '',
      },
      sourceNode,
    ),
    info.targetId,
    [],
  );
};
