import { IEngageMessage } from '@/broadcast/@types';
import { CAMPAIGN_KINDS } from '@/broadcast/constants';
import { awsRequests } from '@/broadcast/trackers';
import {
  checkCampaignDoc,
  createTransporter,
  getEditorAttributeUtil,
  send,
  updateConfigs,
} from '@/broadcast/utils';
import { IContext } from '~/connectionResolvers';

export const engageMutations = {
  /**
   * Create new message
   */
  async engageMessageAdd(
    _root,
    doc: IEngageMessage,
    { user, models, subdomain }: IContext,
  ) {
    await checkCampaignDoc(models, doc);

    // fromUserId is not required in sms engage, so set it here
    if (!doc.fromUserId) {
      doc.fromUserId = user._id;
    }

    const engageMessage = await models.EngageMessages.createEngageMessage({
      ...doc,
      createdBy: user._id,
    });

    await send(models, subdomain, engageMessage, doc.forceCreateConversation);

    return engageMessage;
  },

  /**
   * Edit message
   */
  async engageMessageEdit(
    _root,
    { _id, ...doc }: { _id: string } & IEngageMessage,
    { models, subdomain }: IContext,
  ) {
    await checkCampaignDoc(models, doc);

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
    return models.EngageMessages.removeEngageMessage(_id);
  },

  /**
   * Engage message set live
   */
  async engageMessageSetLive(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const campaign = await models.EngageMessages.getEngageMessage(_id);

    if (campaign.isLive) {
      throw new Error('Campaign is already live');
    }

    await checkCampaignDoc(models, campaign);

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

    await checkCampaignDoc(models, draftCampaign);

    const live = await models.EngageMessages.engageMessageSetLive(_id);

    await send(models, subdomain, live);

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
    args: {
      from: string;
      to: string;
      content: string;
      title: string;
    },
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

    const targetUser = await models.Users.findOne({ email: to });

    const fromUser = await models.Users.findOne({ email: from });

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
    { models, user }: IContext,
  ) {
    const sourceCampaign = await models.EngageMessages.getEngageMessage(_id);

    const doc = {
      ...sourceCampaign.toObject(),
      createdAt: new Date(),
      createdBy: user._id,
      title: `${sourceCampaign.title} - duplicated`,
      isDraft: true,
      isLive: false,
      runCount: 0,
      totalCustomersCount: 0,
      validCustomersCount: 0,
    };

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
    { user, models }: IContext,
  ) {
    const { body, customerId, ...doc } = args;

    const customerQuery = customerId
      ? { _id: customerId }
      : { primaryEmail: doc.to };

    const customer = await models.Customers.findOne(customerQuery);

    doc.body = body || '';

    try {
      // TODO: uncomment
      //   await sendTRPCMessage({
      //     subdomain,
      //     pluginName: 'core',
      //     method: 'mutation',
      //     module: 'emails',
      //     action: 'sendEmail',
      //     input: {
      //       fromEmail: doc.from || '',
      //       email: {
      //         content: doc.body,
      //         subject: doc.subject,
      //         attachments: doc.attachments,
      //         sender: doc.from || '',
      //         cc: doc.cc || [],
      //         bcc: doc.bcc || [],
      //       },
      //       customers: [customer],
      //       customer,
      //       createdBy: user._id,
      //       title: doc.subject,
      //     },
      //   });
    } catch (e) {
      console.log(e);
      throw e;
    }

    const customerIds = await models.Customers.find({
      primaryEmail: { $in: doc.to },
    }).distinct('_id');

    doc.userId = user._id;

    for (const cusId of customerIds) {
      await models.EmailDeliveries.create({
        ...doc,
        customerId: cusId,
        kind: 'transaction',
        status: 'pending',
      });
    }

    // TODO: uncomment
    // if (doc.integrationId) {
    //   try {
    //     const imapSendMail = await sendTRPCMessage({
    //       subdomain,
    //       pluginName: 'frontline',
    //       method: 'mutation',
    //       module: 'imap',
    //       action: 'create',
    //       input: {
    //         ...doc,
    //       },
    //     });
    //     return imapSendMail;
    //   } catch (e) {
    //     console.log(e);
    //     throw e;
    //   }
    // }
    return;
  },
};
