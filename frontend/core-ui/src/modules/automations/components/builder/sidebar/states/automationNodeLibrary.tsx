import { AutomationNodeType } from '@/automations/types';
import { automationNodePositionSchema } from '@/automations/utils/automationFormDefinitions';
import { z } from 'zod';

const dragginWorkflowNode = z.object({
  nodeType: z.literal(AutomationNodeType.Workflow),
  automationId: z.string(),
  name: z.string(),
  description: z.string(),
});

const draggingCommonNode = z.object({
  nodeType: z.union([
    z.literal(AutomationNodeType.Trigger),
    z.literal(AutomationNodeType.Action),
  ]),
  type: z.string(),
  label: z.string(),
  description: z.string(),
  icon: z.string(),
  isCustom: z.boolean().optional(),
});

const dragginNodeProps = z.discriminatedUnion('nodeType', [
  dragginWorkflowNode,
  draggingCommonNode,
]);

const droppedNodeProps = z.intersection(
  dragginNodeProps,
  z.object({
    nodeType: z.nativeEnum(AutomationNodeType),
    awaitingToConnectNodeId: z.string().optional(),
  }),
  z.object({
    nodeType: z.literal(AutomationNodeType.Workflow),
    automationId: z.string(),
    position: automationNodePositionSchema,
  }),
);

export type TDroppedNode = z.infer<typeof droppedNodeProps>;
export type TDraggingNode = z.infer<typeof dragginNodeProps>;
