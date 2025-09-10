import { sendCommonMessage, sendCoreMessage } from "../../messageBroker";
import { getEnv } from "../../utils";
import { getRecipientEmails } from "./generateRecipientEmails";
import { replaceDocuments } from "./replaceDocuments";
import { filterOutSenderEmail, formatFromEmail } from "./utils";

export const generateEmailPayload = async ({
  subdomain,
  target,
  execution,
  triggerType,
  config,
}) => {
  const { templateId, fromUserId, sender } = config;
  const [serviceName, type] = triggerType.split(":");
  const version = getEnv({ name: "VERSION" });
  const DEFAULT_AWS_EMAIL = getEnv({ name: "DEFAULT_AWS_EMAIL" });

  const template = await sendCoreMessage({
    subdomain,
    action: "emailTemplatesFindOne",
    data: {
      _id: templateId,
    },
    isRPC: true,
    defaultValue: null,
  });

  let fromUserEmail = version === "saas" ? DEFAULT_AWS_EMAIL : "";

  if (fromUserId) {
    const fromUser = await sendCoreMessage({
      subdomain,
      action: "users.findOne",
      data: {
        _id: fromUserId,
      },
      isRPC: true,
      defaultValue: null,
    });

    fromUserEmail = fromUser?.email;
  }

  let replacedContent = (template?.content || "").replace(
    new RegExp(`{{\\s*${type}\\.\\s*(.*?)\\s*}}`, "g"),
    "{{ $1 }}"
  );

  replacedContent = await replaceDocuments(subdomain, replacedContent, target);

  const { subject, content = "" } = await sendCommonMessage({
    subdomain,
    serviceName,
    action: "automations.replacePlaceHolders",
    data: {
      target,
      config: {
        subject: config.subject,
        content: replacedContent,
      },
    },
    isRPC: true,
    defaultValue: {},
  });

  const [toEmails, ccEmails] = await getRecipientEmails({
    subdomain,
    config,
    triggerType,
    target,
    execution,
  });

  if (!toEmails?.length && ccEmails?.length) {
    throw new Error('"Recieving emails not found"');
  }

  return {
    title: subject,
    fromEmail: formatFromEmail(sender, fromUserEmail),
    toEmails: filterOutSenderEmail(toEmails, fromUserEmail),
    ccEmails: filterOutSenderEmail(ccEmails, fromUserEmail),
    customHtml: content.replace(/{{\s*([^}]+)\s*}}/g, "-"),
  };
};
