import { ILogDocument } from 'erxes-api-shared/core-types';
import { generateModels } from '~/connectionResolvers';
import { IJobData } from '~/types';
import { handleMongoChangeEvent } from '../mongo';
import { handleAfterProcess } from '../afterProcess';
import { AFTER_PROCESS_CONSTANTS } from '~/constants';
import { LOG_STATUSES } from 'erxes-api-shared/utils';

export const eventLogHandler = async (
  jobId: string | undefined,
  data: IJobData,
) => {
  const {
    subdomain,
    source,
    payload,
    contentType,
    userId,
    action,
    status,
    processId,
  } = data ?? {};

  try {
    const models = await generateModels(subdomain);

    let result: ILogDocument | ILogDocument[];

    if (source === 'mongo') {
      result = await handleMongoChangeEvent(models.Logs, data);
    } else {
      const logDoc = {
        source,
        action,
        payload,
        createdAt: new Date(),
        userId,
        status,
        processId,
        contentType,
      };
      result = await models.Logs.insertOne(logDoc);
    }

    if (status === LOG_STATUSES.SUCCESS) {
      const resultDoc = Array.isArray(result) ? result[0] : result;
    
      await handleAfterProcess(subdomain, {
        source,
        action: resultDoc?.action || action,
        contentType,
        payload: { ...payload, userId, processId },
      }).catch(async (err) => {
        try {
          await models.Logs.insertOne({
            source: 'afterProcess',
            action: AFTER_PROCESS_CONSTANTS[`${source}.${action}`],
            payload: { ...resultDoc?.payload, userId },
            createdAt: new Date(),
            userId,
            status: LOG_STATUSES.FAILED,
            processId,
          });
        } catch (insertErr) {
          console.error(
            `Failed to persist afterProcess failure log: ${
              insertErr instanceof Error
                ? insertErr.message
                : String(insertErr)
            }`,
          );
        }
    
        console.error(
          `Error occurred during afterProcess job ${jobId}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      });
    }
  } catch (error: any) {
    console.error(`Error processing job ${jobId}: ${error.message}`);
    throw error;
  }
};
