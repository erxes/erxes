import * as schedule from 'node-schedule';
import { getBulkResult, getStatus } from '../apiPhoneVerifier';
import { getProgressStatus, getResult } from '../api';
import { debugCrons, getArray, setArray } from '../utils';

schedule.scheduleJob('1 * * * * *', async () => {
  const listIds = await getArray('erxes_phone_verifier_list_ids');

  if (listIds.length === 0) {
    return;
  }

  for (const { listId, hostname } of listIds) {
    debugCrons(`Getting validation progress status with list_id: ${listId}`);

    const { status, data }: any = await getStatus(listId);

    if (status === 'success' && data.progress_status === 'completed') {
      await getBulkResult(listId, hostname).catch((e) => {
        debugCrons(`Failed to get phone list. Error: ${e.message}`);
      });
      debugCrons(`Process is finished with list_id: ${listId}`);
      const unfinished = listIds.filter((item) => item.listId !== listId);

      await setArray('erxes_phone_verifier_list_ids', unfinished);
    }
  }
});

schedule.scheduleJob('2 * * * * *', async () => {
  const listIds = await getArray('erxes_email_verifier_list_ids');

  if (listIds.length === 0) {
    return;
  }

  for (const { listId, hostname } of listIds) {
    const { status, data }: any = await getProgressStatus(listId);

    if (status === 'success' && data.progress_status === 'completed') {
      await getResult(listId, hostname).catch((e) => {
        debugCrons(`Failed to get email list. Error: ${e.message}`);
      });

      const unfinished = listIds.filter((item) => item.listId !== listId);

      await setArray('erxes_email_verifier_list_ids', unfinished);
    }
  }
});
