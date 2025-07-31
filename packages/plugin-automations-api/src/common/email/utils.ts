import { getService, getServices } from "@erxes/api-utils/src/serviceDiscovery";
import { EMAIL_RECIPIENTS_TYPES } from "../../constants";
import { getEnv } from "../../utils";
import { putActivityLog } from "../../logUtils";

export const getEmailRecipientTypes = async () => {
  let reciepentTypes = [...EMAIL_RECIPIENTS_TYPES];

  const services = await getServices();

  for (const serviceName of services) {
    const service = await getService(serviceName);
    const meta = service.config?.meta || {};

    if (meta?.automations?.constants?.emailRecipIentTypes) {
      const { emailRecipIentTypes } = meta?.automations?.constants || {};

      reciepentTypes = [
        ...reciepentTypes,
        ...emailRecipIentTypes.map((eTR) => ({ ...eTR, serviceName })),
      ];
    }
  }
  return reciepentTypes;
};

export const extractValidEmails = (
  entry: string | any[],
  key?: string
): string[] => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (Array.isArray(entry)) {
    if (key) {
      entry = entry.map((item) => item?.[key]);
    }

    return entry
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => emailRegex.test(value));
  }

  if (typeof entry === "string") {
    return entry
      .split(/[\s,;]+/) // split by space, comma, or semicolon
      .map((value) => value.trim())
      .filter(
        (value) =>
          value &&
          value.toLowerCase() !== "null" &&
          value.toLowerCase() !== "undefined" &&
          emailRegex.test(value)
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

export const getConfig = (configs, code, defaultValue?: string) => {
  const version = getEnv({ name: "VERSION" });

  if (version === "saas") {
    return getEnv({ name: code, defaultValue });
  }

  return configs[code] || defaultValue || "";
};

export const setActivityLog = async ({
  subdomain,
  triggerType,
  target,
  responses,
}) => {
  for (const response of responses || []) {
    if (response?.messageId) {
      await putActivityLog(subdomain, {
        action: "putActivityLog",
        data: {
          contentType: triggerType,
          contentId: target._id,
          createdBy: "automation",
          action: "sendEmail",
        },
      });
    }
  }
};

export const filterOutSenderEmail = (
  emails: string[],
  fromUserEmail: string
) => {
  return emails.filter((email) => fromUserEmail !== email);
};
