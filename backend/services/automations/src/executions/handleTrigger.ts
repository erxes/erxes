import { generateModels } from '../connectionResolver';
import { debugError } from '../debugger';
import { repeatActionExecution } from './repeatActionExecution';
import { checkIsWaitingAction } from './checkIsWaitingActionTarget';
import { executeWaitingAction } from './executeWaitingAction';
import { receiveTrigger } from './receiveTrigger';

type TriggerHandlerInput = {
  type: string;
  targets: any;
  repeatOptions?: any;
  recordType?: string;
  eventUpdateDescription?: Record<string, any>;
};

export const handleTrigger = async (
  subdomain: string,
  input: TriggerHandlerInput,
) => {
  const models = await generateModels(subdomain);

  const { type, targets, repeatOptions, recordType, eventUpdateDescription } =
    input;

  // A button/postback resume must not RE-trigger the automation it resumed
  // (the agent would misread the button label as user text) — but the same
  // event stays a valid trigger for every OTHER automation.
  const excludeAutomationIds: string[] = [];

  if (repeatOptions) {
    try {
      const resumedAutomationId = await repeatActionExecution(
        subdomain,
        models,
        repeatOptions,
      );

      if (resumedAutomationId) {
        excludeAutomationIds.push(resumedAutomationId);
      }
    } catch (error: any) {
      debugError(
        `Failed to repeat execution ${repeatOptions.executionId}: ${error.message}`,
      );
    }
  } else {
    const waitingAction = await checkIsWaitingAction(
      subdomain,
      models,
      type,
      targets,
    );

    console.log({ waitingAction });

    if (waitingAction) {
      // A broken wait must not block fresh trigger processing below
      try {
        await executeWaitingAction(subdomain, models, waitingAction);
      } catch (error: any) {
        debugError(
          `Failed to execute waiting action ${waitingAction._id}: ${error.message}`,
        );
      }
    }
  }

  await receiveTrigger({
    models,
    subdomain,
    type,
    targets,
    recordType,
    eventUpdateDescription,
    excludeAutomationIds,
  });

  return 'success';
};
