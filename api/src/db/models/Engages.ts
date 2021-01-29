import { Model, model } from 'mongoose';
import { ConversationMessages, Conversations, Users } from '.';
import { MESSAGE_KINDS } from '../../data/constants';
import { generateCustomerSelector } from '../../data/resolvers/mutations/engageUtils';
import { replaceEditorAttributes } from '../../data/utils';
import { getNumberOfVisits } from '../../events';
import Customers, { IBrowserInfo } from './Customers';
import { IBrandDocument } from './definitions/brands';
import { METHODS } from './definitions/constants';
import {
  IEngageData,
  IMessageDocument
} from './definitions/conversationMessages';
import { ICustomerDocument } from './definitions/customers';
import {
  engageMessageSchema,
  IEngageMessage,
  IEngageMessageDocument
} from './definitions/engages';
import { IIntegrationDocument } from './definitions/integrations';
import { CONTENT_TYPES } from './definitions/segments';
import { IUserDocument } from './definitions/users';

interface ICheckRulesParams {
  rules: IRule[];
  browserInfo: IBrowserInfo;
  numberOfVisits?: number;
}

/*
 * Checks individual rule
 */
interface IRule {
  value?: string;
  kind: string;
  condition: string;
}

interface ICheckRuleParams {
  rule: IRule;
  browserInfo: IBrowserInfo;
  numberOfVisits?: number;
}

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

  checkRule(params: ICheckRuleParams): boolean;
  checkRules(params: ICheckRulesParams): Promise<boolean>;
  createOrUpdateConversationAndMessages(args: {
    customerId?: string;
    visitorId?: string;
    integrationId: string;
    user: IUserDocument;
    engageData: IEngageData;
    replacedContent: string;
  }): Promise<IMessageDocument | null>;
  createVisitorOrCustomerMessages(params: {
    brand: IBrandDocument;
    integration: IIntegrationDocument;
    customer?: ICustomerDocument;
    visitor?: any;
    browserInfo: any;
  }): Promise<IMessageDocument[]>;
}

