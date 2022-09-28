import * as dotenv from 'dotenv';
import * as Random from 'meteor-random';

import { IAttachment } from '@erxes/api-utils/src/types';
import { ICustomer } from './types';
import { getEnv } from './utils';

dotenv.config();

const prepareAttachments = (attachments: IAttachment[] = []) => {
  return attachments.map(file => ({
    filename: file.name || '',
    path: file.url || ''
  }));
};

const prepareContentAndSubject = (
  subject: string,
  content: string,
  customer: ICustomer
) => {
  let replacedContent = content;
  let replacedSubject = subject;

  const DOMAIN = getEnv({ name: 'DOMAIN' });
  const unsubscribeUrl = `${DOMAIN}/pl:core/unsubscribe/?cid=${customer._id}`;

  if (customer.replacers) {
    for (const replacer of customer.replacers) {
      const regex = new RegExp(replacer.key, 'gi');
      replacedContent = replacedContent.replace(regex, replacer.value);
      replacedSubject = replacedSubject.replace(regex, replacer.value);
    }
  }

  replacedContent += `<div style="padding: 10px; color: #ccc; text-align: center; font-size:12px;">You are receiving this email because you have signed up for our services. <br /> <a style="text-decoration: underline;color: #ccc;" rel="noopener" target="_blank" href="${unsubscribeUrl}">Unsubscribe</a> </div>`;

  return { replacedContent, replacedSubject };
};

const prepareEmailHeader = (
  configSet: string,
  customerId: string,
  engageMessageId?: string
) => {
  const header: any = {
    'X-SES-CONFIGURATION-SET': configSet || 'erxes',
    CustomerId: customerId,
    MailMessageId: Random.id()
  };

  if (engageMessageId) {
    header.EngageMessageId = engageMessageId;
  }

  return header;
};

export const prepareEmailParams = (
  customer: ICustomer,
  data: any,
  configSet: string
) => {
  const { fromEmail, email, engageMessageId } = data;
  const { content, subject, attachments, sender, replyTo } = email;
  const { replacedContent, replacedSubject } = prepareContentAndSubject(
    subject,
    content,
    customer
  );

  return {
    from: sender || fromEmail,
    to: customer.primaryEmail,
    replyTo,
    subject: replacedSubject,
    attachments: prepareAttachments(attachments),
    html: replacedContent,
    headers: prepareEmailHeader(configSet, customer._id, engageMessageId)
  };
};
