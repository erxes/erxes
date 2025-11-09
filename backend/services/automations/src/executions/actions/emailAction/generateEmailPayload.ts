import {
  IAutomationExecutionDocument,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { getEnv, sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { collectEmails, getRecipientEmails } from './generateRecipientEmails';
import { replaceDocuments } from './replaceDocuments';
import { filterOutSenderEmail, formatFromEmail } from './utils';

export const generateEmailPayload = async ({
  subdomain,
  target,
  execution,
  targetType,
  config,
}: {
  subdomain: string;
  target: any;
  execution: IAutomationExecutionDocument;
  triggerType: string;
  targetType: string;
  config: any;
}) => {
  const { fromEmailPlaceHolder, sender, type: senderType } = config;
  const [pluginName, type] = splitType(targetType);
  const version = getEnv({ name: 'VERSION' });
  const DEFAULT_AWS_EMAIL = getEnv({ name: 'DEFAULT_AWS_EMAIL' });

  const template = { content: config?.html || '' };
  // const isSaasVersion = version === 'saas';
  const isSaasVersion = true;
  let fromUserEmail = '';

  if (isSaasVersion || senderType === 'default') {
    fromUserEmail = DEFAULT_AWS_EMAIL;
  }

  if (senderType === 'custom' || !isSaasVersion) {
    const emails = await collectEmails(fromEmailPlaceHolder, {
      subdomain,
      target,
      targetType,
    });
    if (!emails?.length) {
      throw new Error('Cannot find from user');
    }
    fromUserEmail = emails[0];
  }

  let replacedContent = (template?.content || '').replace(
    new RegExp(`{{\\s*${type}\\.\\s*(.*?)\\s*}}`, 'g'),
    '{{ $1 }}',
  );

  replacedContent = await replaceDocuments(subdomain, replacedContent, target);

  const { subject, content = '' } = await sendCoreModuleProducer({
    moduleName: 'automations',
    subdomain,
    pluginName,
    producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
    input: {
      target,
      config: {
        subject: config.subject,
        content: replacedContent,
      },
    },
    defaultValue: {},
  });

  const [toEmails, ccEmails] = await getRecipientEmails({
    subdomain,
    config,
    targetType,
    target,
  });

  if (!toEmails?.length && ccEmails?.length) {
    throw new Error('"Recieving emails not found"');
  }

  return {
    title: subject,
    fromEmail: formatFromEmail(sender, fromUserEmail),
    toEmails: filterOutSenderEmail(toEmails, fromUserEmail),
    ccEmails: filterOutSenderEmail(ccEmails, fromUserEmail),
    customHtml: content.replace(/{{\s*([^}]+)\s*}}/g, '-'),
  };
};
