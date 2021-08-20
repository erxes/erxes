import * as dotenv from 'dotenv';
import * as Random from 'meteor-random';
import {
  ACTIVITY_CONTENT_TYPES,
  ACTIVITY_LOG_ACTIONS,
  CAMPAIGN_KINDS
} from './constants';
import { debugEngages, debugError } from './debuggers';
import messageBroker from './messageBroker';
import { Logs, Stats } from './models';
import {
  getTelnyxInfo,
  handleMessageCallback,
  prepareMessage
} from './telnyxUtils';
import { ICustomer, IEmailParams, ISmsParams } from './types';
import {
  cleanIgnoredCustomers,
  createTransporter,
  getConfig,
  getConfigs,
  getEnv,
  setCampaignCount
} from './utils';

dotenv.config();

export const start = async (data: IEmailParams) => {
  const {
    fromEmail,
    email,
    engageMessageId,
    customers,
    createdBy,
    title
  } = data;
  const { content, subject, attachments, sender, replyTo } = email;
  const configs = await getConfigs();

  await Stats.findOneAndUpdate(
    { engageMessageId },
    { engageMessageId },
    { upsert: true }
  );

  const transporter = await createTransporter();

  const sendEmail = async (customer: ICustomer) => {
    const mailMessageId = Random.id();

    let mailAttachment = [];

    if (attachments.length > 0) {
      mailAttachment = attachments.map(file => {
        return {
          filename: file.name || '',
          path: file.url || ''
        };
      });
    }

    const MAIN_API_DOMAIN = getEnv({ name: 'MAIN_API_DOMAIN' });

    const unsubscribeUrl = `${MAIN_API_DOMAIN}/unsubscribe/?cid=${customer._id}`;

    // replace customer attributes =====
    let replacedContent = content;
    let replacedSubject = subject;

    if (customer.replacers) {
      for (const replacer of customer.replacers) {
        const regex = new RegExp(replacer.key, 'gi');
        replacedContent = replacedContent.replace(regex, replacer.value);
        replacedSubject = replacedSubject.replace(regex, replacer.value);
      }
    }

    replacedContent += `<div style="padding: 10px; color: #ccc; text-align: center; font-size:12px;">You are receiving this email because you have signed up for our services. <br /> <a style="text-decoration: underline;color: #ccc;" rel="noopener" target="_blank" href="${unsubscribeUrl}">Unsubscribe</a> </div>`;

    try {
      await transporter.sendMail({
        from: `${sender || ''} <${fromEmail}>`,
        to: customer.primaryEmail,
        replyTo,
        subject: replacedSubject,
        attachments: mailAttachment,
        html: replacedContent,
        headers: {
          'X-SES-CONFIGURATION-SET': configs.configSet || 'erxes',
          EngageMessageId: engageMessageId,
          CustomerId: customer._id,
          MailMessageId: mailMessageId
        }
      });
      const msg = `Sent email to: ${customer.primaryEmail}`;

      debugEngages(msg);

      await Logs.createLog(engageMessageId, 'success', msg);

      await Stats.updateOne({ engageMessageId }, { $inc: { total: 1 } });
    } catch (e) {
      debugError(e.message);

      await Logs.createLog(
        engageMessageId,
        'failure',
        `Error occurred while sending email to ${customer.primaryEmail}: ${e.message}`
      );
    }
  };

  const unverifiedEmailsLimit = parseInt(
    configs.unverifiedEmailsLimit || '100',
    10
  );

  let filteredCustomers = [];
  let emails = [];

  if (customers.length > unverifiedEmailsLimit) {
    await Logs.createLog(
      engageMessageId,
      'regular',
      `Unverified emails limit exceeded ${unverifiedEmailsLimit}. Customers who have unverified emails will be eliminated.`
    );

    filteredCustomers = customers.filter(
      c => c.primaryEmail && c.emailValidationStatus === 'valid'
    );
  } else {
    filteredCustomers = customers;
  }

  // cleans customers who do not open or click emails often
  const {
    customers: cleanCustomers,
    ignoredCustomerIds
  } = await cleanIgnoredCustomers({
    customers: filteredCustomers,
    engageMessageId
  });

  // finalized email list
  emails = cleanCustomers.map(customer => customer.primaryEmail);

  await Logs.createLog(
    engageMessageId,
    'regular',
    `Preparing to send emails to ${emails.length}: ${emails}`
  );

  if (ignoredCustomerIds.length > 0) {
    const ignoredCustomers = filteredCustomers.filter(
      cus => ignoredCustomerIds.indexOf(cus._id) !== -1
    );

    await Logs.createLog(
      engageMessageId,
      'regular',
      `The following customers did not open emails frequently, therefore ignored: ${ignoredCustomers.map(
        i => i.primaryEmail
      )}`
    );
  }

  // set finalized count of the campaign
  await setCampaignCount({
    _id: engageMessageId,
    totalCustomersCount: filteredCustomers.length,
    validCustomersCount: cleanCustomers.length
  });

  for (const customer of cleanCustomers) {
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    await sendEmail(customer);

    try {
      await messageBroker().sendMessage('putActivityLog', {
        action: ACTIVITY_LOG_ACTIONS.SEND_EMAIL_CAMPAIGN,
        data: {
          action: 'send',
          contentType: 'campaign',
          contentId: customer._id,
          content: {
            campaignId: engageMessageId,
            title,
            to: customer.primaryEmail,
            type: ACTIVITY_CONTENT_TYPES.EMAIL
          },
          createdBy
        }
      });
    } catch (e) {
      await Logs.createLog(
        engageMessageId,
        'regular',
        `Error occured while creating activity log "${customer.primaryEmail}"`
      );
    }
  } // end for loop
};

