import * as dotenv from 'dotenv';
import * as Random from 'meteor-random';
import { debugEngages } from './debuggers';
import { Logs, SmsRequests, Stats } from './models';
import { getTelnyxInfo } from './telnyxUtils';
import { createTransporter, getConfigs, getEnv, replaceKeys } from './utils';

dotenv.config();

interface IShortMessage {
  content: string;
  from?: string;
  fromIntegrationId: string;
}

interface IIntegration {
  _id: string;
  kind: string;
  erxesApiId: string;
  telnyxProfileId?: string;
  telnyxPhoneNumber: string;
}

interface IMessageParams {
  shortMessage: IShortMessage;
  to: string;
  integrations: IIntegration[];
}

interface ITelnyxMessageParams {
  from: string;
  to: string;
  text: string;
  messaging_profile_id?: string;
  webhook_url?: string;
  webhook_failover_url?: string;
}

interface ICallbackParams {
  engageMessageId?: string;
  msg: ITelnyxMessageParams;
}

// alphanumeric sender id only works for countries outside north america
const isNumberNorthAmerican = (phoneNumber: string) => {
  return phoneNumber.substring(0, 2) === '+1';
};

// prepares sms object matching telnyx requirements
const prepareMessage = async ({ shortMessage, to, integrations }: IMessageParams): Promise<ITelnyxMessageParams> => {
  const MAIN_API_DOMAIN = getEnv({ name: 'MAIN_API_DOMAIN' });
  const { content, from, fromIntegrationId } = shortMessage;

  const integration = integrations.find(i => i.erxesApiId === fromIntegrationId);

  if (!integration.telnyxPhoneNumber) {
    throw new Error('Telnyx phone is not configured');
  }

  const msg = {
    from: integration.telnyxPhoneNumber,
    to,
    text: content,
    messaging_profile_id: '',
    webhook_url: `${MAIN_API_DOMAIN}/telnyx/webhook`,
    webhook_failover_url: `${MAIN_API_DOMAIN}/telnyx/webhook-failover`,
  };

  // telnyx sets from text properly when making international sms
  if (integration.telnyxProfileId) {
    msg.messaging_profile_id = integration.telnyxProfileId;
  }

  if (from) {
    msg.from = from;
  }

  if (isNumberNorthAmerican(msg.to)) {
    msg.from = integration.telnyxPhoneNumber;
  }

  return msg;
};

const handleMessageCallback = async (err: any, res: any, data: ICallbackParams) => {
  const { engageMessageId, msg } = data;

  const request = await SmsRequests.createRequest({
    engageMessageId,
    to: msg.to,
    requestData: JSON.stringify(msg),
  });

  if (err) {
    if (engageMessageId) {
      await Logs.createLog(engageMessageId, 'failure', `${err.message} "${msg.to}"`);
    }

    await SmsRequests.updateRequest(request._id, {
      errorMessages: [err.message],
    });
  }

  if (res && res.data && res.data.to) {
    const receiver = res.data.to.find(item => item.phone_number === msg.to);

    if (engageMessageId) {
      await Logs.createLog(engageMessageId, 'success', `Message successfully sent to "${msg.to}"`);
    }

    await SmsRequests.updateRequest(request._id, {
      status: receiver && receiver.status,
      responseData: JSON.stringify(res.data),
      telnyxId: res.data.id,
    });
  }
};

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

    replacedContent += `<div style="padding: 10px; color: #ccc; text-align: center; font-size:12px;">If you want to use service like this click <a style="text-decoration: underline; color: #ccc;" href="https://erxes.io" target="_blank">here</a> to read more. Also you can opt out from our email subscription <a style="text-decoration: underline;color: #ccc;" rel="noopener" target="_blank" href="${unSubscribeUrl}">here</a>.  <br>© 2020 erxes inc Growth Marketing Platform </div>`;

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

// sends bulk sms via engage message
export const sendBulkSms = async (data: any) => {
  const { customers, engageMessageId, shortMessage } = data;

  const telnyxInfo = await getTelnyxInfo();

  const filteredCustomers = customers.filter(c => c.phone && c.phoneValidationStatus === 'valid');

  await Logs.createLog(engageMessageId, 'regular', `Preparing to send SMS to "${filteredCustomers.length}" customers`);

  for (const customer of filteredCustomers) {
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    const msg = await prepareMessage({ shortMessage, to: customer.phone, integrations: telnyxInfo.integrations });

    try {
      await telnyxInfo.instance.messages.create(msg, async (err: any, res: any) => {
        await handleMessageCallback(err, res, { engageMessageId, msg });
      }); // end sms creation
    } catch (e) {
      await Logs.createLog(engageMessageId, 'failure', `${e.message} while sending to "${msg.to}"`);
    }
  } // end customers loop
}; // end sendBuklSms()
