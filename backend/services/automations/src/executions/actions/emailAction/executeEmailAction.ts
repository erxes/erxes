import { generateEmailPayload } from '@/executions/actions/emailAction/generateEmailPayload';
import { sendEmails } from '@/executions/actions/emailAction/sendEmails';
import { setActivityLog } from '@/executions/actions/emailAction/utils';

/**
 * Executes an email action by generating payload and sending emails
 * @param subdomain - The subdomain context
 * @param target - The target object for the email
 * @param execution - The automation execution document
 * @param triggerType - The type of trigger that initiated the automation
 * @param targetType - The type of target object
 * @param config - Email action configuration
 * @returns Promise resolving to email action response or error object
 */
export const executeEmailAction = async ({
  subdomain,
  target,
  execution,
  triggerType,
  targetType,
  config,
}) => {
  try {
    const payload = await generateEmailPayload({
      subdomain,
      triggerType,
      targetType,
      target,
      config,
      execution,
    });

    if (!payload) {
      return { error: 'Something went wrong fetching data' };
    }

    const response = await sendEmails(subdomain, {
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
