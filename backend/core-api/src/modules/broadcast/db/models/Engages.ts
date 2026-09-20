import {
  IEngageData,
  IEngageMessage,
  IEngageMessageDocument,
  IMessageDocument,
} from '@/broadcast/@types';
import {
  CAMPAIGN_KINDS,
  CAMPAIGN_METHODS,
  CONTENT_TYPES,
} from '@/broadcast/constants';
import { engageMessageSchema } from '@/broadcast/db/definitions/engages';
import {
  checkCampaignDoc,
  checkCustomerExists,
  checkRules,
  createCampaignAutomation,
  findCampaignAutomation,
  getEditorAttributeUtil,
  getNumberOfVisits,
  isWorkflowCampaign,
  removeCampaignAutomations,
  sendBroadcast,
  setCampaignAutomationFlow,
  setCampaignAutomationStatus,
} from '@/broadcast/utils';
import { TBroadcastRecurrence } from '@/broadcast/utils/recurrence';
import {
  armSchedule,
  isRecurring,
  nextFireAt,
  scheduledAt,
  scheduleReconcile,
} from '@/broadcast/utils/schedule';
import { AUTOMATION_STATUSES } from 'erxes-api-shared/core-modules';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { Model, UpdateQuery } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ISESConfig } from '@/organization/settings/db/definitions/configs';
import { getValueAsString } from '@/organization/settings/db/models/Configs';

type TScheduleDate = NonNullable<IEngageMessage['scheduleDate']>;

type TCampaignFlow = { actions?: any[]; entryActionId?: string };

export type TCampaignInput = IEngageMessage & { workflow?: TCampaignFlow };

export type TGoLiveOptions = {
  actorId?: string;
  scheduledFor?: Date;
  consumeSchedule?: boolean;
};

export type TScheduleInput = {
  dateTime?: Date;
  recurrence?: TBroadcastRecurrence;
};

export interface IEngageMessageModel extends Model<IEngageMessageDocument> {
  getEngageMessage(_id: string): Promise<IEngageMessageDocument>;
  createEngageMessage(doc: IEngageMessage): Promise<IEngageMessageDocument>;

  updateEngageMessage(
    _id: string,
    doc: IEngageMessage,
  ): Promise<IEngageMessageDocument>;

  engageMessageSetLive(
    _id: string,
    options?: { consumeSchedule?: boolean },
  ): Promise<IEngageMessageDocument>;
  engageMessageSetPause(_id: string): Promise<IEngageMessageDocument>;
  setSchedule(
    _id: string,
    scheduleDate: TScheduleDate,
  ): Promise<IEngageMessageDocument>;
  clearSchedule(_id: string): Promise<IEngageMessageDocument>;

  createCampaign(
    doc: TCampaignInput,
    userId: string,
  ): Promise<IEngageMessageDocument>;
  editCampaign(
    _id: string,
    doc: TCampaignInput,
    userId: string,
  ): Promise<IEngageMessageDocument>;
  copyCampaign(_id: string, userId: string): Promise<IEngageMessageDocument>;
  removeCampaigns(_ids: string[]): Promise<unknown>;
  goLive(
    _id: string,
    options?: TGoLiveOptions,
  ): Promise<IEngageMessageDocument>;
  startSending(
    campaign: IEngageMessageDocument,
    actorId?: string,
    scheduledFor?: Date,
  ): Promise<void>;
  pause(_id: string): Promise<IEngageMessageDocument>;
  markFailed(_id: string): Promise<void>;
  schedule(
    _id: string,
    input: TScheduleInput,
  ): Promise<IEngageMessageDocument>;
  cancelSchedule(_id: string): Promise<IEngageMessageDocument>;
  removeEngageMessage(_ids: string[]): void;
  setCustomersCount(
    _id: string,
    type: string,
    count: number,
  ): Promise<IEngageMessageDocument>;
  changeCustomer(
    newCustomerId: string,
    customerIds: string[],
  ): Promise<IEngageMessageDocument>;
  removeCustomersEngages(
    customerIds: string[],
  ): Promise<{ n: number; ok: number }>;

