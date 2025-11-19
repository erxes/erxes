import { IModels } from '@/connectionResolver';
import { debugError } from '@/debugger';
import { isInSegment } from '@/utils/isInSegment';
import { isDiffValue } from '@/utils/utils';
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
  const [pluginName, moduleName, collectionType, relationType] =
    splitType(type);
  console.log({ pluginName, moduleName, collectionType, relationType });

  const response = await sendCoreModuleProducer({
    moduleName: 'automations',
    subdomain,
    pluginName,
    producerName: TAutomationProducers.CHECK_CUSTOM_TRIGGER,
    input: {
      moduleName,
      collectionType,
      relationType,
      automationId,
      trigger,
      target,
      config,
    },
    defaultValue: 'askdjaskdvaksvk',
  }).catch((e) =>
    debugError(`An error occurred while check trigger: ${e.message}`),
  );

  console.log({ response });
  return response || false;
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

    return isValidCustomTigger;
  } else if (!(await isInSegment(subdomain, contentId, target._id))) {
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
    console.log({ isValidTrigger });
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
