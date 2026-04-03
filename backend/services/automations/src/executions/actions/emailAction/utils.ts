import { AUTOMATION_EMAIL_RECIPIENTS_TYPES } from 'erxes-api-shared/core-modules';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';

export const getEmailRecipientTypes = async () => {
  let reciepentTypes: Array<{
    type: string;
    name: string;
    label: string;
    pluginName?: string;
  }> = [...AUTOMATION_EMAIL_RECIPIENTS_TYPES];

  const plugins = await getPlugins();

  for (const pluginName of plugins) {
    const plugin = await getPlugin(pluginName);
    const meta = plugin.config?.meta || {};

    if (meta?.automations?.constants?.emailRecipIentTypes) {
      const { emailRecipIentTypes } = meta?.automations?.constants || {};

      reciepentTypes = [
        ...reciepentTypes,
        ...emailRecipIentTypes.map((eTR) => ({ ...eTR, pluginName })),
      ];
    }
  }
  return reciepentTypes;
};

export const extractValidEmails = (
  entry: string | any[],
  key?: string,
): string[] => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (Array.isArray(entry)) {
    if (key) {
      entry = entry.map((item) => item?.[key]);
    }

    return entry
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => emailRegex.test(value));
  }

  if (typeof entry === 'string') {
    return entry
      .split(/[\s,;]+/) // split by space, comma, or semicolon
      .map((value) => value.trim())
      .filter(
        (value) =>
          value &&
          value.toLowerCase() !== 'null' &&
          value.toLowerCase() !== 'undefined' &&
          emailRegex.test(value),
      );
  }

  return [];
};

export const formatFromEmail = (sender, fromUserEmail) => {
  if (sender && fromUserEmail) {
    return `${sender} <${fromUserEmail}>`;
  }

  if (fromUserEmail) {
    return fromUserEmail;
  }

  return null;
};

export const setActivityLog = async ({
  subdomain,
  triggerType,
  target,
  response,
}) => {
  if (response?.messageId) {
    // await putActivityLog(subdomain, {
    //   action: "putActivityLog",
    //   data: {
    //     contentType: triggerType,
    //     contentId: target._id,
    //     createdBy: "automation",
    //     action: "sendEmail",
    //   },
    // });
  }
};

export const filterOutSenderEmail = (
  emails: string[],
  fromUserEmail: string,
) => {
  return emails.filter((email) => fromUserEmail !== email);
};
