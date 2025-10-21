import { getEnv } from 'erxes-api-shared/utils';
import { createTransporter } from './createTransporter';
import { getConfig } from 'erxes-api-shared/core-modules';
import { debugError } from '@/debuuger';

export const sendEmails = async ({
  payload,
}: {
  payload: {
    title: string;
    fromEmail: string;
    toEmails: string[];
    ccEmails: string[];
    customHtml: string;
  };
}) => {
  const {
    toEmails = [],
    ccEmails = [],
    fromEmail,
    title,
    customHtml,
  } = payload;

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  const DEFAULT_EMAIL_SERVICE = await getConfig('DEFAULT_EMAIL_SERVICE', 'SES');
  const COMPANY_EMAIL_FROM = await getConfig('COMPANY_EMAIL_FROM');
  const AWS_SES_CONFIG_SET = await getConfig('AWS_SES_CONFIG_SET');
  const AWS_SES_ACCESS_KEY_ID = await getConfig('AWS_SES_ACCESS_KEY_ID');
  const AWS_SES_SECRET_ACCESS_KEY = await getConfig(
    'AWS_SES_SECRET_ACCESS_KEY',
  );

  if (!fromEmail && !COMPANY_EMAIL_FROM) {
    throw new Error('From Email is required');
  }

  if (NODE_ENV === 'test') {
    throw new Error('Node environment is required');
  }

  let transporter;

  try {
    transporter = await createTransporter({
      ses: DEFAULT_EMAIL_SERVICE === 'SES',
    });
  } catch (e) {
    debugError(e.message);
    throw new Error(e.message);
  }

  let response: any;
  const mailOptions: any = {
    from: fromEmail || COMPANY_EMAIL_FROM,
    to: toEmails.join(', '), // Combine all to emails with commas
    cc: ccEmails.length ? ccEmails.join(', ') : undefined, // Combine all cc emails with commas
    subject: title,
    html: customHtml,
  };

  let headers: { [key: string]: string } = {};

  if (!!AWS_SES_ACCESS_KEY_ID?.length && !!AWS_SES_SECRET_ACCESS_KEY.length) {
    // For multiple recipients, you might want to handle email deliveries differently
    // Either create one delivery record for all recipients or handle separately
    // const emailDelivery = await sendCoreMessage({
    //   subdomain,
    //   action: "emailDeliveries.create",
    //   data: {
    //     kind: "transaction",
    //     to: toEmails.join(", "), // All recipients
    //     from: fromEmail,
    //     subject: title,
    //     body: customHtml,
    //     status: "pending",
    //   },
    //   isRPC: true,
    // });

    headers = {
      'X-SES-CONFIGURATION-SET': AWS_SES_CONFIG_SET || 'erxes',
      // EmailDeliveryId: emailDelivery && emailDelivery._id,
    };
  } else {
    headers['X-SES-CONFIGURATION-SET'] = 'erxes';
  }

  mailOptions.headers = headers;

  if (!mailOptions.from) {
    throw new Error(`"From" email address is missing: ${mailOptions.from}`);
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    response = {
      from: mailOptions.from,
      messageId: info.messageId,
      toEmails, // All to emails
      ccEmails: ccEmails.length ? ccEmails : undefined,
    };
  } catch (error) {
    response = {
      from: mailOptions.from,
      toEmails,
      ccEmails: mailOptions.cc,
      error,
    };
    debugError(error);
  }

  return response;
};
