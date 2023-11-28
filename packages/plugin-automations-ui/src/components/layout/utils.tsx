import { Position, internalsSymbol } from 'reactflow';
import { ITrigger } from '../../types';
import { IAction } from '@erxes/ui-automations/src/types';

function getParams(nodeA, nodeB) {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let position;

  if (horizontalDiff > verticalDiff) {
    position = centerA.x > centerB.x ? Position.Left : Position.Right;
  } else {
    position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
  }

  const [x, y] = getHandleCoordsByPosition(nodeA, position);
  return [x, y, position];
}

function getHandleCoordsByPosition(node, handlePosition) {
  const handle = node[internalsSymbol].handleBounds.source.find(
    h => h.position === handlePosition
  );

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
    case Position.Top:
      offsetY = 0;
      break;
    case Position.Bottom:
      offsetY = handle.height;
      break;
  }

  const x = node.positionAbsolute.x + handle.x + offsetX;
  const y = node.positionAbsolute.y + handle.y + offsetY;

  return [x, y];
}

function getNodeCenter(node) {
  return {
    x: node.positionAbsolute.x + node.width / 2,
    y: node.positionAbsolute.y + node.height / 2
  };
}

export function getEdgeParams(source, target) {
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos
  };
}

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

      const { optionalConnects = [] } = edge?.config || {};

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

export const generateNodes = (
  { actions, triggers }: { actions: IAction[]; triggers: ITrigger[] },
  props
) => {
  const generateNode = (node, nodeType) => {
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
      position: node?.position || { x: 2, y: 2 },
      isConnectable: true,
      type: 'custom',
      style: {
        zIndex: -1
      }
    };
  };

  const generatedNodes: any[] = [];

  for (const { type, nodes } of [
    { type: 'trigger', nodes: triggers },
    { type: 'action', nodes: actions }
  ]) {
    for (const node of nodes) {
      generatedNodes.push({
        ...generateNode(node, type)
      });
    }
  }

  return generatedNodes;
};
