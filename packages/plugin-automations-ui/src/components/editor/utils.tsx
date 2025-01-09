import { IAction } from '@erxes/ui-automations/src/types';
import { colors } from '@erxes/ui/src';
import { isEqual } from 'lodash';
import { Edge } from 'reactflow';
import { ITrigger } from '../../types';
import { NodeType } from './types';
import { rgba } from '@erxes/ui/src/styles/ecolor';

export const generateEdges = ({
  actions,
  triggers,
  workFlowActions,
  onDisconnect,
}: {
  triggers: ITrigger[];
  actions: IAction[];
  workFlowActions?: { workflowId: string; actions: IAction[] }[];
  onDisconnect?: (edge) => void;
}): Edge[] => {
  let generatedEdges: any = [];

  const commonStyle = {
    strokeWidth: 2,
  };

  const commonEdgeDoc = {
    updatable: 'target',
    sourceHandle: 'right',
    targetHandle: 'left',
  };

  for (const { type, edges } of [
    { type: 'trigger', edges: triggers },
    { type: 'action', edges: actions },
  ]) {
    const targetField = type === 'trigger' ? 'actionId' : 'nextActionId';

    for (const edge of edges) {
      const edgeObj = {
        ...commonEdgeDoc,
        id: `${type}-${edge.id}`,
        source: edge.id,
        target: edge[targetField],
        style: { ...commonStyle },
        type: 'primary',
        data: {
          type,
          onDisconnect,
        },
      };

      const {
        optionalConnects = [],
        workflowConnections = [],
        ...config
      } = edge?.config || {};

      if (edge.type === 'if') {
        const { yes, no } = config;

        for (const [key, value] of Object.entries({ yes, no })) {
          generatedEdges.push({
            ...edgeObj,
            id: `${type}-${edge.id}-${key}-${edgeObj.sourceHandle}`,
            sourceHandle: `${key}-${edgeObj.sourceHandle}`,
            target: value,
          });
        }
        continue;
      }

      if (!!optionalConnects?.length) {
        for (const {
          actionId,
          sourceId,
          optionalConnectId,
        } of optionalConnects) {
          if (!actionId) {
            continue;
          }
          generatedEdges.push({
            ...edgeObj,
            id: `${type}-${edge.id}-${optionalConnectId}`,
            sourceHandle: `${sourceId}-${optionalConnectId}-${edgeObj.sourceHandle}`,
            target: actionId,
            animated: true,
            style: { ...commonStyle },
          });
        }
      }

      if (type === 'action' && edge.workflowId && edge[targetField]) {
        const workflow = (workFlowActions || [])?.find(
          ({ workflowId, actions }) =>
            workflowId === edge.workflowId &&
            actions.some((ac) => ac.id === edge[targetField]),
        );

        if (workflow) {
        }
      }

      if (edgeObj.type === 'workflow') {
        if (
          workFlowActions?.find(
            ({ workflowId }) => edge.workflowId === workflowId,
          ) &&
          workflowConnections.length
        ) {
          for (const conn of workflowConnections) {
            generatedEdges.push({
              ...edgeObj,
              id: `${edge.workflowId}-${conn.id}`,
              target: conn.targetId,
              source: conn.sourceId,
              animated: true,
              style: { ...commonStyle, color: colors.colorPrimary },
            });
          }
        } else {
          const workflow = (workFlowActions || [])?.some(({ actions }) =>
            actions.some((action) => action.id !== edge[targetField]),
          );
          if (workflow) {
            edgeObj.target = undefined;
          }
        }
      }
      if (
        edge?.workflowId &&
        !(workFlowActions || [])?.some(
          (workFlowAction) => workFlowAction?.workflowId === edge?.workflowId,
        )
      ) {
        edgeObj.target = edge?.workflowId;
      }

      if (!edgeObj?.target) {
        continue;
      }

      generatedEdges.push(edgeObj);
    }
  }
  for (const { actions } of workFlowActions || []) {
    const workflowEdges = generateEdges({ actions, triggers: [] });
    generatedEdges = [...generatedEdges, ...workflowEdges];
  }

  return generatedEdges;
};
export const generateNode = (
  node: IAction & ITrigger,
  nodeType: string,
  nodes: IAction[] & ITrigger[],
  props: any,
  generatedNodes: NodeType[],
  parentId?: string,
) => {
  const {
    isAvailableOptionalConnect,
    id,
    label,
    description,
    icon,
    config,
    isCustom,
  } = node;

  const doc: any = {
    id,
    data: {
      label,
      description,
      icon,
      nodeType,
      [`${nodeType}Type`]: node.type,
      isAvailableOptionalConnect,
      config,
      ...props,
    },
    position: generatNodePosition(nodes, node, generatedNodes),
    isConnectable: true,
    type: node.type === 'workflow' ? 'workflow' : 'primary',
    style: {
      zIndex: -1,
    },
  };

  if (node.type === 'workflow') {
    doc.style = {
      backgroundColor: rgba(colors.colorPrimary, 0.12),
      border: `1px solid ${colors.borderPrimary}`,
      borderRadius: '8px',
      zIndex: -1,
    };
  }

  if (parentId) {
    doc.parentId = parentId;
    doc.extent = 'parent';
    doc.expandParent = true;
    doc.draggable = false;
    doc.selectable = false;
    doc.connectable = false;
  }

  return doc;
};

