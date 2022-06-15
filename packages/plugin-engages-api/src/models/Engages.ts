import { Model } from 'mongoose';

import {
  removeEngageConversations,
  sendContactsMessage,
  sendInboxMessage
} from '../messageBroker';
import { checkCustomerExists, findElk, findUser } from '../engageUtils';
import { getEditorAttributeUtil, isUsingElk } from '../utils';

import { CAMPAIGN_METHODS, CAMPAIGN_KINDS, CONTENT_TYPES } from '../constants';
import { IEngageData, IMessageDocument } from '../types';
import {
  engageMessageSchema,
  IEngageMessage,
  IEngageMessageDocument
} from './definitions/engages';
import { IModels } from '../connectionResolver';
import { checkRules } from '../widgetUtils';

export interface IEngageMessageModel extends Model<IEngageMessageDocument> {
  getEngageMessage(_id: string): IEngageMessageDocument;
  createEngageMessage(doc: IEngageMessage): Promise<IEngageMessageDocument>;

  updateEngageMessage(
    _id: string,
    doc: IEngageMessage
  ): Promise<IEngageMessageDocument>;

  engageMessageSetLive(_id: string): Promise<IEngageMessageDocument>;
  engageMessageSetPause(_id: string): Promise<IEngageMessageDocument>;
  removeEngageMessage(_id: string): void;
  setCustomersCount(
    _id: string,
    type: string,
    count: number
  ): Promise<IEngageMessageDocument>;
  changeCustomer(
    newCustomerId: string,
    customerIds: string[]
  ): Promise<IEngageMessageDocument>;
  removeCustomersEngages(
    customerIds: string[]
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
}

export const loadEngageMessageClass = (models: IModels, subdomain: string) => {
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
    public static createEngageMessage(doc: IEngageMessage) {
      return models.EngageMessages.create({ ...doc });
    }

    /**
     * Update engage message
     */
    public static async updateEngageMessage(_id: string, doc: IEngageMessage) {
      const message = await models.EngageMessages.getEngageMessage(_id);

      if (message.kind === CAMPAIGN_KINDS.MANUAL && message.isLive) {
        throw new Error('Can not update manual live campaign');
      }

      await models.EngageMessages.updateOne({ _id }, { $set: doc });

      return models.EngageMessages.findOne({ _id });
    }

    /**
     * Engage message set live
     */
    public static async engageMessageSetLive(_id: string) {
      await models.EngageMessages.updateOne(
        { _id },
        { $set: { isLive: true, isDraft: false } }
      );

      return models.EngageMessages.findOne({ _id });
    }

    /**
     * Engage message set pause
     */
    public static async engageMessageSetPause(_id: string) {
      await models.EngageMessages.updateOne(
        { _id },
        { $set: { isLive: false } }
      );

      return models.EngageMessages.findOne({ _id });
    }

    /**
     * Remove engage message
     */
    public static async removeEngageMessage(_id: string) {
      const message = await models.EngageMessages.findOne({ _id });

      if (!message) {
        throw new Error(`Campaign not found with id ${_id}`);
      }

      await removeEngageConversations(_id);

      return message.remove();
    }

    /**
     * Save matched customers count
     */
    public static async setCustomersCount(
      _id: string,
      type: string,
      count: number
    ) {
      await models.EngageMessages.updateOne(
        { _id },
        { $set: { [type]: count } }
      );

      return models.EngageMessages.findOne({ _id });
    }

    /**
     * Transfers customers' engage messages to another customer
     */
    public static async changeCustomer(
      newCustomerId: string,
      customerIds: string[]
    ) {
      for (const customerId of customerIds) {
        // Updating every engage messages of customer
        await models.EngageMessages.updateMany(
          { customerIds: { $in: [customerId] } },
          { $push: { customerIds: newCustomerId } }
        );

        await models.EngageMessages.updateMany(
          { customerIds: { $in: [customerId] } },
          { $pull: { customerIds: customerId } }
        );

        // updating every engage messages of customer participated in
        await models.EngageMessages.updateMany(
          { messengerReceivedCustomerIds: { $in: [customerId] } },
          { $push: { messengerReceivedCustomerIds: newCustomerId } }
        );

        await models.EngageMessages.updateMany(
          { messengerReceivedCustomerIds: { $in: [customerId] } },
          { $pull: { messengerReceivedCustomerIds: customerId } }
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
        { $pull: { messengerReceivedCustomerIds: { $in: customerIds } } }
      );

      return models.EngageMessages.updateMany(
        { customerIds },
        { $pull: { customerIds } }
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
      const {
        brandId,
        integrationId,
        customer,
        visitorId,
        browserInfo
      } = params;

      const customerObj = customer
        ? customer
        : { _id: '', state: CONTENT_TYPES.VISITOR };

      let messages: IEngageMessageDocument[] = [];

      if (isUsingElk()) {
        messages = await findElk(subdomain, 'engage_messages', {
          bool: {
            must: [
              { match: { 'messenger.brandId': brandId } },
              { match: { method: CAMPAIGN_METHODS.MESSENGER } },
              { match: { isLive: true } }
            ]
          }
        });
      } else {
        messages = await models.EngageMessages.find({
          'messenger.brandId': brandId,
          method: CAMPAIGN_METHODS.MESSENGER,
          isLive: true
        });
      }

      const conversationMessages: IMessageDocument[] = [];

      for (const message of messages) {
        const jsonString = JSON.stringify(message.messenger);

        const messenger = JSON.parse(jsonString);

        const {
          customerIds = [],
          segmentIds,
          customerTagIds,
          brandIds,
          fromUserId
        } = message;

        if (
          message.kind === CAMPAIGN_KINDS.MANUAL &&
          (customerIds || []).length > 0 &&
          !customerIds.includes(customerObj._id)
        ) {
          continue;
        }

        const customerExists = await checkCustomerExists(subdomain, {
          id: customerObj._id,
          customerIds,
          segmentIds,
          tagIds: customerTagIds,
          brandIds
        });

        if (message.kind !== CAMPAIGN_KINDS.VISITOR_AUTO && !customerExists) {
          continue;
        }

        if (
          message.kind === CAMPAIGN_KINDS.VISITOR_AUTO &&
          customerObj.state !== CONTENT_TYPES.VISITOR
        ) {
          continue;
        }

        const user = await findUser(subdomain, fromUserId || '');

        if (!user) {
          continue;
        }

        // check for rules ===
        const numberOfVisits = await sendContactsMessage({
          isRPC: true,
          subdomain,
          action: 'getNumberOfVisits',
          data: {
            url: browserInfo.url,
            visitorId,
            customerId: customer ? customer._id : undefined
          }
        });

        const hasPassedAllRules = await checkRules({
          rules: messenger.rules,
          browserInfo,
          numberOfVisits
        });

        // if given visitor is matched with given condition then create
        // conversations
        if (hasPassedAllRules) {
          const editorAttributeUtil = await getEditorAttributeUtil(subdomain);

          // replace keys in content
          const replacedContent = await editorAttributeUtil.replaceAttributes({
            content: messenger.content,
            customer,
            user
          });

          if (messenger.rules) {
            messenger.rules = messenger.rules.map(r => ({
              kind: r.kind,
              text: r.text,
              condition: r.condition,
              value: r.value
            }));
          }

          const conversationMessage = await this.createOrUpdateConversationAndMessages(
            {
              customerId: customer && customer._id,
              visitorId,
              integrationId,
              user,
              replacedContent: replacedContent || '',
              engageData: {
                ...messenger,
                content: replacedContent,
                engageKind: message.kind,
                messageId: message._id,
                fromUserId: message.fromUserId
              }
            }
          );

          if (conversationMessage) {
            // collect created messages
            conversationMessages.push(conversationMessage);

            // add given customer to customerIds list
            if (customer) {
              await models.EngageMessages.updateOne(
                { _id: message._id },
                { $push: { customerIds: customer._id } }
              );
            }
          }
        }
      }

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
        replacedContent
      } = args;

      let prevMessage: IMessageDocument | null;

      if (isUsingElk()) {
        const conversationMessages = await findElk(
          subdomain,
          'conversation_messages',
          {
            bool: {
              must: [
                { match: { 'engageData.messageId': engageData.messageId } },
                { match: customerId ? { customerId } : { visitorId } }
              ]
            }
          }
        );

        prevMessage = null;

        if (conversationMessages.length > 0) {
          prevMessage = conversationMessages[0];
        }
      } else {
        const query = customerId
          ? { customerId, 'engageData.messageId': engageData.messageId }
          : { visitorId, 'engageData.messageId': engageData.messageId };

        prevMessage = await sendInboxMessage({
          subdomain,
          action: 'conversationMessages.findOne',
          data: query,
          isRPC: true
        });
      }

      const commonParams = { isRPC: true, subdomain };

      if (prevMessage) {
        if (
          JSON.stringify(prevMessage.engageData) === JSON.stringify(engageData)
        ) {
          return null;
        }

        let messages: IMessageDocument[] = [];

        const conversationId = prevMessage.conversationId;

        if (isUsingElk()) {
          messages = await findElk(subdomain, 'conversation_messages', {
            match: {
              conversationId
            }
          });
        } else {
          messages = await sendInboxMessage({
            ...commonParams,
            data: { conversationId },
            action: 'conversationMessages.find'
          });
        }

        // leave conversations with responses alone
        if (messages.length > 1) {
          return null;
        }

        // mark as unread again && reset engageData
        await sendInboxMessage({
          ...commonParams,
          action: 'updateConversationMessage',
          data: {
            filter: { _id: prevMessage._id },
            updateDoc: { engageData, isCustomerRead: false }
          }
        });

        return null;
      }

      // create conversation and message replaced by messagebroker
      return await sendInboxMessage({
        ...commonParams,
        action: 'createConversationAndMessage',
        data: {
          userId: user._id,
          status: 'engageVisitorAuto',
          customerId,
          visitorId,
          integrationId,
          replacedContent,
          engageData
        }
      });
    }
  }

  engageMessageSchema.loadClass(Message);

  return engageMessageSchema;
};
