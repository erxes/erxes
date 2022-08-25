import { IModels } from './connectionResolver';
import {
  ACTIVITY_CONTENT_TYPES,
  ACTIVITY_LOG_ACTIONS,
  CAMPAIGN_KINDS
} from './constants';
import { debugEngages, debugError } from './debuggers';
import { prepareEmailParams } from './emailUtils';
import messageBroker from './messageBroker';
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
  setCampaignCount
} from './utils';

export const start = async (
  models: IModels,
  subdomain: string,
  data: IEmailParams
) => {
  const { engageMessageId, customers = [], createdBy, title } = data;

  const configs = await getConfigs(models);

  await models.Stats.findOneAndUpdate(
    { engageMessageId },
    { engageMessageId },
    { upsert: true }
  );

  const transporter = await createTransporter(models);

  const sendCampaignEmail = async (customer: ICustomer) => {
    try {
      await transporter.sendMail(
        prepareEmailParams(customer, data, configs.configSet)
      );

      const msg = `Sent email to: ${customer.primaryEmail}`;

      debugEngages(msg);

      await models.Logs.createLog(engageMessageId, 'success', msg);

      await models.Stats.updateOne({ engageMessageId }, { $inc: { total: 1 } });
    } catch (e) {
      debugError(e.message);

      await models.Logs.createLog(
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

  let filteredCustomers: ICustomer[] = [];
  let emails: string[] = [];

  if (customers.length > unverifiedEmailsLimit) {
    await models.Logs.createLog(
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
  } = await cleanIgnoredCustomers(subdomain, models, {
    customers: filteredCustomers,
    engageMessageId
  });

  // finalized email list
  emails = cleanCustomers.map(customer => customer.primaryEmail);

  await models.Logs.createLog(
    engageMessageId,
    'regular',
    `Preparing to send emails to ${emails.length}: ${emails}`
  );

  if (ignoredCustomerIds.length > 0) {
    const ignoredCustomers = filteredCustomers.filter(
      cus => ignoredCustomerIds.indexOf(cus._id) !== -1
    );

    await models.Logs.createLog(
      engageMessageId,
      'regular',
      `The following customers did not open emails frequently, therefore ignored: ${ignoredCustomers.map(
        i => i.primaryEmail
      )}`
    );
  }

  // set finalized count of the campaign
  await setCampaignCount(models, {
    _id: engageMessageId,
    totalCustomersCount: filteredCustomers.length,
    validCustomersCount: cleanCustomers.length
  });

  for (const customer of cleanCustomers) {
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    await sendCampaignEmail(customer);

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
      await models.Logs.createLog(
        engageMessageId,
        'regular',
        `Error occured while creating activity log "${customer.primaryEmail}"`
      );
    }
  } // end for loop
};

// sends bulk sms via engage message
export const sendBulkSms = async (
  models: IModels,
  subdomain: string,
  data: ISmsParams
) => {
  const {
    customers,
    engageMessageId,
    shortMessage,
    createdBy,
    title,
    kind
  } = data;

  const telnyxInfo = await getTelnyxInfo(subdomain);
  const smsLimit = await getConfig(models, 'smsLimit', 0);

  const validCustomers = customers.filter(
    c => c.primaryPhone && c.phoneValidationStatus === 'valid'
  );

  if (kind === CAMPAIGN_KINDS.AUTO) {
    if (!smsLimit) {
      await models.Logs.createLog(
        engageMessageId,
        'regular',
        `Auto campaign SMS limit is not set: "${smsLimit}"`
      );

      return;
    }

    if (smsLimit && validCustomers.length > smsLimit) {
      await models.Logs.createLog(
        engageMessageId,
        'regular',
        `Chosen "${validCustomers.length}" customers exceeded sms limit "${smsLimit}". Campaign will not run.`
      );

      return;
    }
  }

  if (validCustomers.length > 0) {
    await models.Logs.createLog(
      engageMessageId,
      'regular',
      `Preparing to send SMS to "${validCustomers.length}" customers`
    );
  }

  await setCampaignCount(models, {
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
          await handleMessageCallback(models, err, res, {
            engageMessageId,
            msg
          });
        }
      ); // end sms creation
    } catch (e) {
      await models.Logs.createLog(
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
      await models.Logs.createLog(
        engageMessageId,
        'regular',
        `Error occured while creating activity log "${customer.primaryPhone}"`
      );
    }
  } // end customers loop
}; // end sendBuklSms()

export const sendEmail = async (models: IModels, data: any) => {
  const transporter = await createTransporter(models);
  const { customer } = data;
  const configs = await getConfigs(models);

  try {
    await transporter.sendMail(
      prepareEmailParams(customer, data, configs.configSet)
    );

    debugEngages(`Sent email to: ${customer.primaryEmail}`);
  } catch (e) {
    debugError(
      `Error occurred while sending email to ${customer.primaryEmail}: ${e.message}`
    );
  }
};
