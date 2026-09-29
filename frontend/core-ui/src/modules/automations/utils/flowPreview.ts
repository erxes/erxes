import { TAutomationAction, TAutomationTrigger } from 'ui-modules';

export type TFlowPreviewNode = {
  id: string;
  kind: 'trigger' | 'action';
  type: string;
  label: string;
  icon?: string;
};

export type TFlowPreview = {
  rows: TFlowPreviewNode[][];
  remainingCount: number;
};

// One row per trigger, so a multi-trigger automation reads as parallel entry
// points instead of a single misleading chain.
const MAX_ROWS = 2;
const SINGLE_TRIGGER_ROW_LENGTH = 3;
const MULTI_TRIGGER_ROW_LENGTH = 2;

const toPreviewNode = (
  node: TAutomationTrigger | TAutomationAction,
  kind: TFlowPreviewNode['kind'],
): TFlowPreviewNode => ({
  id: node.id,
  kind,
  type: node.type,
  label: node.label,
  icon: node.icon,
});

/** The action nothing else points at, so a trigger-less flow still has a head. */
const findEntryAction = (actions: TAutomationAction[]) => {
  const targetedIds = new Set(
    actions.map(({ nextActionId }) => nextActionId).filter(Boolean),
  );

  return actions.find(({ id }) => !targetedIds.has(id)) || actions[0];
};

export const buildFlowPreview = (
  triggers: TAutomationTrigger[] = [],
  actions: TAutomationAction[] = [],
  // Workflow templates carry an explicit head instead of a trigger.
  entryActionId?: string,
): TFlowPreview => {
  const actionById = new Map(actions.map((action) => [action.id, action]));
  const totalCount = triggers.length + actions.length;

  // The length cap also bounds a self-referencing or cyclic nextActionId.
  const followChain = (startId: string | undefined, length: number) => {
    const chain: TFlowPreviewNode[] = [];
    let current = startId ? actionById.get(startId) : undefined;

    while (current && chain.length < length) {
      chain.push(toPreviewNode(current, 'action'));
      current = current.nextActionId
        ? actionById.get(current.nextActionId)
        : undefined;
    }

    return chain;
  };

  if (!triggers.length) {
    const entryAction =
      (entryActionId && actionById.get(entryActionId)) ||
      (actions.length ? findEntryAction(actions) : undefined);
    const chain = entryAction
      ? followChain(entryAction.id, SINGLE_TRIGGER_ROW_LENGTH)
      : [];

    return {
      rows: chain.length ? [chain] : [],
      remainingCount: Math.max(totalCount - chain.length, 0),
    };
  }

  const rowLength =
    triggers.length === 1
      ? SINGLE_TRIGGER_ROW_LENGTH - 1
      : MULTI_TRIGGER_ROW_LENGTH - 1;

  const rows = triggers
    .slice(0, MAX_ROWS)
    .map((trigger) => [
      toPreviewNode(trigger, 'trigger'),
      ...followChain(trigger.actionId, rowLength),
    ]);

  const shownCount = rows.reduce((sum, row) => sum + row.length, 0);

  return { rows, remainingCount: Math.max(totalCount - shownCount, 0) };
};
