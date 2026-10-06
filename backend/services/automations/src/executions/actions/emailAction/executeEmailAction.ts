import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  buildSkippedAction,
} from 'erxes-api-shared/core-modules';
import { debugError } from '../../../debugger';
import { generateEmailPayload } from './generateEmailPayload';
import { sendEmails } from './sendEmails';
import { setActivityLog } from './utils';

/**
 * Executes an email action by generating payload and sending emails
 * @param subdomain - The subdomain context
 * @param target - The target object for the email
 * @param execution - The automation execution document
 * @param triggerType - The type of trigger that initiated the automation
 * @param targetType - The type of target object
 * @param config - Email action configuration
 * @returns Promise resolving to the email action outcome
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
      return buildFailedAction(
        'Email recipients or content could not be resolved',
        AUTOMATION_ERROR_CODES.CONFIG_INVALID,
      );
    }

    const response = await sendEmails(subdomain, {
      payload,
      executionId: execution?._id,
    });

    await setActivityLog({
      subdomain,
      triggerType,
      target,
      response,
    });

    // The delivery layer answers with what happened rather than throwing, so
    // its answer decides the outcome instead of the absence of an error.
    if (response?.error) {
      return buildFailedAction(
        response.error?.message || 'Email could not be delivered',
        AUTOMATION_ERROR_CODES.PROVIDER_ERROR,
        { ...payload, response },
      );
    }

    if (response?.skipped) {
      return buildSkippedAction(
        response.suppressed ? 'suppressed-recipient' : 'delivery-skipped',
        { ...payload, response },
      );
    }

    return { ...payload, response };
  } catch (err) {
    debugError(`Error executing email action: ${err.message}`);
    throw new Error(err.message);
  }
};
