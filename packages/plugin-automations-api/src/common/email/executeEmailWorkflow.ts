import { generateEmailPayload } from "./generateEmailPayload";
import { sendEmails } from "./sendEmails";
import { setActivityLog } from "./utils";

export const executeEmailAction = async ({
  subdomain,
  target,
  execution,
  triggerType,
  config,
}) => {
  console.time("executeSendEmail");
  try {
    const params = await generateEmailPayload({
      subdomain,
      triggerType,
      target,
      config,
      execution,
    });

    if (!params) {
      return { error: "Something went wrong fetching data" };
    }

    const response = await sendEmails({
      subdomain,
      params,
    });
    await setActivityLog({
      subdomain,
      triggerType,
      target,
      response,
    });

    console.time("executeSendEmail");
    return { ...params, response };
  } catch (err) {
    return { error: err.message };
  }
};
