import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useNodeConnect } from '@/automations/hooks/useNodeConnect';
import {
  TAutomationEdgeInsertTarget,
  automationEdgeInsertTargetState,
} from '@/automations/states/automationState';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { generateNode } from '@/automations/utils/automationBuilderUtils/generateNodes';
import {
  NODE_SPACING_X,
  NODE_SPACING_Y,
} from '@/automations/utils/automationBuilderUtils/nodePosition';
import { generateConnectInfo } from '@/automations/utils/automationConnectionUtils';
import {
  TAutomationBuilderActions,
  TAutomationBuilderForm,
} from '@/automations/utils/automationFormDefinitions';
import {
  Edge,
  Node,
  XYPosition,
  getIncomers,
  getOutgoers,
  useReactFlow,
} from '@xyflow/react';
import { useSetAtom } from 'jotai';
import React, { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';

const FORM_VALUE_OPTIONS = { shouldDirty: true, shouldTouch: true };

// Actions that route through named outputs instead of a single nextActionId.
const BRANCH_HANDLE_KEYS_BY_TYPE: Record<string, string[]> = {
  if: ['yes', 'no'],
  findObject: ['isExists', 'notExists'],
};

const getFreeBranchKey = (
  node: Node<NodeData>,
  branchKeys: string[],
  edges: Edge[],
) => {
  const taken = new Set(
    edges
      .filter(({ source }) => source === node.id)
      .map(({ sourceHandle }) => (sourceHandle || '').split('-')[0]),
  );

  return branchKeys.find((key) => !taken.has(key)) ?? null;
};

// How close a dragged node's centre has to sit to a connection's midpoint
// before that connection offers to take it in.
const NODE_DROP_RADIUS = 150;

/** The library entry an insert is built from, dragged or picked. */
export type TInsertableActionNode = {
  type: string;
  label: string;
  description: string;
  icon: string;
  isCustom?: boolean;
};

type TDroppedActionNode = TInsertableActionNode & {
  nodeType: AutomationNodeType;
};

/** An insertable connection, paired with the edge that drew it. */
export type TEdgeInsertCandidate = TAutomationEdgeInsertTarget & {
  edgeId: string;
};

type TPositionedItem = { id: string; position?: XYPosition };

const getNodeCentre = (node: Node<NodeData>): XYPosition => ({
  x: node.position.x + (node.measured?.width ?? 0) / 2,
  y: node.position.y + (node.measured?.height ?? 0) / 2,
});

const withShiftedPositions = <TItem extends TPositionedItem>(
  items: TItem[],
  shifted: Map<string, XYPosition>,
): TItem[] =>
  items.map((item) =>
    shifted.has(item.id) ? { ...item, position: shifted.get(item.id) } : item,
  );

export const useInsertNodeOnEdge = () => {
  const { isReadOnly, setQueryParams } = useAutomation();
  const { getValues, setValue } = useFormContext<TAutomationBuilderForm>();
  const { syncPositionUpdates } = useAutomationFormController();
  const { onConnection } = useNodeConnect();
  const { getNode, getNodes, getEdges } = useReactFlow<Node<NodeData>>();
  const setEdgeInsertTarget = useSetAtom(automationEdgeInsertTargetState);
  const flowDirection = useWatch<TAutomationBuilderForm, 'flowDirection'>({
    name: 'flowDirection',
  });

  /**
   * Only connections whose source side can be repointed are insertable.
   * Optional connects toggle themselves off when rewritten, and folk and
   * workflow handles carry no rule that `generateConnectInfo` can classify,
   * so rerouting either of those would quietly corrupt the flow.
   */
  const canInsertOnEdge = useCallback(
    (edge: Pick<Edge, 'source' | 'target' | 'sourceHandle' | 'data'>) => {
      if (isReadOnly || edge.data?.workflowId) {
        return false;
      }

      const sourceNode = getNode(edge.source);

      // The workflow Input marker is not a form node, so it owns no connection.
      if (!sourceNode?.data?.nodeType || !getNode(edge.target)) {
        return false;
      }

      if (sourceNode.data.nodeType === AutomationNodeType.Trigger) {
        return true;
      }

      if (sourceNode.data.nodeType !== AutomationNodeType.Action) {
        return false;
      }

      const [handleKey] = (edge.sourceHandle || 'right').split('-');
      const branchKeys =
        BRANCH_HANDLE_KEYS_BY_TYPE[String(sourceNode.data.type)];

      return branchKeys
        ? branchKeys.includes(handleKey)
        : handleKey === 'right';
    },
    [isReadOnly, getNode],
  );

  /**
   * Every node reachable from the edge's target moves aside by as many slots
   * as the insert occupies, so the incoming run takes the target's own place
   * instead of landing on top of it.
   */
  const collectDownstreamShift = useCallback(
    (targetId: string, slots: number) => {
      const nodes = getNodes();
      const edges = getEdges();
      const shifted = new Map<string, XYPosition>();
      const start = nodes.find(({ id }) => id === targetId);

      if (!start) {
        return shifted;
      }

      const queue = [start];
      const visited = new Set([targetId]);

      while (queue.length) {
        const node = queue.shift() as Node<NodeData>;

        shifted.set(
          node.id,
          flowDirection === 'vertical'
            ? {
                x: node.position.x,
                y: node.position.y + NODE_SPACING_Y * slots,
              }
            : {
                x: node.position.x + NODE_SPACING_X * slots,
                y: node.position.y,
              },
        );

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (visited.has(outgoer.id)) {
            continue;
          }
          visited.add(outgoer.id);
          queue.push(outgoer);
        }
      }

      return shifted;
    },
    [getNodes, getEdges, flowDirection],
  );

  /**
   * The straight run of actions hanging off a dragged node, head first. A
   * branching action may end the run — the old target takes its first free
   * output — but anywhere else it, like a folk, optional or workflow handle,
   * leaves no single end to attach to.
   */
  const collectLinearChain = useCallback(
    (head: Node<NodeData>, nodes: Node<NodeData>[], edges: Edge[]) => {
      const chain: Node<NodeData>[] = [];
      const seen = new Set<string>();
      let current: Node<NodeData> | undefined = head;

      while (current) {
        if (
          current.data?.nodeType !== AutomationNodeType.Action ||
          seen.has(current.id)
        ) {
          return null;
        }

        chain.push(current);
        seen.add(current.id);

        const branchKeys =
          BRANCH_HANDLE_KEYS_BY_TYPE[String(current.data.type)];

        if (branchKeys) {
          return getFreeBranchKey(current, branchKeys, edges) ? chain : null;
        }

        const outgoing = edges.filter(({ source }) => source === current?.id);

        if (!outgoing.length) {
          return chain;
        }

        const [edge] = outgoing;

        if (
          outgoing.length > 1 ||
          edge.data?.workflowId ||
          (edge.sourceHandle || 'right') !== 'right'
        ) {
          return null;
        }

        current = nodes.find(({ id }) => id === edge.target);
      }

      return null;
    },
    [],
  );

  /**
   * The run a node would carry into an edge, or null when it cannot be
   * spliced at all: an incoming connection would turn into a second parent,
   * and a branching tail leaves no single end for the old target.
   */
  const getSpliceableChain = useCallback(
    (nodeId: string) => {
      const nodes = getNodes();
      const edges = getEdges();
      const node = nodes.find(({ id }) => id === nodeId);

      if (!node || getIncomers(node, nodes, edges).length) {
        return null;
      }

      return collectLinearChain(node, nodes, edges);
    },
    [getNodes, getEdges, collectLinearChain],
  );

  /**
   * Rewires source → inserted → old target and pushes the tail aside.
   * The order matters: `onConnection` writes through the form controller,
   * which re-reads positions from the canvas store, so the shift can only be
   * written once the connection is already in place.
   */
  const spliceIntoEdge = useCallback(
    (
      insertTarget: TAutomationEdgeInsertTarget,
      insertedId: string,
      insertedNode: Node<NodeData>,
      insertedSlots: number,
      placeInsertedAction: (
        actions: TAutomationBuilderActions,
        slot: XYPosition,
      ) => TAutomationBuilderActions,
    ) => {
      const { source, sourceHandle, target } = insertTarget;
      const sourceNode = getNode(source);
      const targetNode = getNode(target);

      if (!sourceNode || !targetNode) {
        return;
      }

      // Canvas positions only reach the form when something syncs them; pull
      // them in first so the shift below builds on what the user sees.
      syncPositionUpdates(FORM_VALUE_OPTIONS);

      const slot = { ...targetNode.position };
      const shifted = collectDownstreamShift(target, insertedSlots);

      // Reuses the normal connection rules so branch handles keep the meaning
      // their sourceHandle already carries.
      onConnection(
        generateConnectInfo(
          { source, target: insertedId, sourceHandle, targetHandle: 'left' },
          sourceNode,
          insertedNode,
        ),
      );

      // Read back after the connection: it rewrote the source's entry.
      const connectedActions = getValues('actions') || [];

      setValue(
        'actions',
        placeInsertedAction(
          withShiftedPositions(connectedActions, shifted),
          slot,
        ),
        FORM_VALUE_OPTIONS,
      );

      const workflows = getValues('workflows') || [];

      if (workflows.some(({ id }) => shifted.has(id))) {
        setValue(
          'workflows',
          withShiftedPositions(workflows, shifted),
          FORM_VALUE_OPTIONS,
        );
      }

      setEdgeInsertTarget(null);
      setQueryParams({ activeNodeId: insertedId });
    },
    [
      getNode,
      getValues,
      setValue,
      syncPositionUpdates,
      collectDownstreamShift,
      onConnection,
      setEdgeInsertTarget,
      setQueryParams,
    ],
  );

  const insertNodeOnEdge = useCallback(
    (
      insertTarget: TAutomationEdgeInsertTarget,
      libraryNode: TInsertableActionNode,
    ) => {
      const targetNode = getNode(insertTarget.target);

      if (!targetNode) {
        return;
      }

      const [triggers = [], actions = [], workflows = []] = getValues([
        'triggers',
        'actions',
        'workflows',
      ]);

      const id = generateAutomationElementId(
        [...triggers, ...actions, ...workflows].map((node) => node.id),
      );

      const newAction: TAutomationBuilderActions[number] = {
        id,
        type: libraryNode.type,
        label: libraryNode.label,
        description: libraryNode.description,
        icon: libraryNode.icon,
        isCustom: libraryNode.isCustom,
        config: {},
        position: { ...targetNode.position },
        // Taking over the edge's target keeps the rest of the flow running.
        nextActionId: insertTarget.target,
      };

      const generatedNode: Node<NodeData> = generateNode(
        { ...newAction, nodeType: AutomationNodeType.Action },
        AutomationNodeType.Action,
        actions,
        { nodeIndex: actions.length },
        getNodes(),
        flowDirection,
      );

      spliceIntoEdge(
        insertTarget,
        id,
        generatedNode,
        1,
        (nextActions, slot) => [
          ...nextActions,
          { ...newAction, position: slot },
        ],
      );
    },
    [getNode, getNodes, getValues, flowDirection, spliceIntoEdge],
  );

  const insertExistingNodeOnEdge = useCallback(
    (insertTarget: TAutomationEdgeInsertTarget, nodeId: string) => {
      const head = getNode(nodeId);
      const chain = getSpliceableChain(nodeId);

      if (!head || !chain) {
        return;
      }

      const tail = chain[chain.length - 1];
      const tailBranchKeys = BRANCH_HANDLE_KEYS_BY_TYPE[String(tail.data.type)];
      // A branching tail routes through a named output, so the old target
      // takes the first one still free rather than a nextActionId.
      const tailBranchKey = tailBranchKeys
        ? getFreeBranchKey(tail, tailBranchKeys, getEdges())
        : null;

      spliceIntoEdge(
        insertTarget,
        nodeId,
        head,
        chain.length,
        (nextActions, slot) => {
          const offset = {
            x: slot.x - head.position.x,
            y: slot.y - head.position.y,
          };

          return nextActions.map((action) => {
            const member = chain.find(({ id }) => id === action.id);

            if (!member) {
              return action;
            }

            // The whole run travels with its head so it keeps its shape.
            const moved = {
              ...action,
              position: {
                x: member.position.x + offset.x,
                y: member.position.y + offset.y,
              },
            };

            if (action.id !== tail.id) {
              return moved;
            }

            return tailBranchKey
              ? {
                  ...moved,
                  config: {
                    ...moved.config,
                    [tailBranchKey]: insertTarget.target,
                  },
                }
              : { ...moved, nextActionId: insertTarget.target };
          });
        },
      );
    },
    [getNode, getEdges, getSpliceableChain, spliceIntoEdge],
  );

  /**
   * The connection a dragged node would drop into, if any. The node must own
   * no parent — rewiring one that already has an incoming connection would
   * quietly give it a second — and its tail must be a straight run.
   */
  const findInsertEdgeForNode = useCallback(
    (node: Node<NodeData>): TEdgeInsertCandidate | null => {
      const nodes = getNodes();
      const edges = getEdges();
      const chain = getSpliceableChain(node.id);

      if (!chain) {
        return null;
      }

      // Reaching back into the run being moved would close a loop.
      const chainIds = new Set(chain.map(({ id }) => id));
      const centre = getNodeCentre(node);
      let nearest: TEdgeInsertCandidate | null = null;
      let nearestDistance = NODE_DROP_RADIUS;

      for (const edge of edges) {
        if (
          chainIds.has(edge.source) ||
          chainIds.has(edge.target) ||
          !canInsertOnEdge(edge)
        ) {
          continue;
        }

        const source = nodes.find(({ id }) => id === edge.source);
        const target = nodes.find(({ id }) => id === edge.target);

        if (!source || !target) {
          continue;
        }

        // Every node is the same width, so the midpoint between two centres
        // is the midpoint between their facing handles in either direction.
        const sourceCentre = getNodeCentre(source);
        const targetCentre = getNodeCentre(target);
        const distance = Math.hypot(
          centre.x - (sourceCentre.x + targetCentre.x) / 2,
          centre.y - (sourceCentre.y + targetCentre.y) / 2,
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = {
            edgeId: edge.id,
            source: edge.source,
            sourceHandle: edge.sourceHandle ?? null,
            target: edge.target,
          };
        }
      }

      return nearest;
    },
    [getNodes, getEdges, getSpliceableChain, canInsertOnEdge],
  );

  const insertDroppedNodeOnEdge = useCallback(
    (
      insertTarget: TAutomationEdgeInsertTarget,
      event: React.DragEvent<HTMLDivElement>,
    ) => {
      const dropped = JSON.parse(
        event.dataTransfer.getData('application/reactflow/draggingNode') ||
          '{}',
      ) as TDroppedActionNode;

      if (dropped.nodeType !== AutomationNodeType.Action) {
        return;
      }

      insertNodeOnEdge(insertTarget, dropped);
    },
    [insertNodeOnEdge],
  );

  return {
    canInsertOnEdge,
    findInsertEdgeForNode,
    insertNodeOnEdge,
    insertExistingNodeOnEdge,
    insertDroppedNodeOnEdge,
  };
};
