import { ICustomer } from '@/contacts/types/customerType';
import { IUser } from '@/settings/team-member/types';
import { useQuery } from '@apollo/client';
import { Edge, Node } from '@xyflow/react';
import { generateAutomationElementId, IAction, ITrigger } from 'ui-modules';
import { GET_CUSTOMERS_EMAIL, GET_TEAM_MEMBERS_EMAIL } from '../graphql/utils';
import {
  AutomationDropHandlerParams,
  AutomationNodeType,
  NodeData,
  TDraggingNode,
} from '../types';

/**
 * Calculates the position of a node in the React Flow canvas.
 *
 * - If the node already has a position, it returns that position,
 *   unless the position is already taken by another generated node,
 *   in which case it offsets the position by (10, 10) to avoid overlap.
 * - If the node doesn't have a position, it attempts to position it
 *   relative to the previous node in the chain (based on `actionId` or `nextActionId`),
 *   offsetting it by +500 in the x-direction.
 * - Defaults to (0,0) if no previous node is found.
 *
 * @param nodes - Array of sibling nodes (actions or triggers) to search for the previous node.
 * @param node - The current node for which to calculate the position.
 * @param generatedNodes - Array of already generated nodes to check for position conflicts.
 * @returns An object with `x` and `y` coordinates for the node position.
 */

export const generateNodePosition = (
  nodes: IAction[] & ITrigger[],
  node: IAction & ITrigger,
  generatedNodes: Node<NodeData>[],
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

  const prevNode = nodes.find((n: any) => n[targetField] === node.id);

  if (!prevNode) {
    return { x: 0, y: 0 };
  }

  const { position } = prevNode;

  return {
    x: position?.x + 500,
    y: position?.y,
  };
};

/**
 * Generates a React Flow node object from a given action or trigger node,
 * adding position, styles, and additional data needed for rendering and interaction.
 *
 * @param node - The action or trigger node data, containing fields like id, label, config, etc.
 * @param nodeType - A string representing the type of the node ('action', 'trigger', etc.).
 * @param nodes - The list of sibling nodes used for calculating node position.
 * @param props - Additional properties to merge into the node's data (e.g., UI context, indexes).
 * @param generatedNodes - Array of already generated nodes, useful for position calculation and layout.
 * @param parentId - Optional ID of the parent node, for nesting and grouping this node under a parent.
 *
 * @returns A React Flow `Node<NodeData>` object configured with position, data, style, and interaction properties.
 */

export const generateNode = (
  node: IAction & ITrigger,
  nodeType: string,
  nodes: IAction[] & ITrigger[],
  props: any,
  generatedNodes: Node<NodeData>[],
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
    nextActionId,
    actionId,
  } = node;

  const doc: any = {
    id,
    data: {
      label,
      description,
      icon,
      nodeType,
      type: node.type,
      isAvailableOptionalConnect,
      config,
      isCustom,
      nextActionId,
      actionId,
      ...props,
    },
    position: generateNodePosition(nodes, node, generatedNodes),
    isConnectable: true,
    type: nodeType,
    style: {
      zIndex: -1,
    },
  };

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

/**
 * Generates React Flow nodes for triggers, actions, and optionally nested workflow actions.
 *
 * - Returns a default "scratch" node if no triggers or actions exist.
 * - Generates nodes for triggers and actions with additional props.
 * - Recursively generates nodes for nested workflows if provided.
 *
 * @param params - Object containing lists of actions, triggers, and optionally workflow actions.
 * @param params.actions - Array of action nodes.
 * @param params.triggers - Array of trigger nodes.
 * @param params.workFlowActions - Optional array of workflow objects, each containing a workflowId and associated actions.
 * @param props - Additional props passed to each generated node, can include UI or contextual data.
 *
 * @returns An array of React Flow `Node<NodeData>` objects representing all nodes in the workflow diagram.
 */

export const generateNodes = (
  triggers: ITrigger[],
  actions: IAction[],
  props: any = {},
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

  const generatedNodes: Node<NodeData>[] = [];

  for (const { type, nodes = [] } of [
    { type: 'trigger', nodes: triggers },
    { type: 'action', nodes: actions },
  ]) {
    nodes.forEach((node, index) => {
      generatedNodes.push({
        ...generateNode(
          { ...node, config: node.config ?? {} },
          type,
          nodes.map((n) => ({ ...n, config: n.config ?? {} })),
          { ...props, nodeIndex: index },
          generatedNodes,
        ),
      });
    });
  }

  return generatedNodes;
};

