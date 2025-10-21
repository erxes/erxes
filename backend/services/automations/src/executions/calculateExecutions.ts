import { IModels } from '@/connectionResolver';
import { isDiffValue } from '@/utils';
import { isInSegment } from '@/utils/isInSegment';
import {
  AUTOMATION_EXECUTION_STATUS,
  IAutomationExecutionDocument,
  IAutomationTrigger,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

const checkIsValidCustomTigger = async (
  type: string,
  subdomain: string,
  automationId: string,
  trigger: IAutomationTrigger,
  target: any,
  config: any,
) => {
  const [pluginName, moduleName, collectionType] = splitType(type);

  return await sendCoreModuleProducer({
    moduleName: 'automations',
    pluginName,
    producerName: TAutomationProducers.CHECK_CUSTOM_TRIGGER,
    input: {
      moduleName,
      collectionType,
      automationId,
      trigger,
      target,
      config,
    },
    defaultValue: false,
  });
};

const checkValidTrigger = async (
  trigger: IAutomationTrigger,
  target: any,
  subdomain: string,
  automationId: string,
) => {
  const { type = '', config, isCustom } = trigger;
  const { contentId } = config || {};
  if (!!isCustom) {
    const isValidCustomTigger = await checkIsValidCustomTigger(
      type,
      subdomain,
      automationId,
      trigger,
      target,
      config,
    );
    if (!isValidCustomTigger) {
      return false;
    }
  } else if (!(await isInSegment(contentId, target._id))) {
    return false;
  }

  return true;
};

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
  trigger: IAutomationTrigger;
  target: any;
}): Promise<IAutomationExecutionDocument | null | undefined> => {
  const { id, type = '', config } = trigger;
  const { reEnrollment, reEnrollmentRules } = config || {};

  try {
    const isValidTrigger = await checkValidTrigger(
      trigger,
      target,
      subdomain,
      automationId,
    );
    if (!isValidTrigger) {
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

  const latestExecution = await models.Executions.findOne({
    automationId,
    triggerId: id,
    targetId: target._id,
    status: { $ne: AUTOMATION_EXECUTION_STATUS.ERROR },
  })
    .sort({ createdAt: -1 })
    .limit(1)
    .lean();

  if (latestExecution) {
    if (!reEnrollment || !reEnrollmentRules.length) {
      return;
    }

    let isChanged = false;

    for (const reEnrollmentRule of reEnrollmentRules) {
      if (isDiffValue(latestExecution.target, target, reEnrollmentRule)) {
        isChanged = true;
        break;
      }
    }

    if (!isChanged) {
      return;
    }
  }

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
