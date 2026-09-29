import { IAutomationsActionConfigConstants } from 'ui-modules';

/**
 * An action that declares no `requiresTargetTypes` is target-agnostic, so it
 * stays available everywhere. One that declares them runs only where the
 * supplied target is of a matching type.
 *
 * Target types are named with the same identifiers as trigger types, so an
 * automation's triggers are what it supplies.
 */
export const isActionAvailableForTargets = (
  action: Pick<IAutomationsActionConfigConstants, 'requiresTargetTypes'>,
  suppliedTargetTypes: string[],
) => {
  const required = action.requiresTargetTypes || [];

  if (!required.length) {
    return true;
  }

  // Nothing supplies a target yet (no trigger picked): don't hide anything,
  // or the library would look broken before the automation has a start.
  if (!suppliedTargetTypes.length) {
    return true;
  }

  return suppliedTargetTypes.some((type) => required.includes(type));
};

export const filterActionsForTargets = (
  actions: IAutomationsActionConfigConstants[],
  suppliedTargetTypes: string[],
) =>
  actions.filter((action) =>
    isActionAvailableForTargets(action, suppliedTargetTypes),
  );
