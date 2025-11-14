import { ILogDocument } from 'erxes-api-shared/core-types';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { handleNotifications } from '~/bullmq/notifications';
import { generateModels } from '~/connectionResolvers';
import { AFTER_PROCESS_CONSTANTS, LOG_STATUSES } from '~/constants';
import { IJobData } from '~/types';
import { handleAfterProcess } from './afterProcess';
import { sendAutomationTrigger } from './automation';
import { handleMongoChangeEvent } from './mongo';

export const initMQWorkers = async (redis: any) => {
  console.info('Starting worker log ...');

  console.info('Initialized databases');
  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        'logs',
        'put_log',
        async ({ id, data }) => {
          const {
            subdomain,
            source,
            payload,
            contentType,
            userId,
            action,
            status,
            processId,
          } = (data ?? {}) as IJobData;

          try {
            const models = await generateModels(subdomain);

            let result: ILogDocument;

            if (source === 'mongo') {
              result = await handleMongoChangeEvent(
                models.Logs,
                payload,
                contentType,
              );

              if (contentType) {
                sendAutomationTrigger(subdomain, payload, contentType);
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
        },
        redis,
        () => {
          resolve();
        },
      );
    } catch (error) {
      reject(error);
    }
  });
};
