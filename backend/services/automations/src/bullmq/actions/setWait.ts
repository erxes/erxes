import type { Job } from 'bullmq';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import moment from 'moment';
import { IModels } from '@/connectionResolver';
import { AutomationExecutionSetWaitCondition } from 'erxes-api-shared/core-modules';

export const setActionWaitHandler = async (
  models: IModels,
  job: Job<{
    executionId: string;
    currentActionId: string;
    responseActionId: string;
    automationId: string;
    condition: AutomationExecutionSetWaitCondition;
  }>,
) => {
  await setExecutionWaitAction(models, job.data);
};

export const setExecutionWaitAction = async (
  models: IModels,
  data: {
    executionId: string;
    currentActionId: string;
    responseActionId?: string;
    automationId: string;
    condition: AutomationExecutionSetWaitCondition;
  },
) => {
  const {
    automationId,
    executionId,
    currentActionId,
    responseActionId,
    condition,
  } = data;

  if (condition.type === 'delay') {
    const { subdomain, startWaitingDate, waitFor, timeUnit } = condition;

    if (!subdomain) {
      throw new Error('Not found subdomain for delay action');
    }

    if (!timeUnit) {
      throw new Error('Not found timeUnit  for delay action');
    }

    if (!waitFor) {
      throw new Error(`Not found waitFor in ${timeUnit} for delay action`);
    }

    const performDate = moment(startWaitingDate)
      .add(waitFor, timeUnit)
      .toDate();

    // Calculate delay in milliseconds

    const delay = Math.max(0, performDate.getTime() - Date.now());

    sendWorkerQueue('automations', 'action').add(
      'play',
      {
        subdomain,
        data: {
          automationId,
          waitingActionId: currentActionId,
          execId: executionId,
        },
      },
      {
        delay: delay,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    return;
  }

  if (condition.type === 'isInSegment') {
    const { targetId, segmentId } = condition;

    await models.WaitingActions.create({
      automationId,
      executionId,
      currentActionId,
      responseActionId,
      conditionType: 'isInSegment',
      conditionConfig: {
        targetId,
        segmentId,
      },
    });

    return;
  }

  if (condition.type === 'checkObject') {
    const {
      propertyName,
      expectedState,
      expectedStateConjunction = 'every',
      contentType,
      shouldCheckOptionalConnect,
      targetId,
    } = condition;

    if (shouldCheckOptionalConnect && !propertyName) {
      throw new Error(
        `You should provide propertyName when for check from optional connections for check field name from target `,
      );
    }

    if (!expectedState) {
      throw new Error(
        'You should provide expectedState for check when target reach',
      );
    }

    if (!contentType) {
      throw new Error(
        'You should provide contentType for check when target reach',
      );
    }

    await models.WaitingActions.create({
      automationId,
      executionId,
      currentActionId,
      responseActionId,
      conditionType: 'checkObject',
      conditionConfig: {
        propertyName,
        expectedState,
        expectedStateConjunction,
        contentType,
        shouldCheckOptionalConnect,
        targetId,
      },
    });

    return;
  }
};
