import { debugError, debugInfo } from '@erxes/api-utils/src/debuggers';
import { sendMessage } from '@erxes/api-utils/src/messageBroker';
import { getEnv } from '@erxes/api-utils/src';
import { IModels } from './connectionResolver';
import { ACTIVITY_CONTENT_TYPES, CAMPAIGN_KINDS } from './constants';
import { prepareEmailParams } from './emailUtils';
import {
  getTelnyxInfo,
  handleMessageCallback,
  prepareMessage,
} from './telnyxUtils';
import { ICustomer, IEmailParams, ISmsParams } from './types';
import {
  createTransporter,
  getConfig,
  getConfigs,
  getValueAsString,
  setCampaignCount,
} from './utils';

export const start = async (
  models: IModels,
  subdomain: string,
  data: IEmailParams
) => {
  const {
    engageMessageId,
    customers = [],
    createdBy,
    title,
    fromEmail,
    email,
  } = data;

  const configs = await getConfigs(models);
  const configSet = await getValueAsString(
    models,
    "configSet",
    "AWS_SES_CONFIG_SET",
    "erxes"
  );

  await models.Stats.findOneAndUpdate(
    { engageMessageId },
    { engageMessageId },
    { upsert: true }
  );

  if (!(fromEmail || email.sender)) {
    const msg = `Sender email address missing: ${fromEmail}/${email.sender}`;

    await models.Logs.createLog(engageMessageId, 'failure', msg);

    return;
  }

  const transporter = await createTransporter(models);

  const sendCampaignEmail = async (customer: ICustomer) => {
    try {
      await transporter.sendMail(
        prepareEmailParams(subdomain, customer, data, configSet)
      );

      const msg = `Sent email to: ${customer.primaryEmail}`;

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
      (c) => c.primaryEmail && c.emailValidationStatus === 'valid'
    );
  } else {
    filteredCustomers = customers;
  }

  const malformedEmails = filteredCustomers
    .filter((c) => !c.primaryEmail.includes('@'))
    .map((c) => c.primaryEmail);

  if (malformedEmails.length > 0) {
    await models.Logs.createLog(
      engageMessageId,
      'regular',
      `The following (${malformedEmails.length}) emails were malformed and will be ignored: ${malformedEmails}`
    );
  }

  // customer email can come as malformed
  filteredCustomers = filteredCustomers.filter((c) =>
    c.primaryEmail.includes('@')
  );

  // finalized email list
  emails = filteredCustomers.map((customer) => customer.primaryEmail);

  await models.Logs.createLog(
    engageMessageId,
    'regular',
    `Preparing to send emails to ${emails.length}: ${emails}`
  );

  // set finalized count of the campaign
  await setCampaignCount(models, {
    _id: engageMessageId,
    totalCustomersCount: filteredCustomers.length,
    validCustomersCount: filteredCustomers.length,
  });

  for (const customer of filteredCustomers) {
    // multiple customers could have same emails, so check before sending
    const delivery = await models.DeliveryReports.findOne({
      engageMessageId,
      email: customer.primaryEmail,
    });

    if (delivery) {
      await models.Logs.createLog(
        engageMessageId,
        'regular',
        `Email has already been sent to ${delivery.email} before. (${delivery.customerId} / ${delivery.customerName})`
      );

      continue;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    await sendCampaignEmail(customer);

    try {
      await sendMessage('putActivityLog', {
        subdomain,
        data: {
          action: 'send',
          contentType: 'campaign',
          contentId: customer._id,
          content: {
            campaignId: engageMessageId,
            title,
            to: customer.primaryEmail,
            type: ACTIVITY_CONTENT_TYPES.EMAIL,
          },
          createdBy,
        },
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
  const { customers, engageMessageId, shortMessage, createdBy, title, kind } =
    data;

  const telnyxInfo = await getTelnyxInfo(subdomain);
  const smsLimit = await getConfig(models, 'smsLimit', 0);

  const validCustomers = customers.filter(
    (c) => c.primaryPhone && c.phoneValidationStatus === 'valid'
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
    validCustomersCount: validCustomers.length,
  });

  for (const customer of validCustomers) {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    const msg = await prepareMessage({
      shortMessage,
      to: customer.primaryPhone,
      integrations: telnyxInfo.integrations,
    });

    try {
      await telnyxInfo.instance.messages.create(
        msg,
        async (err: any, res: any) => {
          await handleMessageCallback(models, err, res, {
            engageMessageId,
            msg,
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
      await sendMessage('putActivityLog', {
        subdomain,
        data: {
          action: 'send',
          contentType: 'campaign',
          contentId: customer._id,
          content: {
            campaignId: engageMessageId,
            title,
            to: customer.primaryPhone,
            type: ACTIVITY_CONTENT_TYPES.SMS,
          },
          createdBy,
        },
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

export const sendEmail = async (
  subdomain: string,
  models: IModels,
  data: any
) => {
  const transporter = await createTransporter(models);
  const { customer } = data;

  const configSet = await getValueAsString(
    models,
    "configSet",
    "AWS_SES_CONFIG_SET",
    "erxes"
  );

  try {
    await transporter.sendMail(
      prepareEmailParams(subdomain, customer, data, configSet)
    );

    debugInfo(`Sent email to: ${customer?.primaryEmail}`);
  } catch (e) {
    debugError(
      `Error occurred while sending email to ${customer?.primaryEmail}: ${e.message}`
    );
  }
};
