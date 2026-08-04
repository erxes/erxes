import {
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import { getEnv, resolveDefaultSenderEmail } from 'erxes-api-shared/utils';
import { assertSenderAllowed } from '../../../utils/emailSender';
import { getConfig } from '../../../utils/utils';
import { collectEmails, getRecipientEmails } from './generateRecipientEmails';
import { renderEmailContent } from './renderEmailContent';
import { replaceDocuments } from './replaceDocuments';
import {
  filterOutSenderEmail,
  formatFromEmail,
  formatIsoDatesInText,
  normalizeEmailActionPlaceholders,
  stripDeadLinks,
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
  const DEFAULT_FROM_EMAIL = getEnv({ name: 'DEFAULT_FROM_EMAIL' });

  const isSaasVersion = version === 'saas';
  const isDefaultSender = senderType === 'default' || !senderType;
  const isPickedSender = senderType === 'custom' || senderType === 'verified';
  const normalizedFromEmailPlaceHolder = normalizeEmailActionPlaceholders(
    fromEmailPlaceHolder || '',
    targetType,
  );
  const normalizedSubject = normalizeEmailActionPlaceholders(
    config.subject || '',
    targetType,
  );
  let fromUserEmail = '';

  if (isDefaultSender) {
    fromUserEmail = resolveDefaultSenderEmail({
      isSaas: isSaasVersion,
      companyEmailFrom: await getConfig(subdomain, 'COMPANY_EMAIL_FROM', ''),
      fallbackEmail: DEFAULT_FROM_EMAIL,
    });
  }

  if (isPickedSender) {
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

  await assertSenderAllowed(subdomain, fromUserEmail);

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
  const subject = formatIsoDatesInText(
    String(replacedValues.subject ?? normalizedSubject),
  );
  const content = formatIsoDatesInText(String(replacedValues.content ?? ''));

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
    replyTo: config.replyToEmail || undefined,
    toEmails: filteredToEmails,
    ccEmails: filteredCcEmails,
    customHtml: stripDeadLinks(content.replace(/{{\s*([^}]+)\s*}}/g, '-')),
  };
};
