import { IEngageMessage } from '@/broadcast/@types';
import { BROADCAST_APPROVAL_CONTENT_TYPES } from '@/broadcast/constants';
import {
  getEditorAttributeUtil,
  sendEngageEmail,
  updateConfigs,
} from '@/broadcast/utils';
import {
  getBroadcastCacheKey,
  getBroadcastEmailConfig,
} from '@/broadcast/utils/outboundEmail';
import { TBroadcastRecurrence } from '@/broadcast/utils/recurrence';
import { scheduledAt } from '@/broadcast/utils/schedule';
import {
  JSONContent,
  renderEmailContent,
  TEmailContentFormat,
} from 'erxes-api-shared/core-modules';
import { deliverEmail, ISingleSenderInput } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { TEmailScope } from '~/utils/email/scope';
import { createDeliveryLogPort } from '~/utils/email/ports';
import { removeVerifiedSender, verifySender } from '~/utils/email/senders';

// Whoever locks a campaign says who keeps access; no owner is named here, so
// its author cannot let themselves through a lock meant to hold them.
const assertCampaignAccess = async (
  { models, user }: Pick<IContext, 'models' | 'user'>,
  campaign: { _id: string },
  action: 'edit' | 'live',
) =>
  models.ApprovalLocks.assertAccess({
    user,
    contentType: BROADCAST_APPROVAL_CONTENT_TYPES.CAMPAIGN,
    contentId: campaign._id,
    action,
  });

export const engageMutations = {
  async engageMessageAdd(
    _root,
    doc: IEngageMessage,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastCreate');

    return models.EngageMessages.createCampaign(doc, user._id);
  },

  async engageMessageEdit(
    _root,
    { _id, ...doc }: { _id: string } & IEngageMessage,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    // Asked before the campaign is validated: somebody who may not touch it
    // should be told that, not handed a list of fields to fix first.
    await assertCampaignAccess({ models, user }, { _id }, 'edit');

    return models.EngageMessages.editCampaign(_id, doc, user._id);
  },

  async engageMessageRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastDelete');

    // Every one of them, before any of them: a selection holding a locked
    // campaign must not leave the rest half-deleted.
    for (const _id of _ids) {
      await assertCampaignAccess({ models, user }, { _id }, 'edit');
    }

    return models.EngageMessages.removeCampaigns(_ids);
  },

  async engageMessageSetLive(
    _root: undefined,
    { _id }: { _id: string },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    await assertCampaignAccess({ models, user }, { _id }, 'live');

    const campaign = await models.EngageMessages.getEngageMessage(_id);

    if (campaign.isLive) {
      throw new Error('Campaign is already live');
    }

    return models.EngageMessages.goLive(_id, {
      actorId: user._id,
      // Sending now uses up the moment it was waiting for.
      consumeSchedule: !!scheduledAt(campaign),
    });
  },

  /**
   * Sets the moment a campaign goes out, and starts it waiting.
   *
   * Scheduling is done to a finished campaign rather than chosen while writing
   * one, so it reaches every method the same way and does not depend on which
   * form the campaign was built in.
   */
  async engageMessageSetSchedule(
    _root: undefined,
    {
      _id,
      dateTime,
      recurrence,
    }: { _id: string; dateTime?: Date; recurrence?: TBroadcastRecurrence },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    // Scheduling commits the send as surely as starting it does; nobody is
    // watching when the alarm goes off.
    await assertCampaignAccess({ models, user }, { _id }, 'live');

    return models.EngageMessages.schedule(_id, { dateTime, recurrence });
  },

  /**
   * Puts a scheduled campaign back to a draft.
   *
   * The alarm already waiting is left alone: it carries the moment it was set
   * for, and a campaign with no schedule no longer matches it.
   */
  async engageMessageCancelSchedule(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    await assertCampaignAccess({ models, user }, { _id }, 'edit');

    return models.EngageMessages.cancelSchedule(_id);
  },

  async engageMessageSetPause(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    await assertCampaignAccess({ models, user }, { _id }, 'edit');

    return models.EngageMessages.pause(_id);
  },

  async engageMessageSetLiveManual(
    _root: undefined,
    { _id }: { _id: string },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    await assertCampaignAccess({ models, user }, { _id }, 'live');

    return models.EngageMessages.goLive(_id);
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
      content?: string;
      contentJson?: JSONContent;
      contentFormat?: TEmailContentFormat;
      previewText?: string;
      title: string;
    },
    { subdomain, models }: IContext,
  ) {
    const { content, contentJson, contentFormat, previewText, from, to, title } =
      args;

    if (!((content || contentJson) && from && to && title)) {
      throw new Error(
        'Email content, title, from address or to address is missing',
      );
    }

    const emails = to.split(',');
    if (emails.length > 1) {
      throw new Error('Test email can only be sent to one recipient');
    }

    const targetUser = await models.Users.findOne({ email: to });

    const fromUser = await models.Users.findOne({ email: from });

    if (!targetUser && !fromUser) {
      throw new Error('User not found');
    }

    const html = await renderEmailContent(
      { content, contentJson, contentFormat, previewText },
      {
        replacer: targetUser || fromUser || {},
        replaceBlocks: async (blocks) => {
          const attributeUtil = await getEditorAttributeUtil(subdomain);

          return (
            (await attributeUtil.replaceAttributes({
              content: blocks,
              user: targetUser,
            })) || blocks
          );
        },
      },
    );

    try {
      const response = await deliverEmail({
        cacheKey: getBroadcastCacheKey(models),
        config: await getBroadcastEmailConfig(models),
        message: {
          from,
          to: [to],
          subject: title,
          html,
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

  async engageMessageCopy(
    _root: undefined,
    { _id }: { _id },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastCreate');

    // Otherwise a lock is a formality: duplicate the campaign, send the copy.
    await assertCampaignAccess({ models, user }, { _id }, 'edit');

    return models.EngageMessages.copyCampaign(_id, user._id);
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
