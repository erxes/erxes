import { generateEmailPayload } from '@/executions/actions/emailAction/generateEmailPayload';
import { sendEmails } from '@/executions/actions/emailAction/sendEmails';
import { setActivityLog } from '@/executions/actions/emailAction/utils';

export const executeEmailAction = async ({
  subdomain,
  target,
  execution,
  triggerType,
  config,
}) => {
  try {
    const payload = await generateEmailPayload({
      subdomain,
      triggerType,
      target,
      config,
      execution,
    });

    if (!payload) {
      return { error: 'Something went wrong fetching data' };
    }

    const response = await sendEmails({
      payload,
    });

    await setActivityLog({
      subdomain,
      triggerType,
      target,
      response,
    });

    return { ...payload, response };
  } catch (err) {
    return { error: err.message };
  }
};
