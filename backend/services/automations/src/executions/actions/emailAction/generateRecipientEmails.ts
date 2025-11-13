import { generateAttributesFromPlaceholders } from '@/utils/utils';
import { splitType, TAutomationProducers } from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { extractValidEmails } from './utils';

export const getRecipientEmails = async ({
  subdomain,
  config,
  targetType,
  target,
}) => {
  const commonProps = {
    subdomain,
    targetType,
    target,
  };

  const toEmails = [
    ...(await collectEmails(config.toEmailsPlaceHolders, commonProps)),
  ];
  const ccEmails = config?.ccEmailsPlaceHolders
    ? [
        ...(await collectEmails(
          config?.ccEmailsPlaceHolders || '',
          commonProps,
        )),
      ]
    : [];

  return [toEmails, ccEmails];
};

export const collectEmails = async (
  mailPlaceHolder: string,
  {
    subdomain,
    target,
    targetType,
  }: {
    subdomain: string;
    target: any;
    targetType: string;
  },
) => {
  const directEmails = extractValidEmails(mailPlaceHolder);
  let recipientEmails: string[] = [];
  const [pluginName, moduleName, contentType] = splitType(targetType);
  const attributes = generateAttributesFromPlaceholders(mailPlaceHolder);
  if (!attributes.length) return [];

  const relatedValueProps: Record<string, any> = {};

  for (const attribute of attributes) {
    relatedValueProps[attribute] = {
      key: 'email',
      filter: {
        key: 'registrationToken',
        value: null,
      },
    };

    if (['customers', 'companies'].includes(attribute)) {
      relatedValueProps[attribute] = { key: 'primaryEmail' };
    }
  }

  const replacedContent = await sendCoreModuleProducer({
    subdomain,
    moduleName: 'automations',
    pluginName,
    producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
    input: {
      moduleName,
      target: { ...(target || {}), type: contentType },
      config: { mailPlaceHolder: mailPlaceHolder },
      relatedValueProps,
    },
  });

  const generatedEmails = extractValidEmails(
    replacedContent['mailPlaceHolder'] || '',
  );

  return [
    ...new Set([...directEmails, ...generatedEmails, ...recipientEmails]),
  ];
};
