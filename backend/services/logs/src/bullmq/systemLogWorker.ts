import { ILogDocument } from 'erxes-api-shared/core-types';
import { checkServiceRunning, sendWorkerQueue } from 'erxes-api-shared/utils';
import { handleNotifications } from '~/bullmq/notifications';
import { generateModels } from '~/connectionResolvers';
import { AFTER_PROCESS_CONSTANTS, LOG_STATUSES } from '~/constants';
import { IJobData } from '~/types';
import { handleAfterProcess } from './afterProcess';
import { handleMongoChangeEvent } from './mongo';
import type { Job } from 'bullmq';

export const systemLogWorker = async ({ id, data }: Job<any>) => {
  const {
    subdomain,
    source,
    payload,
    contentType,
    userId,
    action,
    status,
    processId,
    user,
  } = (data ?? {}) as IJobData;

  try {
    const models = await generateModels(subdomain);

    let result: ILogDocument;

    if (source === 'mongo') {
      result = await handleMongoChangeEvent(models.Logs, payload, {
        processId,
        user,
        contentType,
      });

      if (contentType && (await checkServiceRunning('automations'))) {
        sendWorkerQueue('automations', 'trigger').add('trigger', {
          subdomain,
          data: { type: contentType, targets: [payload?.fullDocument] },
        });
      }
    } else {
      const logDoc = {
        source,
        action,
        payload,
        createdAt: new Date(),
        userId,
        status,
        processId,
      };
      result = await models.Logs.insertOne(logDoc);
    }

    if (status === 'success') {
      handleAfterProcess(subdomain, {
        source,
        action: result.action || action,
        contentType,
        payload: { ...result?.payload, userId, processId },
      }).catch((err) => {
        models.Logs.insertOne({
          source: 'afterProcess',
          action: AFTER_PROCESS_CONSTANTS[`${source}.${action}`],
          payload: { ...result?.payload, userId },
          createdAt: new Date(),
          userId,
          status: LOG_STATUSES.FAILED,
          processId,
        });
        console.error(
          `Error occured during afterProcess job ${id}: ${err.message}`,
        );
      });
      handleNotifications({ subdomain, models, logDoc: result });
    }
  } catch (error: any) {
    console.error(`Error processing job ${id}: ${error.message}`);
    throw error;
  }
};
