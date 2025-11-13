import { checkPermission } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IEngageMessage } from '~/modules/broadcast/@types/types';
import { CAMPAIGN_KINDS } from '~/modules/broadcast/constants';
import { checkCampaignDoc } from '~/modules/broadcast/engageUtils';
import { awsRequests } from '~/modules/broadcast/trackers.ts/engageTracker';
import {
  createTransporter,
  getEditorAttributeUtil,
} from '~/modules/broadcast/utils';

interface IEngageMessageEdit extends IEngageMessage {
  _id: string;
}

const MODULE_ENGAGE = 'engage';

interface ITestEmailParams {
  from: string;
  to: string;
  content: string;
  title: string;
}

/**
 * These fields contain too much data & it's inappropriate
 * to save such data in each log row
 */
const emptyCustomers = {
  customerIds: [],
  messengerReceivedCustomerIds: [],
};

const engageMutations = {
  /**
   * Create new message
   */
  async engageMessageAdd(
    _root,
    doc: IEngageMessage,
    { user, docModifier, models, subdomain }: IContext,
  ) {
    await checkCampaignDoc(models, subdomain, doc);

    // fromUserId is not required in sms engage, so set it here
    if (!doc.fromUserId) {
      doc.fromUserId = user._id;
    }

    const engageMessage = await models.EngageMessages.createEngageMessage(
      docModifier({ ...doc, createdBy: user._id }),
    );

    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'webhooks',
      action: 'sendToWebhook',
      input: {
        action: 'create',
        type: 'engages:engageMessages',
        params: engageMessage,
      },
    });

    // await send(models, subdomain, engageMessage, doc.forceCreateConversation);

    return engageMessage;
  },

  /**
   * Edit message
   */
  async engageMessageEdit(
    _root,
    { _id, ...doc }: IEngageMessageEdit,
    { models, subdomain, user }: IContext,
  ) {
    await checkCampaignDoc(models, subdomain, doc);

    const engageMessage = await models.EngageMessages.getEngageMessage(_id);
    const updated = await models.EngageMessages.updateEngageMessage(_id, doc);

    // run manually when it was draft & live afterwards
    if (
      !engageMessage.isLive &&
      doc.isLive &&
      doc.kind === CAMPAIGN_KINDS.MANUAL
    ) {
      // await send(models, subdomain, updated);
    }

    return models.EngageMessages.findOne({ _id });
  },

  /**
   * Remove message
   */
  async engageMessageRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return await models.EngageMessages.removeEngageMessage(_id);
  },

  /**
   * Engage message set live
   */
  async engageMessageSetLive(
    _root: undefined,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext,
  ) {
    const campaign = await models.EngageMessages.getEngageMessage(_id);

    if (campaign.isLive) {
      throw new Error('Campaign is already live');
    }

    await checkCampaignDoc(models, subdomain, campaign);

    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'onboardHistory',
      action: 'register',
      input: {
        type: 'setCampaignLive',
        user,
      },
      defaultValue: null,
    });

    return models.EngageMessages.engageMessageSetLive(_id);
  },

  /**
   * Engage message set pause
   */
  async engageMessageSetPause(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return await models.EngageMessages.engageMessageSetPause(_id);
  },

  /**
   * Engage message set live manual
   */
  async engageMessageSetLiveManual(
    _root: undefined,
    { _id }: { _id: string },
    { models, subdomain }: IContext,
  ) {
    const draftCampaign = await models.EngageMessages.getEngageMessage(_id);

    await checkCampaignDoc(models, subdomain, draftCampaign);

    return await models.EngageMessages.engageMessageSetLive(_id);
  },

  async engagesUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    // await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },

  /**
   * Engage message verify email
   */
  async engageMessageVerifyEmail(
    _root: undefined,
    { email }: { email: string },
    { models }: IContext,
  ) {
    const response = await awsRequests.verifyEmail(models, email);

    return JSON.stringify(response);
  },

  /**
   * Engage message remove verified email
   */
  async engageMessageRemoveVerifiedEmail(
    _root: undefined,
    { email }: { email: string },
    { models }: IContext,
  ) {
    const response = await awsRequests.removeVerifiedEmail(models, email);

    return JSON.stringify(response);
  },

  async engageMessageSendTestEmail(
    _root: undefined,
    args: ITestEmailParams,
    { subdomain, models }: IContext,
  ) {
    const { content, from, to, title } = args;
    if (!(content && from && to && title)) {
      throw new Error(
        'Email content, title, from address or to address is missing',
      );
    }

    let replacedContent = content;

    const emails = to.split(',');
    if (emails.length > 1) {
      throw new Error('Test email can only be sent to one recipient');
    }

    const targetUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: { email: to },
      defaultValue: null,
    });

    const fromUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'fromUser',
      action: 'findOne',
      input: { email: from },
      defaultValue: null,
    });

    if (!targetUser && !fromUser) {
      throw new Error('User not found');
    }

    const attributeUtil = await getEditorAttributeUtil(subdomain);

    replacedContent = await attributeUtil.replaceAttributes({
      content,
      user: targetUser,
    });

    try {
      const transporter = await createTransporter(models);
      const response = await transporter.sendMail({
        from,
        to,
        subject: title,
        html: content,
        content: replacedContent,
      });
      return JSON.stringify(response);
    } catch (e) {
      console.log(e);

      return e;
    }
  },

  // Helps users fill less form fields to create a campaign
  async engageMessageCopy(
    _root: undefined,
    { _id }: { _id },
    { docModifier, models, user }: IContext,
  ) {
    const sourceCampaign = await models.EngageMessages.getEngageMessage(_id);

    const doc = docModifier({
      ...sourceCampaign.toObject(),
      createdAt: new Date(),
      createdBy: user._id,
      title: `${sourceCampaign.title} - duplicated`,
      isDraft: true,
      isLive: false,
      runCount: 0,
      totalCustomersCount: 0,
      validCustomersCount: 0,
    });

    delete doc._id;

    if (doc.scheduleDate && doc.scheduleDate.dateTime) {
      // schedule date should be manually set
      doc.scheduleDate.dateTime = null;
    }

    return await models.EngageMessages.createEngageMessage(doc);
  },

  /**
   * Send mail
   */
  async engageSendMail(
    _root: undefined,
    args: any,
    { user, subdomain }: IContext,
  ) {
    const { body, customerId, ...doc } = args;
    const customerQuery = customerId
      ? { _id: customerId }
      : { primaryEmail: doc.to };

    const customer = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customer',
      action: 'findOne',
      input: { query: { _id: { $in: customerId } } },
    });

    doc.body = body || '';

    try {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'emails',
        action: 'sendEmail',
        input: {
          fromEmail: doc.from || '',
          email: {
            content: doc.body,
            subject: doc.subject,
            attachments: doc.attachments,
            sender: doc.from || '',
            cc: doc.cc || [],
            bcc: doc.bcc || [],
          },
          customers: [customer],
          customer,
          createdBy: user._id,
          title: doc.subject,
        },
      });
    } catch (e) {
      console.log(e);
      throw e;
    }

    const customerIds = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'getCustomerIds',
      input: {
        primaryEmail: { $in: doc.to },
      },
      defaultValue: [],
    });

    doc.userId = user._id;

    for (const cusId of customerIds) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'emailDeliveries',
        action: 'create',
        input: {
          ...doc,
          customerId: cusId,
          kind: 'transaction',
          status: 'pending',
        },
      });
    }

    if (doc.integrationId) {
      try {
        const imapSendMail = await sendTRPCMessage({
          subdomain,
          pluginName: 'imap',
          method: 'mutation',
          module: 'imapMessage',
          action: 'create',
          input: {
            ...doc,
          },
        });
        return imapSendMail;
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
    return;
  },
};

checkPermission(engageMutations, 'engageMessageAdd', 'engageMessageAdd');
checkPermission(engageMutations, 'engageSendMail', 'engageMessageAdd');
checkPermission(engageMutations, 'engageMessageEdit', 'engageMessageEdit');
checkPermission(engageMutations, 'engageMessageRemove', 'engageMessageRemove');
checkPermission(
  engageMutations,
  'engageMessageSetLive',
  'engageMessageSetLive',
);
checkPermission(
  engageMutations,
  'engageMessageSetPause',
  'engageMessageSetPause',
);
checkPermission(
  engageMutations,
  'engageMessageSetLiveManual',
  'engageMessageSetLiveManual',
);
checkPermission(
  engageMutations,
  'engageMessageVerifyEmail',
  'engageMessageRemove',
);
checkPermission(
  engageMutations,
  'engageMessageRemoveVerifiedEmail',
  'engageMessageRemove',
);

checkPermission(
  engageMutations,
  'engageMessageSendTestEmail',
  'engageMessageRemove',
);

checkPermission(engageMutations, 'engageMessageCopy', 'engageMessageAdd');

export default engageMutations;
