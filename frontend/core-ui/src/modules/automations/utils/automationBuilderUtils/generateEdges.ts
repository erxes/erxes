import { CONNECTION_PROPERTY_NAME_MAP } from '@/automations/constants';
import { AutomationNodeType } from '@/automations/types';
import { Edge } from '@xyflow/react';
import {
  TAutomationAction,
  TAutomationTrigger,
  TAutomationWorkflowNode,
  TAutomationOptionalConnect,
} from 'ui-modules';
import type { IAutomationsActionFolkConfig } from 'ui-modules';

const COMMON_EDGE_STYLES = { strokeWidth: 2 };
const COMMON_EDGE_VARIABLES = {
  updatable: 'target' as const,
  sourceHandle: 'right',
  targetHandle: 'left',
};
// --- Helper functions ---

export const buildPrimaryEdge = (
  nodeType: AutomationNodeType,
  sourceId: string,
  targetId: string,
): Edge => ({
  ...COMMON_EDGE_VARIABLES,
  id: `${nodeType}-${sourceId}`,
  sourceHandle: 'right',
  source: sourceId,
  target: targetId,
  style: COMMON_EDGE_STYLES,
  type: 'primary',
  data: { type: nodeType },
});

export const buildIfEdges = (
  nodeType: AutomationNodeType,
  edge: TAutomationAction,
  config: Record<string, any>,
): Edge[] => {
  return (['yes', 'no'] as const).flatMap((key) =>
    config[key]
      ? [
          {
            ...COMMON_EDGE_VARIABLES,
            id: `${nodeType}-${edge.id}-${key}`,
            source: edge.id,
            sourceHandle: `${key}-right`,
            target: config[key],
            style: COMMON_EDGE_STYLES,
            type: 'primary',
            data: { type: nodeType },
          },
        ]
      : [],
  );
};
export const buildFindObjectEdges = (
  nodeType: AutomationNodeType,
  edge: TAutomationAction,
  config: Record<string, any>,
): Edge[] => {
  return (['isExists', 'notExists'] as const).flatMap((key) =>
    config[key]
      ? [
          {
            ...COMMON_EDGE_VARIABLES,
            id: `${nodeType}-${edge.id}-${key}`,
            source: edge.id,
            sourceHandle: `${key}-right`,
            target: config[key],
            style: COMMON_EDGE_STYLES,
            type: 'primary',
            data: { type: nodeType },
          },
        ]
      : [],
  );
};

const buildFolksEdges = (
  nodeType: AutomationNodeType,
  edge: TAutomationAction,
  config: Record<string, any>,
  folks: IAutomationsActionFolkConfig[] = [],
): Edge[] =>
  folks.flatMap(({ key }) =>
    config?.[key]
      ? [
          {
            ...COMMON_EDGE_VARIABLES,
            id: `${nodeType}-${edge.id}-${key}`,
            source: edge.id,
            sourceHandle: `${key}-right`,
            target: config[key],
            style: COMMON_EDGE_STYLES,
            type: 'primary',
            data: { type: nodeType },
          },
        ]
      : [],
  );

const buildWorkflowEdges = (
  nodeType: AutomationNodeType,
  edge: TAutomationAction,
  workflowMap: Map<string, TAutomationWorkflowNode>,
): Edge[] => {
  if (nodeType !== AutomationNodeType.Action) return [];
  if (!edge.workflowId) return [];

  const workflow = workflowMap.get(edge.workflowId);
  if (!workflow?.config?.connections) return [];

  return workflow.config.connections
    .filter((conn: any) => conn.sourceActionId === edge.id)
    .map((conn: any) => {
      const { handle, sourceActionId, targetActionId } = conn;
      return {
        id: `workflow-${workflow.automationId}-${targetActionId}`,
        source: sourceActionId,
        target: workflow.id, // node ID
        sourceHandle: handle, // e.g. "right"
        targetHandle: `workflow-${workflow.automationId}-${targetActionId}-left`,
        type: 'primary',
        updatable: 'target' as const,
        style: COMMON_EDGE_STYLES,
        data: {
          workflowId: workflow.id,
          targetActionId: targetActionId,
          handle: handle,
        },
      };
    });
};

const buildOptionalEdges = (
  nodeType: AutomationNodeType,
  edge: TAutomationAction,
  optionalConnects: TAutomationOptionalConnect[],
): Edge[] =>
  optionalConnects.flatMap(({ actionId, sourceId, optionalConnectId }) =>
    actionId
      ? [
          {
            ...COMMON_EDGE_VARIABLES,
            id: `${nodeType}-${edge.id}-${optionalConnectId}`,
            source: edge.id,
            sourceHandle: `${sourceId}-${optionalConnectId}-right`,
            target: actionId,
            animated: true,
            style: COMMON_EDGE_STYLES,
            type: 'primary',
            data: { type: nodeType },
          },
        ]
      : [],
  );

export const generateEdge = (
  type: AutomationNodeType,
  edge: any,
  targetField: string,
  workflowMap: Map<string, TAutomationWorkflowNode>,
  folksMap?: Map<string, IAutomationsActionFolkConfig[]>,
) => {
  const generatedEdges = [];
  const target = (edge as any)[targetField];
  const { optionalConnects = [], ...config } = edge?.config || {};

  if (type === AutomationNodeType.Action) {
    if (folksMap && folksMap.has(edge.type)) {
      generatedEdges.push(
        ...buildFolksEdges(
          type,
          edge as TAutomationAction,
          config,
          folksMap.get(edge.type) || [],
        ),
      );
    }

    if (optionalConnects.length > 0) {
      generatedEdges.push(
        ...buildOptionalEdges(
          type,
          edge as TAutomationAction,
          optionalConnects,
        ),
      );
    }

    if (edge.workflowId) {
      generatedEdges.push(
        ...buildWorkflowEdges(type, edge as TAutomationAction, workflowMap),
      );
    }
  }

  if (target) {
    generatedEdges.push(buildPrimaryEdge(type, edge.id.toString(), target));
  }
  return generatedEdges;
};
export const generateEdges = (
  triggers: TAutomationTrigger[],
  actions: TAutomationAction[],
  workFlows: TAutomationWorkflowNode[] = [],
  actionFolks: Record<string, IAutomationsActionFolkConfig[]> = {},
): Edge[] => {
  const generatedEdges: Edge[] = [];

  // Common style & props reused across edges

  // Pre-index workflows for O(1) lookup
  const workflowMap = new Map<string, TAutomationWorkflowNode>(
    workFlows.map((wf) => [wf.id, wf]),
  );
  const folksMap = new Map<string, IAutomationsActionFolkConfig[]>(
    Object.entries(actionFolks),
  );

  // --- Main Loop ---
  for (const { type, edges } of [
    { type: AutomationNodeType.Trigger, edges: triggers },
    { type: AutomationNodeType.Action, edges: actions },
  ]) {
    const targetField = CONNECTION_PROPERTY_NAME_MAP[type];

    for (const edge of edges) {
      generatedEdges.push(
        ...generateEdge(type, edge, targetField, workflowMap, folksMap),
      );
    }
  }

  console.log({ generatedEdges });
  return generatedEdges;
};
