import { sendCommonMessage } from "../../messageBroker";
import { GenerateEmailsByType } from "./generateReciepentEmailsByType";
import { getEmailRecipientTypes } from "./utils";

type EmailsGeneratorType = GenerateEmailsByType;

export const getRecipientEmails = async ({
  subdomain,
  config,
  triggerType,
  target,
  execution,
}) => {
  const reciepentTypes = await getEmailRecipientTypes();
  const emailsGeneratorByType = new GenerateEmailsByType({
    subdomain,
    execution,
    target,
  });

  const reciepentTypeKeys = reciepentTypes.map((rT) => rT.name);

  const commonProps = {
    subdomain,
    triggerType,
    reciepentTypeKeys,
    reciepentTypes,
    emailsGeneratorByType,
  };

  const toEmails = [...(await collectEmails(config, commonProps))];
  const ccEmails = [...(await collectEmails(config?.cc || {}, commonProps))];

  return [toEmails, ccEmails];
};

const collectEmails = async (
  config: any,
  {
    subdomain,
    triggerType,
    reciepentTypeKeys,
    reciepentTypes,
    emailsGeneratorByType,
  }: {
    subdomain: string;
    triggerType: string;
    reciepentTypes: {
      type: string;
      name: string;
      label: string;
      serviceName?: string;
    }[];
    reciepentTypeKeys: string[];
    emailsGeneratorByType: EmailsGeneratorType;
  }
) => {
  let recipientEmails: string[] = [];

  for (const key of Object.keys(config)) {
    if (reciepentTypeKeys.includes(key) && !!config[key]) {
      const [serviceName, contentType] = triggerType
        .replace(".", ":")
        .split(":");

      const { type, serviceName: reciepentTypeServiceName } =
        reciepentTypes.find((rT) => rT.name === key) || {};

      if (type === "teamMember") {
        const emails = await emailsGeneratorByType.getTeamMemberEmails({
          _id: { $in: config[key] || [] },
        });

        recipientEmails = [...recipientEmails, ...emails];
        continue;
      }

      if (type === "attributionMail") {
        const emails = await emailsGeneratorByType.getAttributionEmails(
          { serviceName, contentType },
          config[key],
          type
        );

        recipientEmails = [...recipientEmails, ...emails];
        continue;
      }

      if (type === "customMail") {
        const emails = config[key] || [];

        recipientEmails = [...recipientEmails, ...emails];
        continue;
      }

      if (!!reciepentTypeServiceName) {
        const emails = await sendCommonMessage({
          subdomain,
          serviceName: reciepentTypeServiceName,
          action: "automations.getRecipientsEmails",
          data: {
            type,
            config,
          },
          isRPC: true,
        });
        recipientEmails = [...recipientEmails, ...emails];
        continue;
      }
    }
  }

  return recipientEmails;
};