  createOrUpdateConversationAndMessages(args: {
    customerId?: string;
    visitorId?: string;
    integrationId: string;
    user;
    engageData: IEngageData;
    replacedContent: string;
  }): Promise<IMessageDocument | null>;
  createVisitorOrCustomerMessages(params: {
    brandId: string;
    integrationId: string;
    customer?: any;
    visitorId?: string;
    browserInfo: any;
  }): Promise<IMessageDocument[]>;
  broadcastConfigs(): Promise<ISESConfig>;
}

export const loadEngageMessageClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  // Only decisions. Progress counters and statistics are written per batch and
  // would bury the few writes anybody is accountable for.
  const logChange = (
    previous: IEngageMessageDocument,
    current: IEngageMessageDocument,
  ) =>
    sendDbEventLog({
      action: 'update',
      docId: current._id,
      prevDocument: previous.toObject(),
      currentDocument: current.toObject(),
    });

  // Applies a change and records what it changed.
  const applyChange = async (
    _id: string,
    update: UpdateQuery<IEngageMessageDocument>,
  ) => {
    const previous = await models.EngageMessages.getEngageMessage(_id);
    const current = await models.EngageMessages.findOneAndUpdate(
      { _id },
      update,
      { new: true },
    );

    if (!current) {
      throw new Error('Campaign not found');
    }

    logChange(previous, current);

    return current;
  };

  class Message {
    /**
     * Get engage message
     */
    public static async getEngageMessage(_id: string) {
      const engageMessage = await models.EngageMessages.findOne({ _id });
      if (!engageMessage) {
        throw new Error('Campaign not found');
      }
      return engageMessage;
    }

    /**
     * Create engage message
     */
    public static async createEngageMessage(doc: IEngageMessage) {
      const created = await models.EngageMessages.create({ ...doc });

      sendDbEventLog({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    /**
     * Update engage message
     */
    public static async updateEngageMessage(_id: string, doc: IEngageMessage) {
      const message = await models.EngageMessages.getEngageMessage(_id);

      if (message.kind === CAMPAIGN_KINDS.MANUAL && message.isLive) {
        throw new Error('Can not update manual live campaign');
      }

      return applyChange(_id, { $set: doc });
    }

    /**
     * Engage message set live
     */
    public static async engageMessageSetLive(
      _id: string,
      options?: { consumeSchedule?: boolean },
    ) {
      const update: UpdateQuery<IEngageMessageDocument> = {
        $set: { isLive: true, isDraft: false },
      };

      // Sending now uses up a one-shot moment.
      if (options?.consumeSchedule) {
        update.$unset = { 'scheduleDate.dateTime': 1 };
      }

      return applyChange(_id, update);
    }

    /**
     * Engage message set pause
     */
    public static async engageMessageSetPause(_id: string) {
      return applyChange(_id, { $set: { isLive: false } });
    }

    public static async setSchedule(_id: string, scheduleDate: TScheduleDate) {
      return applyChange(_id, {
        $set: { isDraft: false, isLive: false, scheduleDate },
      });
    }

    // The whole schedule goes: a repeat left holding its pattern re-arms.
    public static async clearSchedule(_id: string) {
      return applyChange(_id, {
        $set: { isDraft: true, isLive: false },
        $unset: { scheduleDate: 1 },
      });
    }

    /**
     * Remove engage message
     */
    public static async removeEngageMessage(_ids: string[]) {
      const removed = await models.EngageMessages.deleteMany({
        _id: { $in: _ids },
      });

      if (removed.deletedCount) {
        sendDbEventLog({ action: 'deleteMany', docIds: _ids });
      }

      return removed;
    }

    public static async createCampaign(doc: TCampaignInput, userId: string) {
      const { isLive, isDraft, workflow, ...campaignDoc } = doc || {};

      // Neither leaves the campaign in a state nothing picks up again.
      if (!isDraft && !isLive) {
        throw new Error('A campaign must be saved as a draft or live');
      }

      await checkCampaignDoc(models, doc);

      const campaign = await models.EngageMessages.createEngageMessage({
        ...campaignDoc,
        isDraft,
        isLive,
        createdBy: userId,
      } as IEngageMessage);

      if (isWorkflowCampaign(doc.method)) {
        await createCampaignAutomation(models, {
          campaignId: campaign._id,
          title: campaign.title,
          userId,
          actions: workflow?.actions,
          entryActionId: workflow?.entryActionId,
        });
      }

      if (isLive && !isDraft) {
        await models.EngageMessages.startSending(campaign, userId);
      }

      return campaign;
    }

    public static async editCampaign(
      _id: string,
      doc: TCampaignInput,
      userId: string,
    ) {
      const campaign = await models.EngageMessages.getEngageMessage(_id);

      await checkCampaignDoc(models, { ...doc, _id });

      const { workflow, ...campaignDoc } = doc;
      const updated = await models.EngageMessages.updateEngageMessage(
        _id,
        campaignDoc,
      );

      if (isWorkflowCampaign(updated.method) && workflow) {
        await setCampaignAutomationFlow(models, _id, workflow);
      }

      if (!campaign.isLive && doc.isLive) {
        await models.EngageMessages.startSending(updated, userId);
      }

      return models.EngageMessages.getEngageMessage(_id);
    }

    public static async copyCampaign(_id: string, userId: string) {
      const source = await models.EngageMessages.getEngageMessage(_id);

      const doc = {
        ...source.toObject(),
        createdAt: new Date(),
        createdBy: userId,
        title: `${source.title} - duplicated`,
        isDraft: true,
        isLive: false,
        runCount: 0,
        totalCustomersCount: 0,
        validCustomersCount: 0,
      };

      delete doc._id;

      // A copy waits to be scheduled by hand rather than inheriting a moment.
      if (doc.scheduleDate?.dateTime) {
        doc.scheduleDate.dateTime = null;
      }

      const copy = await models.EngageMessages.createEngageMessage(doc);

      if (isWorkflowCampaign(copy.method)) {
        const sourceAutomation = await findCampaignAutomation(models, _id);

        await createCampaignAutomation(models, {
          campaignId: copy._id,
          title: copy.title,
          userId,
          // Its own snapshot, so editing either afterwards leaves the other be.
          actions: sourceAutomation?.actions,
        });
      }

      return copy;
    }

    public static async removeCampaigns(_ids: string[]) {
      await removeCampaignAutomations(models, _ids);

      return models.EngageMessages.removeEngageMessage(_ids);
    }

    public static async startSending(
      campaign: IEngageMessageDocument,
      actorId?: string,
      scheduledFor?: Date,
    ) {
      if (isWorkflowCampaign(campaign.method)) {
        await setCampaignAutomationStatus(
          models,
          subdomain,
          campaign._id,
          AUTOMATION_STATUSES.ACTIVE,
          actorId || campaign.createdBy,
        );
      }

      await sendBroadcast({
        models,
        subdomain,
        engageMessage: campaign,
        scheduledFor,
      });
    }

    public static async goLive(_id: string, options: TGoLiveOptions = {}) {
      const campaign = await models.EngageMessages.getEngageMessage(_id);

      // Checked as the campaign it is about to become.
      await checkCampaignDoc(models, { ...campaign.toObject(), isLive: true });

      const live = await models.EngageMessages.engageMessageSetLive(_id, {
        consumeSchedule: options.consumeSchedule,
      });

      await models.EngageMessages.startSending(
        live,
        options.actorId,
        options.scheduledFor,
      );

      return live;
    }

    public static async pause(_id: string) {
      const paused = await models.EngageMessages.engageMessageSetPause(_id);

      if (isWorkflowCampaign(paused.method)) {
        await setCampaignAutomationStatus(
          models,
          subdomain,
          _id,
          AUTOMATION_STATUSES.DRAFT,
        );
      }

      return paused;
    }

    public static async markFailed(_id: string) {
      await models.EngageMessages.updateOne(
        { _id },
        { $set: { status: 'failed', isLive: false } },
      );
    }

    public static async schedule(_id: string, input: TScheduleInput) {
      const { dateTime, recurrence } = input;
      const campaign = await models.EngageMessages.getEngageMessage(_id);

      if (campaign.isLive && campaign.status === 'sending') {
        throw new Error('This campaign is sending right now');
      }

      // A repeat may be given to a campaign that has gone out; a single send
      // is the thing that happens once.
      if (!recurrence && campaign.runCount) {
        throw new Error('This campaign has already gone out');
      }

      const scheduleDate = recurrence
        ? { type: 'recurring', ...recurrence }
        : { type: 'pre', dateTime: dateTime && new Date(dateTime) };

      if (!nextFireAt({ scheduleDate })) {
        throw new Error(
          recurrence
            ? 'This schedule would never run — check the pattern and the end date'
            : 'Pick a moment that has not passed yet',
        );
      }

      // A schedule that cannot be sent is worse than none: nobody is watching
      // when it comes due.
      await checkCampaignDoc(models, { ...campaign.toObject(), isLive: true });

      const scheduled = await models.EngageMessages.setSchedule(
        _id,
        scheduleDate,
      );

      await armSchedule(subdomain, scheduled);
      await scheduleReconcile(subdomain);

      return scheduled;
    }

    public static async cancelSchedule(_id: string) {
      const campaign = await models.EngageMessages.getEngageMessage(_id);

      if (!scheduledAt(campaign) && !isRecurring(campaign)) {
        throw new Error('This campaign is not scheduled');
      }

      return models.EngageMessages.clearSchedule(_id);
    }

    /**
     * Save matched customers count
     */
    public static async setCustomersCount(
      _id: string,
      type: string,
      count: number,
    ) {
      await models.EngageMessages.updateOne(
        { _id },
        { $set: { [type]: count } },
      );

      return models.EngageMessages.findOne({ _id });
    }

    /**
     * Transfers customers' engage messages to another customer
     */
    public static async changeCustomer(
      newCustomerId: string,
      customerIds: string[],
    ) {
      for (const customerId of customerIds) {
        // Updating every engage messages of customer
        await models.EngageMessages.updateMany(
          { customerIds: { $in: [customerId] } },
          { $push: { customerIds: newCustomerId } },
        );

        await models.EngageMessages.updateMany(
          { customerIds: { $in: [customerId] } },
          { $pull: { customerIds: customerId } },
        );

        // updating every engage messages of customer participated in
        await models.EngageMessages.updateMany(
          { messengerReceivedCustomerIds: { $in: [customerId] } },
          { $push: { messengerReceivedCustomerIds: newCustomerId } },
        );

        await models.EngageMessages.updateMany(
          { messengerReceivedCustomerIds: { $in: [customerId] } },
          { $pull: { messengerReceivedCustomerIds: customerId } },
        );
      }

      return models.EngageMessages.find({ customerIds: newCustomerId });
    }

    /**
     * Remove customers engages
     */
    public static async removeCustomersEngages(customerIds: string[]) {
      // Removing customer from engage messages
      await models.EngageMessages.updateMany(
        { messengerReceivedCustomerIds: { $in: customerIds } },
        { $pull: { messengerReceivedCustomerIds: { $in: customerIds } } },
      );

      return models.EngageMessages.updateMany(
        { customerIds },
        { $pull: { customerIds } },
      );
    }

    /**
     * This function will be used in messagerConnect and it will create conversations
     * when visitor messenger connect
     */
    public static async createVisitorOrCustomerMessages(params: {
      brandId: string;
      integrationId: string;
      customer?: any;
      visitorId?: string;
      browserInfo: any;
    }) {
      const { brandId, integrationId, customer, visitorId, browserInfo } =
        params;

      const customerObj = customer
        ? customer
        : { _id: '', state: CONTENT_TYPES.VISITOR };

      const messages: IEngageMessageDocument[] =
        await models.EngageMessages.find({
          'messenger.brandId': brandId,
          method: CAMPAIGN_METHODS.MESSENGER,
          isLive: true,
        });

      const conversationMessages: IMessageDocument[] = [];

      for (const message of messages) {
        const jsonString = JSON.stringify(message.messenger);

        const messenger = JSON.parse(jsonString);

        const { _id, targetType, targetIds, fromUserId } = message;

        const customerExists = await checkCustomerExists(subdomain, models, {
          id: _id,
          targetType,
          targetIds,
        });

        if (message.kind !== CAMPAIGN_KINDS.VISITOR_AUTO && !customerExists) {
          continue;
        }

        const user = await models.Users.findOne({ _id: fromUserId }).lean();

        if (!user) {
          continue;
        }

        const numberOfVisits = await getNumberOfVisits({
          subdomain,
          url: browserInfo.url,
          visitorId,
          customerId: customer ? customer._id : undefined,
        });

        const hasPassedAllRules = await checkRules({
          rules: messenger.rules,
          browserInfo,
          numberOfVisits,
        });

        // if given visitor is matched with given condition then create
        // conversations
        if (hasPassedAllRules) {
          const editorAttributeUtil = await getEditorAttributeUtil(subdomain);

          // replace keys in content
          const replacedContent = await editorAttributeUtil.replaceAttributes({
            content: messenger.content,
            customer,
            user,
          });

          if (messenger.rules) {
            messenger.rules = messenger.rules.map((r) => ({
              kind: r.kind,
              text: r.text,
              condition: r.condition,
              value: r.value,
            }));
          }

          const conversationMessage =
            await this.createOrUpdateConversationAndMessages({
              customerId: customer?._id,
              visitorId,
              integrationId,
              user,
              replacedContent: replacedContent || '',
              engageData: {
                ...messenger,
                content: replacedContent,
                engageKind: message.kind,
                messageId: message._id,
                fromUserId: message.fromUserId,
              },
            });

          if (conversationMessage) {
            conversationMessages.push(conversationMessage);
            await models.EngageMessages.updateOne(
              { _id: message?._id },
              {
                $inc: { totalCustomersCount: 1 },
              },
            );
          }
        }
      } // end for loop

      return conversationMessages;
    }

    /*
     * Creates or update conversation & message object using given info
     */
    public static async createOrUpdateConversationAndMessages(args: {
      customerId?: string;
      visitorId?: string;
      integrationId: string;
      user;
      engageData: IEngageData;
      replacedContent: string;
    }) {
      const {
        customerId,
        visitorId,
        integrationId,
        user,
        engageData,
        replacedContent,
      } = args;

      let prevMessage: IMessageDocument | null;

      const query = customerId
        ? { customerId, 'engageData.messageId': engageData.messageId }
        : { visitorId, 'engageData.messageId': engageData.messageId };

      prevMessage = await sendTRPCMessage({
        subdomain,
        pluginName: 'frontline',
        method: 'query',
        module: 'conversationMessages',
        action: 'findOne',
        input: query,
      });

      if (prevMessage) {
        if (
          JSON.stringify(prevMessage.engageData) === JSON.stringify(engageData)
        ) {
          return null;
        }

        let messages: IMessageDocument[] = [];

        const conversationId = prevMessage.conversationId;

        messages = await sendTRPCMessage({
          subdomain,
          pluginName: 'frontline',
          method: 'query',
          module: 'conversationMessages',
          action: 'find',
          input: { conversationId },
        });

        // leave conversations with responses alone
        if (messages.length > 1) {
          return null;
        }

        await sendTRPCMessage({
          subdomain,

          pluginName: 'frontline',
          method: 'mutation',
          module: 'conversationMessages',
          action: 'updateOne',
          input: {
            filter: { _id: prevMessage._id },
            updateDoc: { engageData, isCustomerRead: false },
          },
        });

        return null;
      }

      return await sendTRPCMessage({
        subdomain,

        pluginName: 'frontline',
        method: 'mutation',
        module: 'inbox',
        action: 'createConversationAndMessage',
        input: {
          userId: user._id,
          status: 'engageVisitorAuto',
          customerId,
          visitorId,
          integrationId,
          content: replacedContent,
          engageData,
        },
      });
    }

    public static async broadcastConfigs() {
      const accessKeyId = await getValueAsString(
        models,
        'BROADCAST_AWS_SES_ACCESS_KEY_ID',
        'AWS_SES_ACCESS_KEY_ID',
      );

      const secretAccessKey = await getValueAsString(
        models,
        'BROADCAST_AWS_SES_SECRET_ACCESS_KEY',
        'AWS_SES_SECRET_ACCESS_KEY',
      );

      const region = await getValueAsString(
        models,
        'BROADCAST_AWS_REGION',
        'AWS_REGION',
      );

      const unverifiedEmailsLimit = await getValueAsString(
        models,
        'BROADCAST_UNVERIFIED_EMAILS_LIMIT',
        'UNVERIFIED_EMAILS_LIMIT',
        '100',
      );

      return {
        accessKeyId,
        secretAccessKey,
        region,
        unverifiedEmailsLimit,
      };
    }
  }

  engageMessageSchema.loadClass(Message);

  return engageMessageSchema;
};
