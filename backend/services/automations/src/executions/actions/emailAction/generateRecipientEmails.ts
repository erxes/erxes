import { splitType, TAutomationProducers } from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { EmailResolver } from './generateReciepentEmailsByType';
import { getEmailRecipientTypes } from './utils';

type EmailsGeneratorType = EmailResolver;

enum RECIEPENT_TYPES {
  TEAM_MEMBER = 'teamMember',
  ATTRIBUTION_MAILS = 'attributionMail',
  CUSTOM_MAILS = 'customMail',
}

export const getRecipientEmails = async ({
  subdomain,
  config,
  triggerType,
  target,
  execution,
}) => {
  const reciepentTypes = await getEmailRecipientTypes();
  const emailResolver = new EmailResolver({
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
    emailResolver,
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
    emailResolver,
  }: {
    subdomain: string;
    triggerType: string;
    reciepentTypes: {
      type: string;
      name: string;
      label: string;
      pluginName?: string;
    }[];
    reciepentTypeKeys: string[];
    emailResolver: EmailsGeneratorType;
  },
) => {
  let recipientEmails: string[] = [];

  for (const key of Object.keys(config)) {
    if (reciepentTypeKeys.includes(key) && !!config[key]) {
      const [pluginName, contentType] = splitType(triggerType);

      const { type, pluginName: reciepentTypePluginName } =
        reciepentTypes.find((rT) => rT.name === key) || {};

      if (type === RECIEPENT_TYPES.TEAM_MEMBER) {
        const emails = await emailResolver.resolveTeamMemberEmails({
          _id: { $in: config[key] || [] },
        });

        recipientEmails = [...recipientEmails, ...emails];
        continue;
      }

      if (type === RECIEPENT_TYPES.ATTRIBUTION_MAILS) {
        const emails = await emailResolver.resolvePlaceholderEmails(
          { pluginName, contentType },
          config[key],
          type,
        );

        recipientEmails = [...recipientEmails, ...emails];
        continue;
      }

      if (type === RECIEPENT_TYPES.CUSTOM_MAILS) {
        const emails = config[key] || [];

        recipientEmails = [...recipientEmails, ...emails];
        continue;
      }

      if (!!reciepentTypePluginName) {
        const emails = await sendCoreModuleProducer({
          moduleName: 'automations',
          pluginName,
          producerName: TAutomationProducers.GET_RECIPIENTS_EMAILS,
          input: {
            type,
            config,
          },
          defaultValue: {},
        });
        recipientEmails = [...recipientEmails, ...emails];
        continue;
      }
    }
  }

  return recipientEmails;
};