/**
 * Generates an array of edges for rendering in a React Flow diagram,
 * based on provided triggers, actions, and optionally nested workflow actions.
 *
 * The function processes triggers and actions, constructing edges with proper
 * source, target, styles, and special handling for conditional ("if") edges,
 * optional connects, and workflow connections.
 *
 * @param params - The input parameters object.
 * @param params.triggers - Array of trigger nodes with their edges.
 * @param params.actions - Array of action nodes with their edges.
 * @param params.workFlowActions - Optional array of nested workflows, each containing a workflowId and its own actions.
 *
 * @returns An array of `Edge` objects to be used with React Flow representing connections between nodes.
 */

export const generateEdges = (
  triggers: ITrigger[],
  actions: IAction[],
): Edge[] => {
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
      const target = (edge as any)[targetField];

      const edgeObj = {
        ...commonEdgeDoc,
        id: `${type}-${edge.id}`,
        source: edge.id,
        target: target,
        style: { ...commonStyle },
        type: 'primary',
        data: {
          type,
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

      if (!edgeObj?.target) {
        continue;
      }

      generatedEdges.push(edgeObj);
    }
  }

  return generatedEdges;
};

/**
 * Recursively traverses an input object or array and replaces all `null` values with `undefined`.
 *
 * - For arrays, it processes each element recursively.
 * - For objects, it processes each key-value pair recursively, replacing `null` values with `undefined`.
 * - For other types, it returns the value as-is.
 *
 * @param input - The input object, array, or value to clean.
 * @returns A new structure mirroring the input but with all `null` values replaced by `undefined`.
 */

export const deepCleanNulls = (input: any): any => {
  if (Array.isArray(input)) {
    return input.map(deepCleanNulls);
  } else if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        value === null ? undefined : deepCleanNulls(value),
      ]),
    );
  }
  return input;
};

/**
 * Recursively finds the trigger associated with the given action ID
 * or its parent actions in the automation chain.
 *
 * @param currentActionId - The ID of the current action to find the trigger for.
 * @param actions - The list of all actions, where each action may point to the next via `nextActionId`.
 * @param triggers - The list of all triggers, each linked to an action by `actionId`.
 * @returns The trigger corresponding to the current action or its ancestors,
 *          or the first trigger as a fallback if none is found.
 */

export const getContentType = (
  currentActionId: string,
  actions: IAction[],
  triggers: ITrigger[],
): ITrigger | undefined => {
  const trigger = triggers.find((t) => t.actionId === currentActionId);
  if (trigger) {
    return trigger;
  }

  // Find the parent action that leads to this current action
  const parentAction = actions.find((a) => a.nextActionId === currentActionId);
  if (parentAction) {
    // Recursively call the function with the parent action
    return getContentType(parentAction.id, actions, triggers);
  }

  // Fallback if nothing found in the chain
  return triggers[0];
};
/**
 * Finds the trigger type associated with a given action by walking backward
 * through the actions chain from the current action ID.
 *
 * @param currentActionId - The ID of the current action to start the search from.
 * @param actions - Array of all actions, each possibly linking to the next via `nextActionId`.
 * @param triggers - Array of triggers, each associated with an action by `actionId`.
 * @returns The type of the trigger corresponding to the current or previous linked action,
 *          or `undefined` if no matching trigger is found.
 */
export const getTriggerOfAction = (
  currentActionId: string,
  actions: IAction[],
  triggers: ITrigger[],
) => {
  // Build a map of nextActionId → actionId
  const reverseMap = new Map<string, string>();

  for (const { id, nextActionId } of actions) {
    if (nextActionId) {
      reverseMap.set(nextActionId, id);
    }
  }

  let cursor = currentActionId;

  // Walk backward
  while (cursor) {
    const trigger = triggers.find((t) => t.actionId === cursor);
    if (trigger) return trigger.type;

    cursor = reverseMap.get(cursor) ?? '';
  }

  return undefined;
};

/**
 * Generates a combined list of recipient email addresses for sending emails,
 * based on attribution, custom mails, customers, and team members.
 *
 * @param params - Object containing email lists and attribution mails.
 * @param params.attributionMails - Optional comma-separated string of attribution email addresses.
 * @param params.customMails - Optional array of custom email addresses to include. Defaults to empty array.
 * @param params.customer - Optional array of customer email addresses. Defaults to empty array.
 * @param params.teamMember - Optional array of team member email addresses. Defaults to empty array.
 * @returns An array of unique email addresses to send the email to.
 */

