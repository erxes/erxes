import { IEngageMessage } from '@/broadcast/@types';
import {
  checkCampaignDoc,
  createCampaignAutomation,
  findCampaignAutomation,
  getEditorAttributeUtil,
  isWorkflowCampaign,
  removeCampaignAutomations,
  sendBroadcast,
  setCampaignAutomationFlow,
  sendEngageEmail,
  setCampaignAutomationStatus,
  updateConfigs,
} from '@/broadcast/utils';
import {
  getBroadcastCacheKey,
  getBroadcastEmailConfig,
} from '@/broadcast/utils/outboundEmail';
import { AUTOMATION_STATUSES } from 'erxes-api-shared/core-modules';
import { deliverEmail, ISingleSenderInput } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { TEmailScope } from '~/utils/email/scope';
import { createDeliveryLogPort } from '~/utils/email/ports';
import { removeVerifiedSender, verifySender } from '~/utils/email/senders';

export const engageMutations = {
  /**
   * Create new message
   */
  async engageMessageAdd(
    _root,
    doc: IEngageMessage,
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastCreate');

    const { isLive, isDraft } = doc || {};

    await checkCampaignDoc(models, doc);

    const { workflow, ...campaignDoc } = doc;

    const engageMessage = await models.EngageMessages.createEngageMessage({
      ...campaignDoc,
      createdBy: user._id,
    });

    if (isWorkflowCampaign(doc.method)) {
      await createCampaignAutomation(models, {
        campaignId: engageMessage._id,
        title: engageMessage.title,
        userId: user._id,
        actions: workflow?.actions,
        entryActionId: workflow?.entryActionId,
      });
    }

    if (isLive && !isDraft) {
      // Mirrors `engageMessageSetLive`: a campaign created live must not leave
      // the automation it owns sitting in draft.
      if (isWorkflowCampaign(doc.method)) {
        await setCampaignAutomationStatus(
          models,
          engageMessage._id,
          AUTOMATION_STATUSES.ACTIVE,
          user._id,
        );
      }

      sendBroadcast({ models, subdomain, engageMessage });
    }

    return engageMessage;
  },

  /**
   * Edit message
   */
  async engageMessageEdit(
    _root,
    { _id, ...doc }: { _id: string } & IEngageMessage,
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    await checkCampaignDoc(models, { ...doc, _id });

    const { workflow, ...campaignDoc } = doc;

    const engageMessage = await models.EngageMessages.getEngageMessage(_id);
    const updated = await models.EngageMessages.updateEngageMessage(
      _id,
      campaignDoc,
    );

    if (isWorkflowCampaign(updated.method) && workflow) {
      await setCampaignAutomationFlow(models, _id, workflow);
    }

    // run manually when it was draft & live afterwards
    if (!engageMessage.isLive && doc.isLive) {
      if (isWorkflowCampaign(updated.method)) {
        await setCampaignAutomationStatus(
          models,
          _id,
          AUTOMATION_STATUSES.ACTIVE,
          user._id,
        );
      }

      sendBroadcast({ models, subdomain, engageMessage: updated });
    }

    return models.EngageMessages.findOne({ _id });
  },

  /**
   * Remove message
   */
  async engageMessageRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastDelete');

    await removeCampaignAutomations(models, _ids);

    return models.EngageMessages.removeEngageMessage(_ids);
  },

  /**
   * Engage message set live
   */
  async engageMessageSetLive(
    _root: undefined,
    { _id }: { _id: string },
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    const campaign = await models.EngageMessages.getEngageMessage(_id);

    if (campaign.isLive) {
      throw new Error('Campaign is already live');
    }

    await checkCampaignDoc(models, campaign);

    const live = await models.EngageMessages.engageMessageSetLive(_id);

    if (isWorkflowCampaign(live.method)) {
      await setCampaignAutomationStatus(
        models,
        _id,
        AUTOMATION_STATUSES.ACTIVE,
        user._id,
      );
    }

    sendBroadcast({ models, subdomain, engageMessage: live });

    return live;
  },

  /**
   * Engage message set pause
   */
  async engageMessageSetPause(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    const paused = await models.EngageMessages.engageMessageSetPause(_id);

    if (isWorkflowCampaign(paused.method)) {
      await setCampaignAutomationStatus(models, _id, AUTOMATION_STATUSES.DRAFT);
    }

    return paused;
  },

  /**
   * Engage message set live manual
   */
  async engageMessageSetLiveManual(
    _root: undefined,
    { _id }: { _id: string },
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    const draftCampaign = await models.EngageMessages.getEngageMessage(_id);

    await checkCampaignDoc(models, draftCampaign);

    const live = await models.EngageMessages.engageMessageSetLive(_id);

    if (isWorkflowCampaign(live.method)) {
      await setCampaignAutomationStatus(
        models,
        _id,
        AUTOMATION_STATUSES.ACTIVE,
      );
    }

    sendBroadcast({ models, subdomain, engageMessage: live });

    return live;
  },

  async broadcastUpdateConfigs(
    _root,
    { configsMap },
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastConfigsManage');

    await updateConfigs(models, subdomain, configsMap);

    return { status: 'ok' };
  },

  /**
   * Engage message verify email
   */
  async engageMessageVerifyEmail(
    _root: undefined,
    { scope, ...input }: ISingleSenderInput & { scope?: TEmailScope },
    { models, subdomain }: IContext,
  ) {
    const response = await verifySender(models, subdomain, input, scope);

    return JSON.stringify(response);
  },

  /**
   * Engage message remove verified email
   */
  async engageMessageRemoveVerifiedEmail(
    _root: undefined,
    { email, scope }: { email: string; scope?: TEmailScope },
    { models }: IContext,
  ) {
    await removeVerifiedSender(models, email, scope);

    return JSON.stringify({ email });
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
      const response = await deliverEmail({
        cacheKey: getBroadcastCacheKey(models),
        config: await getBroadcastEmailConfig(models),
        message: {
          from,
          to: [to],
          subject: title,
          html: replacedContent || content,
        },
        log: createDeliveryLogPort(models),
        meta: { source: 'broadcast', userId: fromUser?._id, subdomain },
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
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastCreate');

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

    if (doc.scheduleDate?.dateTime) {
      // schedule date should be manually set
      doc.scheduleDate.dateTime = null;
    }

    const copy = await models.EngageMessages.createEngageMessage(doc);

    if (isWorkflowCampaign(copy.method)) {
      const source = await findCampaignAutomation(models, _id);

      await createCampaignAutomation(models, {
        campaignId: copy._id,
        title: copy.title,
        userId: user._id,
        // The copy gets its own snapshot of the flow, so editing either
        // campaign afterwards never changes the other.
        actions: source?.actions,
      });
    }

    return copy;
  },

  /**
   * Send mail
   */
  async engageSendMail(
    _root: undefined,
    args: any,
    { user, models, subdomain }: IContext,
  ) {
    const { body, customerId, ...doc } = args;

    const customerQuery = customerId
      ? { _id: customerId }
      : { primaryEmail: doc.to };

    const customer = await models.Customers.findOne(customerQuery);

    doc.body = body || '';

    try {
      await sendEngageEmail(subdomain, models, {
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
      });
    } catch (e) {
      console.log(e);
      throw e;
    }

    doc.userId = user._id;

    return;
  },
};
