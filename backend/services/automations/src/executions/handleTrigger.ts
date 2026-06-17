import { generateModels } from '../connectionResolver';
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

  if (repeatOptions) {
    await repeatActionExecution(subdomain, models, repeatOptions);
  } else {
    const waitingAction = await checkIsWaitingAction(
      subdomain,
      models,
      type,
      targets,
    );

    if (waitingAction) {
      await executeWaitingAction(subdomain, models, waitingAction);
    }
  }

  await receiveTrigger({
    models,
    subdomain,
    type,
    targets,
    recordType,
    eventUpdateDescription,
  });

  return 'success';
};
