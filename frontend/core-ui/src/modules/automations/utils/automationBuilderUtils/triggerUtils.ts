import { toast } from 'erxes-ui';
import { TAutomationAction, TAutomationTrigger } from 'ui-modules';

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
  if (!currentActionId) {
    return undefined;
  }
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
