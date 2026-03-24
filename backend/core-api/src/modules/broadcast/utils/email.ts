import { ICustomer } from '@/broadcast/@types';
import dotenv from 'dotenv';
import { IAttachment } from 'erxes-api-shared/core-types';
import { getEnv, isValidURL, randomAlphanumeric } from 'erxes-api-shared/utils';
import validator from 'validator';

dotenv.config();

export const readFileUrl = (value: string) => {
  if (!value || isValidURL(value) || validator.isURL(value)) {
    return value;
  }

  const DOMAIN = getEnv({
    name: 'DOMAIN',
  });

  return `${DOMAIN}/gateway/read-file?key=${value}`;
};

const prepareAttachments = (attachments: IAttachment[] = []) => {
  return attachments.map((file) => ({
    filename: file.name || '',
    path: readFileUrl(file.url || ''),
  }));
};

const prepareContentAndSubject = (
  subject: string,
  content: string,
  customer: ICustomer,
) => {
  let replacedContent = content;
  let replacedSubject = subject;

  const DOMAIN = getEnv({ name: 'DOMAIN' });
  const unsubscribeUrl = `${DOMAIN}/gateway/pl:core/unsubscribe/?cid=${customer._id}`;

  if (customer.replacers) {
    for (const replacer of customer.replacers) {
      const regex = new RegExp(replacer.key, 'gi');
      replacedContent = replacedContent.replace(regex, replacer.value);
      replacedSubject = replacedSubject.replace(regex, replacer.value);
    }
  }

  replacedContent += `
    <div style="padding: 10px; color: #ccc; text-align: center; font-size:12px;">
      You are receiving this email because you have signed up for our services.
      <br />
      <a style="text-decoration: underline;color: #ccc;" rel="noopener" target="_blank" href="${unsubscribeUrl}">Unsubscribe</a>
    </div>
  `;

  return { replacedContent, replacedSubject };
};

export const prepareEmailHeader = (
  subdomain: string,
  customerId: string,
  engageMessageId?: string,
  configSet?: string,
) => {
  const DOMAIN = getEnv({ name: 'DOMAIN' })
    ? `${getEnv({ name: 'DOMAIN' })}/gateway`
    : 'http://localhost:4000';
  const callbackUrl = DOMAIN.replace('<subdomain>', subdomain);

  const header: any = {
    'X-SES-CONFIGURATION-SET': configSet || 'erxes',
    CustomerId: customerId,
    MailMessageId: randomAlphanumeric(),
    Host: callbackUrl,
  };

  if (engageMessageId) {
    header.EngageMessageId = engageMessageId;
  }

  return header;
};

export const prepareEmailParams = (
  subdomain: string,
  customer: ICustomer,
  engageMessage: any,
  fromEmail: string,
  configSet?: string,
) => {
  const { email, _id } = engageMessage;
  const { content, subject, attachments, sender, replyTo } = email;
  const { replacedContent, replacedSubject } = prepareContentAndSubject(
    subject,
    content,
    customer,
  );

  return {
    from: sender?.trim() ? `${sender} <${fromEmail}>` : fromEmail,
    to: (customer?.primaryEmail || '').toLocaleLowerCase().trim(),
    replyTo,
    subject: replacedSubject,
    attachments: prepareAttachments(attachments),
    html: replacedContent,
    headers: prepareEmailHeader(subdomain, customer._id, _id, configSet),
  };
};
