import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';

import { IEngageMessage } from '../../models/definitions/engages';
import { CAMPAIGN_KINDS } from '../../constants';
import { checkCampaignDoc, send } from '../../engageUtils';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendLogsMessage,
  sendToWebhook
} from '../../messageBroker';
import {
  updateConfigs,
  createTransporter,
  getEditorAttributeUtil
} from '../../utils';
import { awsRequests } from '../../trackers/engageTracker';
import { debug } from '../../configs';
import { sendEmail } from '../../sender';

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
  messengerReceivedCustomerIds: []
};

const engageMutations = {
  /**
   * Create new message
   */
  async engageMessageAdd(
    _root,
    doc: IEngageMessage,
    { user, docModifier, models, subdomain }: IContext
  ) {
    await checkCampaignDoc(models, subdomain, doc);

    // fromUserId is not required in sms engage, so set it here
    if (!doc.fromUserId) {
      doc.fromUserId = user._id;
    }

    const engageMessage = await models.EngageMessages.createEngageMessage(
      docModifier({ ...doc, createdBy: user._id })
    );

    await sendToWebhook({
      subdomain,
      data: {
        action: 'create',
        type: 'engages:engageMessages',
        params: engageMessage
      }
    });

    await send(models, subdomain, engageMessage, doc.forceCreateConversation);

    const logDoc = {
      type: MODULE_ENGAGE,
      newData: {
        ...doc,
        ...emptyCustomers
      },
      object: {
        ...engageMessage.toObject(),
        ...emptyCustomers
      }
    };

    await putCreateLog(subdomain, logDoc, user);

    return engageMessage;
  },

  /**
   * Edit message
   */
  async engageMessageEdit(
    _root,
    { _id, ...doc }: IEngageMessageEdit,
    { models, subdomain, user }: IContext
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
      await send(models, subdomain, updated);
    }

    const logDoc = {
      type: MODULE_ENGAGE,
      object: { ...engageMessage.toObject(), ...emptyCustomers },
      newData: { ...updated.toObject(), ...emptyCustomers },
      updatedDocument: updated
    };

    await putUpdateLog(subdomain, logDoc, user);

    return models.EngageMessages.findOne({ _id });
  },

  /**
   * Remove message
   */
  async engageMessageRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext
  ) {
    const engageMessage = await models.EngageMessages.getEngageMessage(_id);

    const removed = await models.EngageMessages.removeEngageMessage(_id);

    const logDoc = {
      type: MODULE_ENGAGE,
      object: { ...engageMessage.toObject(), ...emptyCustomers }
    };

    await putDeleteLog(subdomain, logDoc, user);

    return removed;
  },

  /**
   * Engage message set live
   */
  async engageMessageSetLive(
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext
  ) {
    const campaign = await models.EngageMessages.getEngageMessage(_id);

    if (campaign.isLive) {
      throw new Error('Campaign is already live');
    }

    await checkCampaignDoc(models, subdomain, campaign);

    return models.EngageMessages.engageMessageSetLive(_id);
  },

  /**
   * Engage message set pause
   */
  engageMessageSetPause(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.EngageMessages.engageMessageSetPause(_id);
  },

  /**
   * Engage message set live manual
   */
  async engageMessageSetLiveManual(
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext
  ) {
    const draftCampaign = await models.EngageMessages.getEngageMessage(_id);

    await checkCampaignDoc(models, subdomain, draftCampaign);

    const live = await models.EngageMessages.engageMessageSetLive(_id);

    await send(models, subdomain, live);

    await putUpdateLog(
      subdomain,
      {
        type: MODULE_ENGAGE,
        newData: {
          isLive: true,
          isDraft: false
        },
        object: {
          _id,
          isLive: draftCampaign.isLive,
          isDraft: draftCampaign.isDraft
        },
        description: `Campaign "${draftCampaign.title}" has been set live`
      },
      user
    );

    return live;
  },

  async engagesUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },

  /**
   * Engage message verify email
   */
  async engageMessageVerifyEmail(
    _root,
    { email }: { email: string },
    { models }: IContext
  ) {
    const response = await awsRequests.verifyEmail(models, email);

    return JSON.stringify(response);
  },

  /**
   * Engage message remove verified email
   */
  async engageMessageRemoveVerifiedEmail(
    _root,
    { email }: { email: string },
    { models }: IContext
  ) {
    const response = await awsRequests.removeVerifiedEmail(models, email);

    return JSON.stringify(response);
  },

  async engageMessageSendTestEmail(
    _root,
    args: ITestEmailParams,
    { subdomain, models }: IContext
  ) {
    const { content, from, to, title } = args;

    if (!(content && from && to && title)) {
      throw new Error(
        'Email content, title, from address or to address is missing'
      );
    }

    let replacedContent = content;

    const customer = await sendContactsMessage({
      isRPC: true,
      subdomain,
      action: 'customers.findOne',
      data: { customerPrimaryEmail: to }
    });

    const targetUser = await sendCoreMessage({
      data: { email: to },
      action: 'users.findOne',
      subdomain,
      isRPC: true
    });

    const attributeUtil = await getEditorAttributeUtil(subdomain);

    replacedContent = await attributeUtil.replaceAttributes({
      content,
      customer,
      user: targetUser
    });

    try {
      const transporter = await createTransporter(models);

      const response = await transporter.sendMail({
        from,
        to,
        subject: title,
        html: content,
        content: replacedContent
      });

      return JSON.stringify(response);
    } catch (e) {
      debug.error(e.message);

      return e;
    }
  },

  // Helps users fill less form fields to create a campaign
  async engageMessageCopy(
    _root,
    { _id }: { _id },
    { docModifier, models, subdomain, user }: IContext
  ) {
    const sourceCampaign = await models.EngageMessages.getEngageMessage(_id);

    const doc = docModifier({
      ...sourceCampaign.toObject(),
      createdAt: new Date(),
      createdBy: user._id,
      title: `${sourceCampaign.title}-copied`,
      isDraft: true,
      isLive: false,
      runCount: 0,
      totalCustomersCount: 0,
      validCustomersCount: 0
    });

    delete doc._id;

    if (doc.scheduleDate && doc.scheduleDate.dateTime) {
      // schedule date should be manually set
      doc.scheduleDate.dateTime = null;
    }

    const copy = await models.EngageMessages.createEngageMessage(doc);

    await putCreateLog(
      subdomain,
      {
        type: MODULE_ENGAGE,
        newData: {
          ...doc,
          ...emptyCustomers
        },
        object: {
          ...copy.toObject(),
          ...emptyCustomers
        },
        description: `Campaign "${sourceCampaign.title}" has been copied`
      },
      user
    );

    return copy;
  },

  /**
   * Send mail
   */
  async engageSendMail(
    _root,
    args: any,
    { user, models, subdomain }: IContext
  ) {
    const { body, customerId, ...doc } = args;

    const customerQuery = customerId
      ? { _id: customerId }
      : { primaryEmail: doc.to };

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: customerQuery,
      isRPC: true
    });

    doc.body = body || '';

    try {
      await sendEmail(models, {
        fromEmail: doc.from || '',
        email: {
          content: doc.body,
          subject: doc.subject,
          attachments: doc.attachments,
          sender: doc.from || '',
          cc: doc.cc || [],
          bcc: doc.bcc || []
        },
        customers: [customer],
        customer,
        createdBy: user._id,
        title: doc.subject
      });
    } catch (e) {
      debug.error(e);
      throw e;
    }

    const customerIds = await sendContactsMessage({
      subdomain,
      action: 'customers.getCustomerIds',
      data: {
        primaryEmail: { $in: doc.to }
      },
      isRPC: true
    });

    doc.userId = user._id;

    for (const cusId of customerIds) {
      await sendLogsMessage({
        subdomain,
        action: 'emailDeliveries.create',
        data: {
          ...doc,
          customerId: cusId,
          kind: 'transaction',
          status: 'pending'
        },
        isRPC: true
      });
    }

    return;
  }
};

checkPermission(engageMutations, 'engageMessageAdd', 'engageMessageAdd');
checkPermission(engageMutations, 'engageSendMail', 'engageMessageAdd');
checkPermission(engageMutations, 'engageMessageEdit', 'engageMessageEdit');
checkPermission(engageMutations, 'engageMessageRemove', 'engageMessageRemove');
checkPermission(
  engageMutations,
  'engageMessageSetLive',
  'engageMessageSetLive'
);
checkPermission(
  engageMutations,
  'engageMessageSetPause',
  'engageMessageSetPause'
);
checkPermission(
  engageMutations,
  'engageMessageSetLiveManual',
  'engageMessageSetLiveManual'
);
checkPermission(
  engageMutations,
  'engageMessageVerifyEmail',
  'engageMessageRemove'
);
checkPermission(
  engageMutations,
  'engageMessageRemoveVerifiedEmail',
  'engageMessageRemove'
);

checkPermission(
  engageMutations,
  'engageMessageSendTestEmail',
  'engageMessageRemove'
);

checkPermission(engageMutations, 'engageMessageCopy', 'engageMessageAdd');

export default engageMutations;
