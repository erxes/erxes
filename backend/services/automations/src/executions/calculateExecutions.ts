import {
  AUTOMATION_EXECUTION_STATUS,
  IAutomationExecutionDocument,
  ITrigger,
  splitType,
} from 'erxes-api-shared/core-modules';
import { sendWorkerMessage } from 'erxes-api-shared/utils';
import { IModels } from '@/connectionResolver';
import { isInSegment } from '@/utils/segments/utils';

export const calculateExecution = async ({
  models,
  subdomain,
  automationId,
  trigger,
  target,
}: {
  models: IModels;
  subdomain: string;
  automationId: string;
  trigger: ITrigger;
  target: any;
}): Promise<IAutomationExecutionDocument | null | undefined> => {
  const { id, type, config, isCustom } = trigger;
  const { reEnrollment, reEnrollmentRules, contentId } = config || {};

  try {
    if (!!isCustom) {
      const [pluginName, moduleName, collectionType] = splitType(
        trigger?.type || '',
      );

      const isValid = await sendWorkerMessage({
        subdomain,
        pluginName,
        queueName: 'automations',
        jobName: 'checkCustomTrigger',
        data: {
          moduleName,
          collectionType,
          automationId,
          trigger,
          target,
          config,
        },
        defaultValue: false,
      });
      if (!isValid) {
        return;
      }
    } else if (!(await isInSegment(contentId, target._id))) {
      return;
    }
  } catch (e) {
    await models.Executions.create({
      automationId,
      triggerId: id,
      triggerType: type,
      triggerConfig: config,
      targetId: target._id,
      target,
      status: AUTOMATION_EXECUTION_STATUS.ERROR,
      description: `An error occurred while checking the is in segment: "${e.message}"`,
      createdAt: new Date(),
    });
    return;
  }

  const executions = await models.Executions.find({
    automationId,
    triggerId: id,
    targetId: target._id,
    status: { $ne: AUTOMATION_EXECUTION_STATUS.ERROR },
  })
    .sort({ createdAt: -1 })
    .limit(1)
    .lean();

  const latestExecution: IAutomationExecutionDocument | null = executions.length
    ? executions[0]
    : null;

  // if (latestExecution) {
  //   if (!reEnrollment || !reEnrollmentRules.length) {
  //     return;
  //   }

  //   let isChanged = false;

  //   for (const reEnrollmentRule of reEnrollmentRules) {
  //     if (isDiffValue(latestExecution.target, target, reEnrollmentRule)) {
  //       isChanged = true;
  //       break;
  //     }
  //   }

  //   if (!isChanged) {
  //     return;
  //   }
  // }

  return models.Executions.create({
    automationId,
    triggerId: id,
    triggerType: type,
    triggerConfig: config,
    targetId: target._id,
    target,
    status: AUTOMATION_EXECUTION_STATUS.ACTIVE,
    description: `Met enrollment criteria`,
    createdAt: new Date(),
  });
};
