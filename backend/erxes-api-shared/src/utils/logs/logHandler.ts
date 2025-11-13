import { ILogDoc } from '../../core-types';
import { sendWorkerQueue } from '../mq-worker';
import { checkServiceRunning } from '../utils';

export const logHandler = async (
  resolver: () => Promise<any> | any,
  logDoc: ILogDoc,
  onSuccess?: any,
  onError?: any,
  skipSaveResult?: boolean,
) => {
  if (!(await checkServiceRunning('logs'))) {
    return await resolver();
  }

  const payload = { ...(logDoc?.payload || {}) };
  const startDate = new Date();
  const startTime = performance.now();
  try {
    const result = await resolver();

    const endTime = performance.now();
    const durationMs = endTime - startTime;
    logDoc.payload = { ...payload, ...onSuccess, result };
    if (!skipSaveResult) {
      logDoc.payload.result = result;
    }
    logDoc.executionTime = {
      startDate,
      endDate: new Date(),
      durationMs: durationMs,
    };
    logDoc.status = 'success';
    sendWorkerQueue('logs', 'put_log').add('put_log', logDoc);

    return result;
  } catch (error) {
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack available',
      name: error.name || 'Error',
    };

    logDoc.payload = { ...payload, ...onError, error: errorDetails };
    logDoc.status = 'failed';
    sendWorkerQueue('logs', 'put_log').add('put_log', logDoc);

    throw error;
  }
};