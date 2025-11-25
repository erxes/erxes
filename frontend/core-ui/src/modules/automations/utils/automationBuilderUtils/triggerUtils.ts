import { toast } from 'erxes-ui';
import {
  IAutomationsActionFolkConfig,
  TAutomationAction,
  TAutomationTrigger,
} from 'ui-modules';

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
  actionFolks: Record<string, IAutomationsActionFolkConfig[]>,
) => {
  if (!currentActionId) {
    return undefined;
  }

  // Create a set of all valid action IDs for validation
  const actionIdSet = new Set(actions.map((a) => a.id));

  // Build a map of actionId → parent actionIds (multiple parents possible)
  const reverseMap = new Map<string, string[]>();

  for (const { id, nextActionId, type, config } of actions) {
    // Handle folks connections
    const folks = (actionFolks || {})[type] || [];
    for (const folk of folks) {
      const folkActionId = (config || {})[folk.key];
      // Validate that folkActionId is actually a valid action ID
      if (folkActionId && actionIdSet.has(folkActionId)) {
        const parents = reverseMap.get(folkActionId) || [];
        if (!parents.includes(id)) {
          reverseMap.set(folkActionId, [...parents, id]);
        }
      }
    }

    // Handle optionalConnects
    if (config?.optionalConnects?.length) {
      for (const connect of config.optionalConnects) {
        if (connect.actionId && actionIdSet.has(connect.actionId)) {
          const parents = reverseMap.get(connect.actionId) || [];
          if (!parents.includes(id)) {
            reverseMap.set(connect.actionId, [...parents, id]);
          }
        }
      }
    }

    // Handle nextActionId (main flow)
    if (nextActionId && actionIdSet.has(nextActionId)) {
      const parents = reverseMap.get(nextActionId) || [];
      if (!parents.includes(id)) {
        reverseMap.set(nextActionId, [...parents, id]);
      }
    }
  }

  // Use BFS to walk backward through all possible paths
  const visited = new Set<string>();
  const queue: string[] = [currentActionId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    // Check if current node is a trigger
    const trigger = triggers.find((t) => t.actionId === currentId);
    if (trigger) {
      return trigger;
    }

    // Add all parent actions to the queue
    const parents = reverseMap.get(currentId) || [];
    for (const parentId of parents) {
      if (!visited.has(parentId)) {
        queue.push(parentId);
      }
    }
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
      toast({ title: 'Copied successfully', variant: 'success' });
    })
    .catch((error) => {
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    });
};
