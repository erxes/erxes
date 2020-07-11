import * as dotenv from 'dotenv';
import * as Random from 'meteor-random';
import * as Telnyx from 'telnyx';
import { debugEngages } from './debuggers';
import { Logs, SmsRequests, Stats } from './models';
import { createTransporter, getConfigs, getEnv, replaceKeys } from './utils';

dotenv.config();

export const start = async (data: any) => {
  const { user, email, engageMessageId, customers } = data;
  const { content, subject, attachments, sender, replyTo } = email;

  await Stats.findOneAndUpdate({ engageMessageId }, { engageMessageId }, { upsert: true });

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
        from: `${sender || ''} <${user.email}>`,
        to: customer.email,
        replyTo,
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

export const sendSms = async (data: any) => {
  const { customers, engageMessageId, shortMessage } = data;

  const configs = await getConfigs();

  const { telnyxApiKey, telnyxPhone, telnyxProfileId } = configs;

  const MAIN_API_DOMAIN = getEnv({ name: 'MAIN_API_DOMAIN' });

  if (!(telnyxApiKey && telnyxPhone)) {
    throw new Error('Telnyx API key & phone numbers are missing');
  }

  await Logs.createLog(engageMessageId, 'regular', `Preparing to send SMS to ${customers.length} customers`);

  const telnyx = new Telnyx(telnyxApiKey);

  const filteredCustomers = customers.filter(c => c.phone && c.phoneValidationStatus === 'valid');

  for (const customer of filteredCustomers) {
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    const msg = {
      from: telnyxPhone,
      to: customer.phone,
      text: shortMessage.content,
      messaging_profile_id: '',
      webhook_url: `${MAIN_API_DOMAIN}/telnyx/webhook`,
      webhook_failover_url: `${MAIN_API_DOMAIN}/telnyx/webhook-failover`,
    };

    // telnyx sets from text properly when making international sms
    if (telnyxProfileId) {
      msg.messaging_profile_id = telnyxProfileId;
      msg.from = shortMessage.from;
    }

    try {
      await telnyx.messages.create(msg, async (err, res) => {
        const request = await SmsRequests.createRequest({
          engageMessageId,
          to: msg.to,
          requestData: JSON.stringify(msg),
        });

        if (err) {
          await Logs.createLog(engageMessageId, 'failure', `${err.message} "${msg.to}"`);

          await SmsRequests.updateRequest(request._id, {
            errorMessages: [err.message],
          });
        }

        if (res && res.data && res.data.to) {
          const receiver = res.data.to.find(item => item.phone_number === msg.to);

          await Logs.createLog(engageMessageId, 'success', `Message successfully sent to "${msg.to}"`);

          await SmsRequests.updateRequest(request._id, {
            status: receiver && receiver.status,
            responseData: JSON.stringify(res.data),
            telnyxId: res.data.id,
          });
        }
      }); // end sms creation
    } catch (e) {
      await Logs.createLog(engageMessageId, 'failure', `${e.message} while sending to "${msg.to}"`);
    }
  } // end customers loop
};
