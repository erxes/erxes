import { toast } from 'erxes-ui';
import { TAutomationAction, TAutomationTrigger } from 'ui-modules';

export const findTriggerForAction = (
  currentActionId: string,
  actions: TAutomationAction[],
  triggers: TAutomationTrigger[],
): TAutomationTrigger | undefined => {
  const trigger = triggers.find((t) => t.actionId === currentActionId);
  if (trigger) {
    return trigger;
  }

  // Find the parent action that leads to this current action
  const parentAction = actions.find((a) => a.nextActionId === currentActionId);
  if (parentAction) {
    // Recursively call the function with the parent action
    return findTriggerForAction(parentAction.id, actions, triggers);
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
  actions: TAutomationAction[],
  triggers: TAutomationTrigger[],
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
    if (trigger) return trigger;

    cursor = reverseMap.get(cursor) ?? '';
  }

  return undefined;
};

export interface ReachableTrigger {
  trigger: TAutomationTrigger;
  distance: number;
}

/**
 * Collect all reachable triggers for a given action by exploring all parents.
 * Results are unique by trigger.actionId and sorted by increasing distance.
 */
export const getAllTriggersForAction = (
  currentActionId: string,
  actions: TAutomationAction[],
  triggers: TAutomationTrigger[],
): ReachableTrigger[] => {
  const reverseAdjacency = new Map<string, string[]>();

  for (const { id, nextActionId } of actions) {
    if (!nextActionId) continue;
    const parents = reverseAdjacency.get(nextActionId) ?? [];
    parents.push(id);
    reverseAdjacency.set(nextActionId, parents);
  }

  const visited = new Set<string>();
  const queue: Array<{ id: string; distance: number }> = [
    { id: currentActionId, distance: 0 },
  ];
  const results = new Map<string, ReachableTrigger>();

  while (queue.length) {
    const { id, distance } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const foundList = triggers.filter((t) => t.actionId === id);
    for (const trig of foundList) {
      if (trig.id && !results.has(trig.id)) {
        results.set(trig.id, { trigger: trig, distance });
      }
    }

    const parents = reverseAdjacency.get(id) ?? [];
    for (const parentId of parents) {
      if (!visited.has(parentId))
        queue.push({ id: parentId, distance: distance + 1 });
    }
  }

  return Array.from(results.values()).sort((a, b) => a.distance - b.distance);
};

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

export const copyText = async (token: string) => {
  await navigator.clipboard
    .writeText(token)
    .then(() => {
      toast({ title: 'Copied successfully' });
    })
    .catch((error) => {
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    });
};
