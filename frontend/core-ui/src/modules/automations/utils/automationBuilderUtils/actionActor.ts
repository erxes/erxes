import {
  IAutomationsActionConfigConstants,
  TAutomationAction,
} from 'ui-modules';

/**
 * Whether anything in this flow creates records that belong to someone. Only
 * then is it worth saying whose name the run will carry — a flow that only
 * calls a webhook owns nothing.
 */
export const flowNeedsActor = (
  actions: TAutomationAction[] = [],
  actionConstMap: Map<string, IAutomationsActionConfigConstants>,
) => actions.some((action) => !!actionConstMap.get(action.type)?.requiresActor);
