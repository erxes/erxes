import { splitType, TAutomationProducers } from 'erxes-api-shared/core-modules';
import {
  getEnv,
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { EmailResolver } from './generateReciepentEmailsByType';
import { getRecipientEmails } from './generateRecipientEmails';
import { replaceDocuments } from './replaceDocuments';
import { filterOutSenderEmail, formatFromEmail } from './utils';

export const generateEmailPayload = async ({
  subdomain,
  target,
  execution,
  triggerType,
  config,
}) => {
  const { templateId, fromUserId, fromEmailPlaceHolder, sender } = config;
  const [pluginName, type] = splitType(triggerType);
  const version = getEnv({ name: 'VERSION' });
  const DEFAULT_AWS_EMAIL = getEnv({ name: 'DEFAULT_AWS_EMAIL' });

  const MAIL_SERVICE = getEnv({ name: 'MAIL_SERVICE' });

  // const template = await sendCoreMessage({
  //   subdomain,
  //   action: "emailTemplatesFindOne",
  //   data: {
  //     _id: templateId,
  //   },
  //   isRPC: true,
  //   defaultValue: null,
  // });
  const template = { content: 'Hello World' };

  let fromUserEmail = version === 'saas' ? DEFAULT_AWS_EMAIL : '';

  if (MAIL_SERVICE === 'custom') {
    const { resolvePlaceholderEmails } = new EmailResolver({
      subdomain,
      execution,
      target,
    });

    const emails = await resolvePlaceholderEmails(
      { pluginName, contentType: type },
      fromEmailPlaceHolder,
      'attributionMail',
    );
    if (!emails?.length) {
      throw new Error('Cannot find from user');
    }
    fromUserEmail = emails[0];
  } else if (fromUserId) {
    const fromUser = await sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      method: 'query',
      input: { _id: fromUserId },
      defaultValue: null,
    });

    fromUserEmail = fromUser?.email;
  }

  let replacedContent = (template?.content || '').replace(
    new RegExp(`{{\\s*${type}\\.\\s*(.*?)\\s*}}`, 'g'),
    '{{ $1 }}',
  );

  replacedContent = await replaceDocuments(subdomain, replacedContent, target);

  const { subject, content = '' } = await sendCoreModuleProducer({
    moduleName: 'automations',
    pluginName,
    producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
    input: {
      execution,
      target,
      config: {
        target,
        config: {
          subject: config.subject,
          content: replacedContent,
        },
      },
    },
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
    customHtml: content.replace(/{{\s*([^}]+)\s*}}/g, '-'),
  };
};
