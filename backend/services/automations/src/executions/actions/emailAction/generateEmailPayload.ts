import {
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import { getEnv } from 'erxes-api-shared/utils';
import { collectEmails, getRecipientEmails } from './generateRecipientEmails';
import { renderEmailContent } from './renderEmailContent';
import { replaceDocuments } from './replaceDocuments';
import {
  filterOutSenderEmail,
  formatFromEmail,
  normalizeEmailActionPlaceholders,
} from './utils';

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
  const version = getEnv({ name: 'VERSION' });
  const DEFAULT_AWS_EMAIL = getEnv({ name: 'DEFAULT_AWS_EMAIL' });

  const isSaasVersion = version === 'saas';
  const isProduction = getEnv({ name: 'NODE_ENV' }) === 'production';
  const isDefaultSender = senderType === 'default' || !senderType;
  const normalizedFromEmailPlaceHolder = normalizeEmailActionPlaceholders(
    fromEmailPlaceHolder || '',
    targetType,
  );
  const normalizedSubject = normalizeEmailActionPlaceholders(
    config.subject || '',
    targetType,
  );
  let fromUserEmail = '';

  if (isSaasVersion || isDefaultSender || !isProduction) {
    fromUserEmail = DEFAULT_AWS_EMAIL;
  }

  if (senderType === 'custom' || (!isSaasVersion && !fromUserEmail)) {
    const emails = await collectEmails(normalizedFromEmailPlaceHolder, {
      subdomain,
      execution,
      targetType,
    });
    if (!emails?.length) {
      throw new Error('Cannot find from user');
    }
    fromUserEmail = emails[0];
  }

  const templateContent = renderEmailContent(config?.content, config?.html);

  let replacedContent = normalizeEmailActionPlaceholders(
    templateContent,
    targetType,
  );

  replacedContent = await replaceDocuments(subdomain, replacedContent, target);

  const replacedValues = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: {
      subject: normalizedSubject,
      content: replacedContent,
    },
  });
  const subject = String(replacedValues.subject ?? normalizedSubject);
  const content = String(replacedValues.content ?? '');

  const [toEmails, ccEmails] = await getRecipientEmails({
    subdomain,
    config,
    execution,
    targetType,
  });

  const filteredToEmails = filterOutSenderEmail(toEmails, fromUserEmail);
  const filteredCcEmails = filterOutSenderEmail(ccEmails, fromUserEmail);

  if (!filteredToEmails?.length) {
    throw new Error('"Receiving emails not found"');
  }

  return {
    title: subject,
    fromEmail: formatFromEmail(sender, fromUserEmail),
    toEmails: filteredToEmails,
    ccEmails: filteredCcEmails,
    customHtml: content.replace(/{{\s*([^}]+)\s*}}/g, '-'),
  };
};
