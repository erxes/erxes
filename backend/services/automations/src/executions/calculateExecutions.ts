import { IModels } from '../connectionResolver';
import { debugError } from '../debugger';
import { resolveAutomationErrorCode } from './errorCodes';
import { isInSegment } from '../utils/isInSegment';
import { isDiffValue } from '../utils/utils';
import {
  AUTOMATION_EXECUTION_STATUS,
  IAutomationDocument,
  IAutomationExecutionDocument,
  IAutomationTrigger,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { TCreatedVia } from 'erxes-api-shared/core-types';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

const checkIsValidCustomTigger = async (
  type: string,
  subdomain: string,
  automationId: string,
  trigger: IAutomationTrigger,
  target: any,
  config: any,
  eventUpdateDescription?: Record<string, any>,
) => {
  const [pluginName, moduleName, collectionType, relationType] =
    splitType(type);
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
      eventUpdateDescription,
    },
    defaultValue: false,
  }).catch((e) =>
    debugError(`An error occurred while check trigger: ${e.message}`),
  );

  return response;
};

const checkValidTrigger = async (
  trigger: IAutomationTrigger,
  target: any,
  subdomain: string,
  automationId: string,
  eventUpdateDescription?: Record<string, any>,
) => {
  const { type = '', config, isCustom } = trigger;
  const { contentId } = config || {};
  if (Boolean(isCustom)) {
    const isValidCustomTigger = await checkIsValidCustomTigger(
      type,
      subdomain,
      automationId,
      trigger,
      target,
      config,
      eventUpdateDescription,
    );

    return isValidCustomTigger;
  } else if (!(await isInSegment(subdomain, contentId, target._id))) {
    return false;
  }

  return true;
};

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export const buildExecutionTarget = (
  target: any,
  eventUpdateDescription?: Record<string, any>,
) => {
  const updated = eventUpdateDescription?.updated || {};
  const eventFields = Object.entries(updated).reduce(
    (acc, [field, change]: [string, any]) => {
      if (!change || typeof change !== 'object') {
        return acc;
      }

      const fieldName = capitalize(field);

      return {
        ...acc,
        [`previous${fieldName}`]: change.prev,
        [`current${fieldName}`]: change.current,
      };
    },
    {} as Record<string, any>,
  );

  return {
    ...target,
    ...eventFields,
    eventUpdateDescription,
  };
};

/**
 * What produced this run, and on whose behalf. An event started it, so there
 * is no person in the moment — the automation answers for it through its
 * owner. `runId` is left out: the execution is the run, and filling it would
 * cost a second write on the enrolment path for an id nothing reads back.
 */
const buildTriggeredVia = (automation: IAutomationDocument): TCreatedVia => ({
  source: 'automation',
  sourceId: automation._id,
  sourceName: automation.name,
  actorId: automation.ownerId || automation.createdBy,
});

export const calculateExecution = async ({
  models,
  subdomain,
  automation,
  trigger,
  target,
  eventUpdateDescription,
}: {
  models: IModels;
  subdomain: string;
  automation: IAutomationDocument;
  trigger: IAutomationTrigger;
  target: any;
  eventUpdateDescription?: Record<string, any>;
}): Promise<IAutomationExecutionDocument | null | undefined> => {
  const automationId = automation._id;
  const { id, type = '', config } = trigger;
  const { reEnrollment, reEnrollmentRules = [] } = config || {};
  const executionTarget = buildExecutionTarget(target, eventUpdateDescription);

  try {
    const isValidTrigger = await checkValidTrigger(
      trigger,
      executionTarget,
      subdomain,
      automationId,
      eventUpdateDescription,
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
      targetId: executionTarget._id,
      target: executionTarget,
      status: AUTOMATION_EXECUTION_STATUS.ERROR,
      description: `An error occurred while checking the is in segment: "${e.message}"`,
      errorCode: resolveAutomationErrorCode(e),
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
      if (
        isDiffValue(latestExecution.target, executionTarget, reEnrollmentRule)
      ) {
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
    targetId: executionTarget._id,
    target: executionTarget,
    status: AUTOMATION_EXECUTION_STATUS.ACTIVE,
    description: `Met enrollment criteria`,
    createdVia: buildTriggeredVia(automation),
    createdAt: new Date(),
  });
};