export const loadClass = () => {
  class Message {
    /**
     * Get engage message
     */
    public static async getEngageMessage(_id: string) {
      const engageMessage = await EngageMessages.findOne({ _id });

      if (!engageMessage) {
        throw new Error('Campaign not found');
      }

      return engageMessage;
    }

    /**
     * Create engage message
     */
    public static createEngageMessage(doc: IEngageMessage) {
      return EngageMessages.create({
        ...doc
      });
    }

    /**
     * Update engage message
     */
    public static async updateEngageMessage(_id: string, doc: IEngageMessage) {
      const message = await EngageMessages.findOne({ _id });

      if (message && message.kind === 'manual') {
        throw new Error('Can not update manual message');
      }

      await EngageMessages.updateOne({ _id }, { $set: doc });

      return EngageMessages.findOne({ _id });
    }

    /**
     * Engage message set live
     */
    public static async engageMessageSetLive(_id: string) {
      await EngageMessages.updateOne(
        { _id },
        { $set: { isLive: true, isDraft: false } }
      );

      return EngageMessages.findOne({ _id });
    }

    /**
     * Engage message set pause
     */
    public static async engageMessageSetPause(_id: string) {
      await EngageMessages.updateOne({ _id }, { $set: { isLive: false } });

      return EngageMessages.findOne({ _id });
    }

    /**
     * Remove engage message
     */
    public static async removeEngageMessage(_id: string) {
      const message = await EngageMessages.findOne({ _id });

      if (!message) {
        throw new Error(`Campaign not found with id ${_id}`);
      }

      await Conversations.removeEngageConversations(_id);

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
      await EngageMessages.updateOne({ _id }, { $set: { [type]: count } });

      return EngageMessages.findOne({ _id });
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
        await EngageMessages.updateMany(
          { customerIds: { $in: [customerId] } },
          { $push: { customerIds: newCustomerId } }
        );

        await EngageMessages.updateMany(
          { customerIds: { $in: [customerId] } },
          { $pull: { customerIds: customerId } }
        );

        // updating every engage messages of customer participated in
        await EngageMessages.updateMany(
          { messengerReceivedCustomerIds: { $in: [customerId] } },
          { $push: { messengerReceivedCustomerIds: newCustomerId } }
        );

        await EngageMessages.updateMany(
          { messengerReceivedCustomerIds: { $in: [customerId] } },
          { $pull: { messengerReceivedCustomerIds: customerId } }
        );
      }

      return EngageMessages.find({ customerIds: newCustomerId });
    }

    /**
     * Remove customers engages
     */
    public static async removeCustomersEngages(customerIds: string[]) {
      // Removing customer from engage messages
      await EngageMessages.updateMany(
        { messengerReceivedCustomerIds: { $in: customerIds } },
        { $pull: { messengerReceivedCustomerIds: { $in: customerIds } } }
      );

      return EngageMessages.updateMany(
        { customerIds },
        { $pull: { customerIds } }
      );
    }

    /*
     * This function will be used in messagerConnect and it will create conversations
     * when visitor messenger connect
     */
    public static async createVisitorOrCustomerMessages(params: {
      brand: IBrandDocument;
      integration: IIntegrationDocument;
      customer?: ICustomerDocument;
      visitor?: any;
      browserInfo: any;
    }) {
      const { brand, integration, customer, visitor, browserInfo } = params;

      if (visitor) {
        delete visitor._id;
        visitor.state = CONTENT_TYPES.VISITOR;
      }
      const customerObj = customer ? customer : visitor;

      const messages = await EngageMessages.find({
        'messenger.brandId': brand._id,
        method: METHODS.MESSENGER,
        isLive: true
      });

      const conversationMessages: IMessageDocument[] = [];

      for (const message of messages) {
        const messenger = message.messenger ? message.messenger.toJSON() : {};

        const {
          customerIds = [],
          segmentIds,
          tagIds,
          brandIds,
          fromUserId
        } = message;

        if (
          message.kind === 'manual' &&
          (customerIds || []).length > 0 &&
          !customerIds.includes(customerObj._id)
        ) {
          continue;
        }

        const customersSelector = {
          _id: customerObj._id,
          state: { $ne: CONTENT_TYPES.VISITOR },
          ...(await generateCustomerSelector({
            customerIds,
            segmentIds,
            tagIds,
            brandIds
          }))
        };

        const customerExists = await Customers.findOne(customersSelector);

        if (message.kind !== MESSAGE_KINDS.VISITOR_AUTO && !customerExists) {
          continue;
        }

        if (
          message.kind === MESSAGE_KINDS.VISITOR_AUTO &&
          customerObj.state !== CONTENT_TYPES.VISITOR
        ) {
          continue;
        }

        const user = await Users.findOne({ _id: fromUserId });

        if (!user) {
          continue;
        }
        // check for rules ===
        const numberOfVisits = await getNumberOfVisits({
          url: browserInfo.url,
          visitorId: visitor ? visitor.visitorId : undefined,
          customerId: customer ? customer._id : undefined
        });

        const hasPassedAllRules = await this.checkRules({
          rules: messenger.rules,
          browserInfo,
          numberOfVisits
        });

        // if given visitor is matched with given condition then create
        // conversations
        if (hasPassedAllRules) {
          // replace keys in content
          const { replacedContent } = await replaceEditorAttributes({
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
              visitorId: visitor && visitor.visitorId,
              integrationId: integration._id,
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
              await EngageMessages.updateOne(
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
      user: IUserDocument;
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

      const query = customerId
        ? { customerId, 'engageData.messageId': engageData.messageId }
        : { visitorId, 'engageData.messageId': engageData.messageId };

      const prevMessage: IMessageDocument | null = await ConversationMessages.findOne(
        query
      );

      if (prevMessage) {
        if (
          JSON.stringify(prevMessage.engageData) === JSON.stringify(engageData)
        ) {
          return null;
        }

        const messages = await ConversationMessages.find({
          conversationId: prevMessage.conversationId
        });

        // leave conversations with responses alone
        if (messages.length > 1) {
          return null;
        }

        // mark as unread again && reset engageData
        await ConversationMessages.updateOne(
          { _id: prevMessage._id },
          { $set: { engageData, isCustomerRead: false } }
        );

        return null;
      }

      // create conversation
      const conversation = await Conversations.createConversation({
        userId: user._id,
        customerId,
        visitorId,
        integrationId,
        content: replacedContent
      });

      // create message
      return ConversationMessages.createMessage({
        engageData,
        conversationId: conversation._id,
        userId: user._id,
        customerId,
        visitorId,
        content: replacedContent
      });
    }

    /*
     * This function determines whether or not current visitor's information
     * satisfying given engage message's rules
     */
    public static async checkRules(params: ICheckRulesParams) {
      const { rules, browserInfo, numberOfVisits } = params;

      let passedAllRules = true;

      rules.forEach(rule => {
        // check individual rule
        if (!this.checkRule({ rule, browserInfo, numberOfVisits })) {
          passedAllRules = false;
          return;
        }
      });

      return passedAllRules;
    }

    public static checkRule(params: ICheckRuleParams) {
      const { rule, browserInfo, numberOfVisits } = params;
      const { language, url, city, countryCode } = browserInfo;
      const { value, kind, condition } = rule;
      const ruleValue: any = value;

      let valueToTest: any;

      if (kind === 'browserLanguage') {
        valueToTest = language;
      }

      if (kind === 'currentPageUrl') {
        valueToTest = url;
      }

      if (kind === 'city') {
        valueToTest = city;
      }

      if (kind === 'country') {
        valueToTest = countryCode;
      }

      if (kind === 'numberOfVisits') {
        valueToTest = numberOfVisits;
      }

      // is
      if (condition === 'is' && valueToTest !== ruleValue) {
        return false;
      }

      // isNot
      if (condition === 'isNot' && valueToTest === ruleValue) {
        return false;
      }

      // isUnknown
      if (condition === 'isUnknown' && valueToTest) {
        return false;
      }

      // hasAnyValue
      if (condition === 'hasAnyValue' && !valueToTest) {
        return false;
      }

      // startsWith
      if (
        condition === 'startsWith' &&
        valueToTest &&
        !valueToTest.startsWith(ruleValue)
      ) {
        return false;
      }

      // endsWith
      if (
        condition === 'endsWith' &&
        valueToTest &&
        !valueToTest.endsWith(ruleValue)
      ) {
        return false;
      }

      // contains
      if (
        condition === 'contains' &&
        valueToTest &&
        !valueToTest.includes(ruleValue)
      ) {
        return false;
      }

      // greaterThan
      if (
        condition === 'greaterThan' &&
        valueToTest < parseInt(ruleValue, 10)
      ) {
        return false;
      }

      if (condition === 'lessThan' && valueToTest > parseInt(ruleValue, 10)) {
        return false;
      }

      if (condition === 'doesNotContain' && valueToTest.includes(ruleValue)) {
        return false;
      }

      return true;
    }
  }

  engageMessageSchema.loadClass(Message);

  return engageMessageSchema;
};

loadClass();

// tslint:disable-next-line
const EngageMessages = model<IEngageMessageDocument, IEngageMessageModel>(
  'engage_messages',
  engageMessageSchema
);

export default EngageMessages;
