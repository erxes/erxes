import * as dotenv from 'dotenv';
import * as Random from 'meteor-random';
import { debugEngages } from './debuggers';
import { Logs, Stats } from './models';
import { createTransporter, getConfigs, getEnv, replaceKeys } from './utils';

dotenv.config();

export const start = async data => {
  const { user, email, engageMessageId, customers } = data;
  const { content, subject, attachments } = email;

  await Stats.create({ engageMessageId });

  const transporter = await createTransporter();

  const sendEmail = async customer => {
    const mailMessageId = Random.id();

    let mailAttachment = [];

    if (attachments.length > 0) {
      mailAttachment = attachments.map(file => {
        return {
          filename: file.name || '',
          path: file.url || '',
        };
      });
    }

    let replacedContent = replaceKeys({ content, customer, user });

    const MAIN_API_DOMAIN = getEnv({ name: 'MAIN_API_DOMAIN' });

    const unSubscribeUrl = `${MAIN_API_DOMAIN}/unsubscribe/?cid=${customer._id}`;

    replacedContent += `<div style="padding: 10px; color: #ccc; text-align: center; font-size:12px;">If you want to use service like this click <a style="text-decoration: underline; color: #ccc;" href="https://erxes.io" target="_blank">here</a> to read more. Also you can opt out from our email subscription <a style="text-decoration: underline;color: #ccc;" rel="noopener" target="_blank" href="${unSubscribeUrl}">here</a>.  <br>© 2019 erxes inc Growth Marketing Platform </div>`;

    try {
      await transporter.sendMail({
        from: user.email,
        to: customer.email,
        subject,
        attachments: mailAttachment,
        html: replacedContent,
        headers: {
          'X-SES-CONFIGURATION-SET': 'erxes',
          EngageMessageId: engageMessageId,
          CustomerId: customer._id,
          MailMessageId: mailMessageId,
        },
      });
      const msg = `Sent email to: ${customer.email}`;
      debugEngages(msg);
      await Logs.createLog(engageMessageId, 'success', msg);
    } catch (e) {
      debugEngages(e.message);
      await Logs.createLog(
        engageMessageId,
        'failure',
        `Error occurred while sending email to ${customer.email}: ${e.message}`,
      );
    }

    await Stats.updateOne({ engageMessageId }, { $inc: { total: 1 } });
  };

  const configs = await getConfigs();
  const unverifiedEmailsLimit = parseInt(configs.unverifiedEmailsLimit || '100', 10);

  let filteredCustomers = [];
  let emails = [];

  if (customers.length > unverifiedEmailsLimit) {
    await Logs.createLog(
      engageMessageId,
      'regular',
      `Unverified emails limit exceeced ${unverifiedEmailsLimit}. Customers who have unverified emails will be eliminated.`,
    );

    for (const customer of customers) {
      if (customer.emailValidationStatus === 'valid') {
        filteredCustomers.push(customer);

        emails.push(customer.email);
      }
    }
  } else {
    filteredCustomers = customers;
    emails = customers.map(customer => customer.email);
  }

  if (emails.length > 0) {
    await Logs.createLog(engageMessageId, 'regular', `Preparing to send emails to ${emails.length}: ${emails}`);
  }

  for (const customer of filteredCustomers) {
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    await sendEmail(customer);
  }

  return true;
};
