import { IAction } from '@erxes/ui-automations/src/types';
import { ITrigger } from '../../types';
import { NodeType } from './types';

export const generateEdges = ({
  actions,
  triggers
}: {
  triggers: ITrigger[];
  actions: IAction[];
}) => {
  const generatedEdges: any = [];

  const commonStyle = {
    strokeWidth: 2
  };

  const commonEdgeDoc = {
    updatable: 'target',
    type: 'floating',
    sourceHandle: 'right',
    targetHandle: 'left'
  };

  for (const { type, edges } of [
    { type: 'trigger', edges: triggers },
    { type: 'action', edges: actions }
  ]) {
    const targetField = type === 'trigger' ? 'actionId' : 'nextActionId';

    for (const edge of edges) {
      const edgeObj = {
        ...commonEdgeDoc,
        id: `${type}-${edge.id}`,
        source: edge.id,
        target: edge[targetField],
        style: { ...commonStyle },
        data: {
          type
        }
      };

      const { optionalConnects = [], ...config } = edge?.config || {};

      if (edge.type === 'if') {
        const { yes, no } = config;

        for (const [key, value] of Object.entries({ yes, no })) {
          generatedEdges.push({
            ...edgeObj,
            id: `${type}-${edge.id}-${key}-${edgeObj.sourceHandle}`,
            sourceHandle: `${key}-${edgeObj.sourceHandle}`,
            target: value
          });
        }
        continue;
      }

      if (!!optionalConnects?.length) {
        for (const {
          actionId,
          sourceId,
          optionalConnectId
        } of optionalConnects) {
          generatedEdges.push({
            ...edgeObj,
            id: `${type}-${edge.id}-${optionalConnectId}`,
            sourceHandle: `${sourceId}-${optionalConnectId}-${edgeObj.sourceHandle}`,
            target: actionId,
            animated: true,
            style: { ...commonStyle }
          });
        }
      }

      generatedEdges.push(edgeObj);
    }
  }

  return generatedEdges;
};
const generateNode = (
  node: IAction & ITrigger,
  nodeType: string,
  nodes: IAction[] & ITrigger[],
  props: any
) => {
  const {
    isAvailableOptionalConnect,
    id,
    label,
    description,
    icon,
    config
  } = node;

  return {
    id,
    data: {
      label,
      description,
      icon,
      nodeType,
      [`${nodeType}Type`]: node.type,
      isAvailableOptionalConnect,
      config,
      ...props
    },
    position: node?.position || generatNodePosition(nodes, node),
    isConnectable: true,
    type: 'custom',
    style: {
      zIndex: -1
    }
  };
};

export const generateNodes = (
  { actions, triggers }: { actions: IAction[]; triggers: ITrigger[] },
  props
) => {
  if (triggers.length === 0 && actions.length === 0) {
    return [
      {
        id: 'scratch-node',
        type: 'scratch',
        data: { ...props },
        position: { x: 0, y: 0 }
      }
    ];
  }

  const generatedNodes: NodeType[] = [];

  for (const { type, nodes } of [
    { type: 'trigger', nodes: triggers },
    { type: 'action', nodes: actions }
  ]) {
    for (const node of nodes) {
      generatedNodes.push({
        ...generateNode(node, type, nodes, props)
      });
    }
  }

  return generatedNodes;
};

const generatNodePosition = (
  nodes: IAction[] & ITrigger[],
  node: IAction & ITrigger
) => {
  const targetField = node.type === 'trigger' ? 'actionId' : 'nextActionId';

  const prevNode = nodes.find(n => n[targetField] === node.id);

  if (!prevNode) {
    return { x: 0, y: 0 };
  }

  const { position } = prevNode;

  return {
    x: position?.x + 500,
    y: position?.y
  };
};

export const checkNote = (automationNotes, activeId: string) => {
  const item = activeId.split('-');
  const type = item[0];

  return (automationNotes || []).filter(note => {
    if (type === 'trigger' && note.triggerId !== item[1]) {
      return null;
    }

    if (type === 'action' && note.actionId !== item[1]) {
      return null;
    }

    return note;
  });
};
