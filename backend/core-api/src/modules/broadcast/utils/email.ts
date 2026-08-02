import { ICustomer } from '@/broadcast/@types';
import dotenv from 'dotenv';
import { IAttachment } from 'erxes-api-shared/core-types';
import { isValidURL, randomAlphanumeric } from 'erxes-api-shared/utils';
import validator from 'validator';
import { coreUrl, readFileUrl as fileUrl } from '~/utils/email/links';

dotenv.config();

export const readFileUrl = (value: string, subdomain: string) => {
  if (!value || isValidURL(value) || validator.isURL(value)) {
    return value;
  }

  return fileUrl(subdomain, value);
};

const prepareAttachments = (
  attachments: IAttachment[] = [],
  subdomain: string,
) => {
  return attachments.map((file) => ({
    filename: file.name || '',
    path: readFileUrl(file.url || '', subdomain),
  }));
};

const prepareContentAndSubject = (
  subject: string,
  content: string,
  customer: ICustomer,
) => {
  let replacedContent = content;
  let replacedSubject = subject;

  if (customer.replacers) {
    for (const replacer of customer.replacers) {
      const regex = new RegExp(replacer.key, 'gi');
      replacedContent = replacedContent.replace(regex, replacer.value);
      replacedSubject = replacedSubject.replace(regex, replacer.value);
    }
  }

  return { replacedContent, replacedSubject };
};

export const prepareEmailHeader = (
  subdomain: string,
  customerId: string,
  engageMessageId?: string,
  configSet?: string,
) => {
  // `Subdomain` is not set here: `deliverEmail` adds it to every send path.
  const header: any = {
    'X-SES-CONFIGURATION-SET': configSet || 'erxes',
    CustomerId: customerId,
    MailMessageId: randomAlphanumeric(),
    Host: coreUrl(subdomain),
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
    attachments: prepareAttachments(attachments, subdomain),
    html: replacedContent,
    headers: prepareEmailHeader(subdomain, customer._id, _id, configSet),
  };
};
