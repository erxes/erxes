import * as schedule from "node-schedule";
import { getBulkResult, getStatus } from "../apiPhoneVerifier";
import { Emails } from "../models";
import {
  bulkMailsso,
  debugBase,
  debugCrons,
  getArray,
  getEnv,
  sendRequest,
  setArray
} from "../utils";
import fetch = require("node-fetch");

schedule.scheduleJob("1 * * * * *", async () => {
  const listIds = await getArray("erxes_phone_verifier_list_ids");

  if (listIds.length === 0) {
    return;
  }

  for (const { listId, hostname } of listIds) {
    debugCrons(`Getting validation progress status with list_id: ${listId}`);

    const { status, data }: any = await getStatus(listId);

    if (status === "success" && data.progress_status === "completed") {
      await getBulkResult(listId, hostname).catch(e => {
        debugCrons(`Failed to get phone list. Error: ${e.message}`);
      });
      debugCrons(`Process is finished with list_id: ${listId}`);
      const unfinished = listIds.filter(item => item.listId !== listId);

      await setArray("erxes_phone_verifier_list_ids", unfinished);
    }
  }
});

schedule.scheduleJob("2 * * * * *", async () => {
  const listIds = await getArray("erxes_email_verifier_list_ids");

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
  const MAILS_SO_KEY = getEnv({ name: "MAILS_SO_KEY" });
  for (const { listId, hostname = "" } of listIds) {
    if (!listId) {
      const unfinished = listIds.filter(item => item.listId !== listId);

      await setArray("erxes_email_verifier_list_ids", unfinished);
      continue;
    }

    const response = await fetch(`https://api.mails.so/v1/batch/${listId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-mails-api-key": MAILS_SO_KEY
      }
    });

    const res = await response.json();

    if (!res.finished_at) {
      continue;
    }

    const emails = [];
    const emailPromises: any[] = [];

    for (const e of res.emails) {
      let status = "unknown";
      if (e.result === "deliverable") {
        status = "valid";
      } else if (e.result === "unknown") {
        status = "unknown";
      } else {
        status = "invalid";
      }

      emails.push({ email: e.email, status });

      emailPromises.push(Emails.createEmail({ email: e.email, status }));
    }

    await Promise.all(emailPromises);

    const unfinished = listIds.filter(item => item.listId !== listId);

    await setArray("erxes_email_verifier_list_ids", unfinished);
    try {
      if (hostname.length) {
        debugBase(`Sending bulk email validation result to erxes-api`);

        await sendRequest({
          url: `${hostname}/verifier/webhook`,
          method: "POST",
          body: {
            emails
          }
        });
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
});

schedule.scheduleJob("20 20 20 * * *", async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const emailsCursor = await Emails.find({
    verifiedAt: { $lt: oneMonthAgo }
  }).cursor();

  const BATCH_SIZE = 45000;

  const batch = [];

  for await (const email of emailsCursor) {
    batch.push(email);
    if (batch.length >= BATCH_SIZE) {
      await bulkMailsso(batch);
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    await bulkMailsso(batch);
  }
});
