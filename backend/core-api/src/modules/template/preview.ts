import type { TTemplateJourney } from 'erxes-api-shared/core-modules';
import type { TTemplateNodeDetails } from '@/template/registry';

type TPreviewNode = { label: string; icon?: string };

export type TTemplateJourneyPreview = {
  trigger: TPreviewNode;
  hub?: TPreviewNode;
  branches: TPreviewNode[];
};

// A template card has room for three tiles
const MAX_BRANCHES = 3;
const WORKFLOW_ICON = 'IconArrowsSplit';

/**
 * What a template card draws for a journey: its trigger, the step it starts
 * at, and the branches that step leads to (the declared highlights, else the
 * steps right after it). Read from the flow, never drawn by hand.
 */
export const buildJourneyPreview = (
  journey: TTemplateJourney,
  nodes: Map<string, TTemplateNodeDetails>,
): TTemplateJourneyPreview => {
  const steps = new Map(journey.flow.map((step) => [step.order, step]));
  const entry = [...journey.flow].sort((a, b) => a.order - b.order)[0];
  const nodeOf = (order: number): TPreviewNode | null => {
    const step = steps.get(order);

    if (!step) {
      return null;
    }

    const details = nodes.get(step.type);

    return {
      label: step.label || details?.label || step.type,
      icon: step.icon || details?.icon,
    };
  };
  const trigger = nodes.get(journey.trigger.type);

  // A connect names a step by order, or a workflow of the journey by key
  const children: (number | string)[] = entry
    ? [
        ...(typeof entry.next === 'number'
          ? [entry.next]
          : Object.values(entry.next || {})),
        ...Object.values(entry.connects || {}),
      ]
    : [];
  const childOf = (target: number | string): TPreviewNode | null => {
    if (typeof target === 'number') {
      return nodeOf(target);
    }

    const workflow = journey.workflows?.find(({ key }) => key === target);
    return workflow ? { label: workflow.name, icon: WORKFLOW_ICON } : null;
  };

  const branches = journey.highlights?.length
    ? journey.highlights.map(({ order, label, icon }) => ({
        label,
        icon: icon || nodeOf(order)?.icon,
      }))
    : children.flatMap((target) => {
        const node = childOf(target);
        return node ? [node] : [];
      });

  return {
    trigger: {
      label: trigger?.label || journey.trigger.type,
      icon: trigger?.icon,
    },
    hub: entry ? nodeOf(entry.order) || undefined : undefined,
    branches: branches.slice(0, MAX_BRANCHES),
  };
};
