import {
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import { getEnv, resolveDefaultSenderEmail } from 'erxes-api-shared/utils';
import { assertSenderAllowed } from '../../../utils/emailSender';
import { getConfig } from '../../../utils/utils';
import { collectEmails, getRecipientEmails } from './generateRecipientEmails';
import {
  describeUnresolvedPlaceholders,
  findUnresolvedPlaceholders,
  recordPlaceholderResolver,
  renderEmailContent,
  replacePlaceholders,
} from 'erxes-api-shared/core-modules';
import { documentResolver, outputResolver } from './placeholderResolvers';
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

  // Fields are asked in order: an embedded document, then the execution's
  // outputs, then the record the action is running for.
  const resolvers = [
    documentResolver(subdomain, target),
    await outputResolver({
      subdomain,
      execution,
      targetType,
      texts: [config?.content, config?.html],
    }),
    recordPlaceholderResolver(target || {}),
  ];

  const rendered = await renderEmailContent(
    {
      content: config?.content,
      contentJson: config?.contentJson,
      contentFormat: config?.contentFormat,
    },
    { resolvers },
  );

  // Raw html kept on the action stands in when there is nothing to render.
  const renderedContent =
    rendered || (await replacePlaceholders(config?.html || '', resolvers));

  const replacedValues = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: { subject: normalizedSubject },
  });
  const subject = formatIsoDatesInText(
    String(replacedValues.subject ?? normalizedSubject),
  );
  const content = formatIsoDatesInText(renderedContent);

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

  // Every provider refuses a subjectless email, and says so in its own words
  // from deep inside a delivery error. The action says it here instead.
  if (!subject.trim()) {
    throw new Error('Email subject is empty');
  }

  // A marker that survived every replacement used to be quietly swapped for
  // "-", which made a broken field and a thin record look identical in the
  // recipient's inbox. The action fails instead, naming what was not filled.
  const unresolved = findUnresolvedPlaceholders(content);

  if (unresolved.length) {
    throw new Error(describeUnresolvedPlaceholders(unresolved));
  }

  return {
    title: subject,
    fromEmail: formatFromEmail(sender, fromUserEmail),
    replyTo: config.replyToEmail || undefined,
    toEmails: filteredToEmails,
    ccEmails: filteredCcEmails,
    customHtml: stripDeadLinks(content),
  };
};
