import * as schedule from 'node-schedule';
import { getBulkResult, getStatus } from '../apiPhoneVerifier';
import { Emails } from '../models';
import {
  debugBase,
  debugCrons,
  getArray,
  getEnv,
  sendRequest,
  setArray
} from '../utils';
import fetch = require('node-fetch');

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

  // CLEAROU.IO
  // for (const { listId, hostname } of listIds) {
  //   const { status, data }: any = await getProgressStatus(listId);

  //   if (status === 'success' && data.progress_status === 'completed') {
  //     await getResult(listId, hostname).catch((e) => {
  //       debugCrons(`Failed to get email list. Error: ${e.message}`);
  //     });

  //     const unfinished = listIds.filter((item) => item.listId !== listId);

  //     await setArray('erxes_email_verifier_list_ids', unfinished);
  //   }
  // }

  // MAILS.SO

  // https://api.mails.so/v1/batch/${id}
  const MAILS_SO_KEY = getEnv({ name: 'MAILS_SO_KEY' });
  for (const { listId, hostname } of listIds) {
    const response = await fetch(`https://api.mails.so/v1/batch/${listId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-mails-api-key': MAILS_SO_KEY,
      },
    });

    const res = await response.json();

    if (!res.finished_at) {
      continue;
    }

    const emails = [];

    for (const e of res.emails) {
      let status = 'unknown';
      if (e.result === 'deliverable') {
        status = 'valid';
      } else if (e.result === 'unknown') {
        status = 'unknown';
      } else {
        status = 'invalid';
      }

      emails.push({ email: e.email, status });
      await Emails.createEmail({ email: e.email, status });
    }

    const unfinished = listIds.filter((item) => item.listId !== listId);

    await setArray('erxes_email_verifier_list_ids', unfinished);

    debugBase(`Sending bulk email validation result to erxes-api`);

    await sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        emails,
      },
    });
  }
});