// sends bulk sms via engage message
export const sendBulkSms = async (data: ISmsParams) => {
  const {
    customers,
    engageMessageId,
    shortMessage,
    createdBy,
    title,
    kind
  } = data;

  const telnyxInfo = await getTelnyxInfo();
  const smsLimit = await getConfig('smsLimit', 0);

  const validCustomers = customers.filter(
    c => c.primaryPhone && c.phoneValidationStatus === 'valid'
  );

  if (kind === CAMPAIGN_KINDS.AUTO) {
    if (!smsLimit) {
      await Logs.createLog(
        engageMessageId,
        'regular',
        `Auto campaign SMS limit is not set: "${smsLimit}"`
      );

      return;
    }

    if (smsLimit && validCustomers.length > smsLimit) {
      await Logs.createLog(
        engageMessageId,
        'regular',
        `Chosen "${validCustomers.length}" customers exceeded sms limit "${smsLimit}". Campaign will not run.`
      );

      return;
    }
  }

  if (validCustomers.length > 0) {
    await Logs.createLog(
      engageMessageId,
      'regular',
      `Preparing to send SMS to "${validCustomers.length}" customers`
    );
  }

  await setCampaignCount({
    _id: engageMessageId,
    totalCustomersCount: customers.length,
    validCustomersCount: validCustomers.length
  });

  for (const customer of validCustomers) {
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    const msg = await prepareMessage({
      shortMessage,
      to: customer.primaryPhone,
      integrations: telnyxInfo.integrations
    });

    try {
      await telnyxInfo.instance.messages.create(
        msg,
        async (err: any, res: any) => {
          await handleMessageCallback(err, res, { engageMessageId, msg });
        }
      ); // end sms creation
    } catch (e) {
      await Logs.createLog(
        engageMessageId,
        'failure',
        `${e.message} while sending to "${msg.to}"`
      );
    }

    try {
      await messageBroker().sendMessage('putActivityLog', {
        action: ACTIVITY_LOG_ACTIONS.SEND_SMS_CAMPAIGN,
        data: {
          action: 'send',
          contentType: 'campaign',
          contentId: customer._id,
          content: {
            campaignId: engageMessageId,
            title,
            to: customer.primaryPhone,
            type: ACTIVITY_CONTENT_TYPES.SMS
          },
          createdBy
        }
      });
    } catch (e) {
      await Logs.createLog(
        engageMessageId,
        'regular',
        `Error occured while creating activity log "${customer.primaryPhone}"`
      );
    }
  } // end customers loop
}; // end sendBuklSms()
