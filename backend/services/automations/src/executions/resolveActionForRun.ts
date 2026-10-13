import {
  applyAutomationConditionals,
  AUTOMATION_CONDITIONALS_KEY,
  AUTOMATION_ERROR_CODES,
  IAutomationAction,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { isInSegment } from '../utils/isInSegment';
import { AutomationActionError } from './errorCodes';

// Resumed runs read the automation as a Mongoose document, and spreading one
// copies its internals instead of its fields (type and id go missing)
const toPlainAction = (action: IAutomationAction): IAutomationAction => {
  const document = action as IAutomationAction & {
    toObject?: () => IAutomationAction;
  };

  return typeof document.toObject === 'function' ? document.toObject() : action;
};

// Most actions have no conditionals; they pass through exactly as stored
const hasConditionals = (config: unknown) =>
  !!config &&
  typeof config === 'object' &&
  (AUTOMATION_CONDITIONALS_KEY in config ||
    JSON.stringify(config).includes('<<'));

/**
 * Every action receives a config with its conditional values already decided,
 * so neither core actions nor plugins need to know conditionals exist.
 */
export const resolveActionForRun = async ({
  subdomain,
  execution,
  action,
}: {
  subdomain: string;
  execution: IAutomationExecutionDocument;
  action: IAutomationAction;
}) => {
  if (!hasConditionals(action.config)) {
    return { action, conditionalMatches: undefined };
  }

  const plainAction = toPlainAction(action);
  const { config, matches, missing } = await applyAutomationConditionals({
    subdomain,
    execution,
    config: plainAction.config,
    isInSegment: (segmentId) =>
      isInSegment(subdomain, segmentId, execution.targetId, 0),
  });

  if (missing.length) {
    throw new AutomationActionError(
      `Conditional value is missing its rules: ${missing.join(', ')}`,
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  return {
    action: { ...plainAction, config },
    conditionalMatches: Object.keys(matches).length ? matches : undefined,
  };
};