export const generateNodes = (
  {
    actions,
    triggers,
    workFlowActions,
  }: {
    actions: IAction[];
    triggers: ITrigger[];
    workFlowActions?: { workflowId: string; actions: IAction[] }[];
  },
  props,
) => {
  if (triggers.length === 0 && actions.length === 0) {
    return [
      {
        id: 'scratch-node',
        type: 'scratch',
        data: props,
        position: { x: 0, y: 0 },
      },
    ];
  }

  const generatedNodes: NodeType[] = [];

  for (const { type, nodes } of [
    { type: 'trigger', nodes: triggers },
    { type: 'action', nodes: actions },
  ]) {
    for (const node of nodes) {
      generatedNodes.push({
        ...generateNode(node, type, nodes, props, generatedNodes),
      });
    }
  }

  for (const { workflowId, actions } of workFlowActions || []) {
    for (const action of actions) {
      generatedNodes.push(
        generateNode(action, 'action', actions, props, [], workflowId),
      );
    }
  }

  return generatedNodes;
};

export const generatNodePosition = (
  nodes: IAction[] & ITrigger[],
  node: IAction & ITrigger,
  generatedNodes: NodeType[],
) => {
  if (node.position) {
    if (
      generatedNodes.find(
        (generatedNode) =>
          generatedNode?.position?.x === node?.position?.x &&
          generatedNode?.position?.y === node?.position?.y,
      )
    ) {
      return {
        x: (node?.position?.x || 0) + 10,
        y: (node?.position?.y || 0) + 10,
      };
    }
    return node.position;
  }

  const targetField = node.type === 'trigger' ? 'actionId' : 'nextActionId';

  const prevNode = nodes.find((n) => n[targetField] === node.id);

  if (!prevNode) {
    return { x: 0, y: 0 };
  }

  const { position } = prevNode;

  return {
    x: position?.x + 500,
    y: position?.y,
  };
};

export const checkNote = (automationNotes, activeId: string) => {
  const item = activeId.split('-');
  const type = item[0];

  return (automationNotes || []).filter((note) => {
    if (type === 'trigger' && note.triggerId !== item[1]) {
      return null;
    }

    if (type === 'action' && note.actionId !== item[1]) {
      return null;
    }

    return note;
  });
};

export const generatePostion = (position: { x: number; y: number }) => {
  const { x, y } = position;

  if (x && y) {
    return { y, x: x + 350 };
  }
};

export const checkAutomationChanged = (
  triggers,
  actions,
  automation,
  newName,
) => {
  return (
    !isEqual(triggers, automation.triggers || []) ||
    !isEqual(actions, automation.actions || []) ||
    automation.name !== newName
  );
};
