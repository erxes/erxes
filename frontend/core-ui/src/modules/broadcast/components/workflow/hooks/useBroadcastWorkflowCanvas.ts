import { NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { generateEdges } from '@/automations/utils/automationBuilderUtils/generateEdges';
import { generateNodes } from '@/automations/utils/automationBuilderUtils/generateNodes';
import { Edge, Node } from '@xyflow/react';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

const NO_WORKFLOWS: NonNullable<TAutomationBuilderForm['workflows']> = [];
const NO_FOLKS = {};
const NO_NODE_PROPS = {};
const READ_ONLY_NODE_PROPS = { readOnly: true };

/**
 * The flow is laid out by the builder's own helpers — a campaign step and an
 * automation step have the same shape. Only the components drawing them
 * differ, and the canvas decides that.
 */
export const useBroadcastWorkflowCanvas = (readOnly?: boolean) => {
  const [watchedTriggers, watchedActions] = useWatch<TAutomationBuilderForm>({
    name: ['triggers', 'actions'],
  }) as [
    TAutomationBuilderForm['triggers'] | undefined,
    TAutomationBuilderForm['actions'] | undefined,
  ];

  const triggers = useMemo(() => watchedTriggers || [], [watchedTriggers]);
  const actions = useMemo(() => watchedActions || [], [watchedActions]);

  const nodes = useMemo<Node<NodeData>[]>(
    () =>
      generateNodes(
        triggers,
        actions,
        NO_WORKFLOWS,
        readOnly ? READ_ONLY_NODE_PROPS : NO_NODE_PROPS,
        'horizontal',
      ) as Node<NodeData>[],
    [triggers, actions, readOnly],
  );

  const edges = useMemo<Edge[]>(
    () =>
      generateEdges(
        triggers,
        actions,
        NO_WORKFLOWS,
        NO_FOLKS,
        'default',
        'horizontal',
      ),
    [triggers, actions],
  );

  return { nodes, edges };
};