export const generateSendEmailRecipientMails = ({
  attributionMails,
  customMails = [],
  customer = [],
  teamMember = [],
}: {
  attributionMails?: string;
  customMails?: string[];
  customer?: string[];
  teamMember?: [];
}) => {
  let mails = [];

  if (attributionMails) {
    mails.push(attributionMails);
  }
  if (customMails.length) {
    mails = [...mails, ...customMails];
  }

  if (customer.length) {
    const { data } = useQuery(GET_CUSTOMERS_EMAIL);

    const customerMails = (data?.list || [])
      .map(({ primaryEmail }: ICustomer) => primaryEmail)
      .filter((email: string) => email);
    mails = [...mails, ...customerMails];
  }
  if (teamMember.length) {
    const { data } = useQuery(GET_TEAM_MEMBERS_EMAIL);

    const teamMemberMails = (data?.list || [])
      .map(({ email }: IUser) => email)
      .filter((email: string) => email);
    mails = [...mails, ...teamMemberMails];
  }

  return mails;
};

/**
 * Handles the drop event on the automation canvas, allowing
 * users to add triggers or actions by dragging them onto the flow.
 *
 * @param params - The parameters including the drop event, react flow instance,
 * triggers list, and actions list.
 */

export const automationDropHandler = ({
  triggers,
  actions,
  event,
  reactFlowInstance,
}: AutomationDropHandlerParams) => {
  event.preventDefault();

  const draggingNode = event.dataTransfer.getData(
    'application/reactflow/draggingNode',
  );

  const {
    nodeType,
    type,
    label,
    description,
    icon,
    isCustom,
    awaitingToConnectNodeId,
  } = JSON.parse(draggingNode || '{}') as TDraggingNode;

  if (!nodeType) {
    return {
      actions,
      triggers,
    };
  }

  const position = reactFlowInstance?.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  const id = generateAutomationElementId(
    [...triggers, ...actions].map((a) => a.id),
  );

  if (awaitingToConnectNodeId) {
    const [awaitingNodeType, nodeId, connectionFieldName] =
      awaitingToConnectNodeId.split('__') as [
        AutomationNodeType,
        string,
        string | undefined,
      ];

    const isValidNodeType = ['trigger', 'action'].includes(awaitingNodeType);

    if (isValidNodeType && nodeId) {
      if (awaitingNodeType === 'trigger') {
        triggers = triggers.map((trigger) =>
          trigger.id === nodeId
            ? generateAwaitingNodeConnection(
                trigger,
                awaitingNodeType,
                id,
                connectionFieldName,
              )
            : trigger,
        );
      } else {
        actions = actions.map((action) =>
          action.id === nodeId
            ? generateAwaitingNodeConnection(
                action,
                awaitingNodeType,
                id,
                connectionFieldName,
              )
            : action,
        );
      }
    }
  }

  if (nodeType === 'trigger') {
    triggers = [
      ...triggers,
      {
        id,
        type,
        config: {},
        icon,
        label,
        description,
        isCustom,
        position,
      },
    ];
  } else {
    actions = [
      ...actions,
      {
        id,
        type,
        config: {},
        icon,
        label,
        description,
        isCustom,
        position,
      },
    ];
  }

  return {
    actions,
    triggers,
  };
};

/**
 * Generates a connection object or configuration for an awaiting node in an automation flow.
 *
 * @param node - The action or trigger node object to generate the connection for.
 * @param nodeType - A string representing the type of the node (e.g., 'action', 'trigger').
 * @param actionId - The ID of the action to connect or link.
 * @param connectionFieldName - Optional field name that specifies the connection property on the node.
 * @returns The generated connection object or configuration (adjust return type as needed).
 */

const generateAwaitingNodeConnection = (
  node: IAction | ITrigger,
  nodeType: string,
  actionId: string,
  connectionFieldName?: string,
) => {
  let fieldName = nodeType === 'trigger' ? 'actionId' : 'nextActionId';
  let fieldValue = actionId;

  if (connectionFieldName) {
    fieldName = `config`;

    fieldValue = setNestedField(
      { ...(node?.config || {}) },
      connectionFieldName,
      actionId,
    );
  }

  return { ...node, [fieldName]: fieldValue } as any;
};

/**
 * Sets a nested field value inside an object given a dot-separated path.
 *
 * @param obj - The object to update. It will be mutated.
 * @param path - The dot-separated path string specifying the nested field to set (e.g., "a.b.c").
 * @param value - The value to assign at the nested path.
 * @returns The updated object with the nested value set.
 */

function setNestedField(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;

  keys.slice(0, -1).forEach((key) => {
    if (!current[key]) current[key] = {};
    current = current[key];
  });

  current[keys[keys.length - 1]] = value;
  return obj;
}
