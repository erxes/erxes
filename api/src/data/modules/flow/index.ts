import * as moment from 'moment';
import {
  ConversationMessages,
  Conversations,
  Flows,
  Integrations,
  Users,
  FlowActions,
  Customers,
  Channels,
} from '../../../db/models';

import { IntegrationsAPI } from '../../dataSources';

import { IMessageDocument } from '../../../db/models/definitions/conversationMessages';
import {
  IFlowActionDocument,
  IFlowActionValue,
  IFlowActionValueCondition,
} from '../../../db/models/definitions/flowActions';
import { IConversationDocument } from '../../../db/models/definitions/conversations';
import { KIND_CHOICES } from '../../../db/models/definitions/constants';
import {
  IConversationMessageAdd,
  publishConversationsChanged,
  sendConversationToIntegrations,
  publishMessage,
} from '../../resolvers/mutations/conversations';
import { graphqlPubsub } from '../../../pubsub';
import { IIntegrationDocument } from '../../../db/models/definitions/integrations';
import { IDetail, IUserDocument } from '../../../db/models/definitions/users';
import { isValidNumber, isValidNumberForRegion } from 'libphonenumber-js';

const actionWithSendNext = ['erxes.action.send.message', 'erxes.action.define.department', 'erxes.action.conditional'];

export function removeDiacritics(string) {
  return String(string)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const checkIfIsCondition = (condition: IFlowActionValueCondition, content: string = '', attachments: any[] = []) => {
  content = removeDiacritics(content.toLowerCase());

  switch (condition.operator) {
    case '=': // Equals
      switch (condition.type) {
        case 'erxes.conditional.variable':
          switch (condition.variable.key) {
            case 'onboarding_active':
              let now = moment.utc();
              now = now.utcOffset(-180);
              let not = [0].includes(now.weekday()) || now.hour() < 9 || now.hour() > 18;
              return (condition.variable.value === '0' && not) || (condition.variable.value === '1' && !not);

            default:
              break;
          }
          break;

        default:
          return condition.values.map(c => removeDiacritics(c.toLowerCase())).includes(content);
      }

    case '*': // Anything
      return true;

    case '#': // "Phonenumber"
      const number = content.match(/\d/g)?.join('') || '';

      if (isValidNumber(`+${number}`)) return true;

      if (isValidNumberForRegion(number, 'BR')) return true;

      if (isValidNumberForRegion(number, 'US')) return true;

      return false;

    case '@': // "Email"
      return /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g.test(
        content,
      );

    case '%': // "Contains"
      return Boolean(condition.values.map(c => removeDiacritics(c.toLowerCase())).find(c => c.indexOf(content) !== -1));

    case 'º': // "Image"
      return Boolean(attachments && attachments.length > 0);
    default:
      return false;
  }
};

const handleMessage = async (msg: IMessageDocument) => {
  if (msg.isGroupMsg || !msg.customerId) return;

  let conversation = await Conversations.getConversation(msg.conversationId);

  if (!conversation) return;

  const integration = await Integrations.getIntegration(conversation?.integrationId);

  if (!integration || !integration.flowId) return;

  const flow = await Flows.getFlow(integration.flowId);

  if (!flow) return;

  if (conversation.assignedUserId) {
    if (conversation.assignedUserId !== flow.assignedUserId) {
      let lastMessage = await ConversationMessages.findOne({
        userId: conversation.assignedUserId,
        conversationId: conversation.id,
      })
        .sort({ createdAt: -1 })
        .exec();

      if (lastMessage && moment(lastMessage.createdAt).isAfter(moment().subtract(1, 'day'))) {
        return;
      }

      conversation.assignedUserId = undefined;
    }
  }

  const user = await Users.findById(flow.assignedUserId);

  if (!user) return;

  if (!conversation.assignedUserId) {
    const conversations: IConversationDocument[] = await Conversations.assignUserConversation(
      [conversation.id],
      user.id,
    );

    conversation = conversations[0];
    conversation.currentFlowActionId = undefined;

    // notify graphl subscription
    publishConversationsChanged([conversation.id], 'assigneeChanged');

    for (const conversation of conversations) {
      let message = await ConversationMessages.addMessage({
        conversationId: conversation._id,
        content: `${user.details?.shortName || user.email} has been assigned to this conversation`,
        fromBot: true,
      });

      graphqlPubsub.publish('conversationClientMessageInserted', {
        conversationClientMessageInserted: message,
      });
    }
  }

  let flowAction: IFlowActionDocument | null = null;
  let sendNextMessage = false;

  if (conversation?.currentFlowActionId) {
    flowAction = await FlowActions.findById(conversation.currentFlowActionId);

    if (flowAction) {
      switch (flowAction.type) {
        case 'erxes.action.root':
        case 'erxes.action.define.department':
        case 'erxes.action.send.message':
          flowAction = await FlowActions.findOne({
            flowId: flowAction.flowId,
            order: flowAction.order + 1,
          });

          // if (actionWithSendNext.includes(flowAction?.type || ""))
          // 	sendNextMessage = true;

          break;
        case 'erxes.action.execute.automation.flow':
          flowAction = await FlowActions.findOne({
            flowId: flowAction?.value,
            order: 0,
          });

          await Conversations.updateConversation(conversation.id, {
            currentFlowActionId: flowAction?.id,
          });

          sendNextMessage = flowAction?.executeNext ?? false;
          break;
        case 'erxes.action.to.ask': {
          const { conditions }: IFlowActionValue = JSON.parse(flowAction.value || '{}');

          const condition = conditions.find(c => checkIfIsCondition(c, msg.content, msg.attachments));

          if (condition) {
            switch (condition.action) {
              case 'erxes.action.execute.action':
                flowAction = await FlowActions.findOne({
                  flowId: flowAction.flowId,
                  order: condition.value,
                });

                break;
              case 'erxes.action.transfer.to.agent':
                await handleTransferToAgent(flowAction, conversation, integration, condition);
                return;
              default:
                break;
            }
          }
          break;
        }
        case 'erxes.action.conditional': {
          const { conditions }: IFlowActionValue = JSON.parse(flowAction.value || '{}');

          const condition = conditions.find(c => checkIfIsCondition(c, msg.content, msg.attachments));

          if (condition) {
            switch (condition.action) {
              case 'erxes.action.execute.action':
                flowAction = await FlowActions.findOne({
                  flowId: flowAction.flowId,
                  order: condition.value,
                });

                break;
              default:
                break;
            }
          } else {
            flowAction = await FlowActions.findOne({
              flowId: flowAction.flowId,
              order: flowAction.order + 1,
            });
          }
          break;
        }
        default:
          break;
      }
    }
  }

  if (!flowAction) {
    if (integration?.flowId) {
      flowAction = await FlowActions.findOne({
        flowId: flow.id,
        order: 0,
      });

      if (actionWithSendNext.includes(flowAction?.type || '')) sendNextMessage = true;
    }
  }

  if (!flowAction) return;

  await Conversations.updateConversation(conversation.id, {
    currentFlowActionId: flowAction.id,
  });

  switch (flowAction.type) {
    case 'erxes.action.send.message':
      await processSendMessage(flowAction, conversation);

      if (
        await FlowActions.findOne({
          flowId: flowAction.flowId,
          order: flowAction.order + 1,
        })
      )
        sendNextMessage = true;

      break;
    case 'erxes.action.to.ask':
      await processSendMessage(flowAction, conversation);
      break;

    case 'erxes.action.define.department':
      Conversations.updateConversation(conversation.id, {
        channelId: flowAction.value,
      });

      if (
        await FlowActions.findOne({
          flowId: flowAction.flowId,
          order: flowAction.order + 1,
        })
      )
        sendNextMessage = true;

      break;
    case 'erxes.action.transfer.to.agent':
      const condition = JSON.parse(flowAction.value || '{}');

      handleTransferToAgent(flowAction, conversation, integration, condition);

      break;
    case 'erxes.action.execute.automation.flow':
      sendNextMessage = true;

      break;

    default:
      break;
  }

  if (sendNextMessage) {
    await new Promise(res => setTimeout(res, 1000));
    await handleMessage(msg);
  }
};

const handleTransferToAgent = async (
  flowAction: IFlowActionDocument,
  conversation: IConversationDocument,
  integration: IIntegrationDocument,
  condition: IFlowActionValueCondition,
) => {
  let assignedUserId: string = '';

  let channel = await Channels.findById(conversation.channelId);

  if (channel && channel.memberIds?.length) {
    let users = await Users.aggregate([
      {
        $match: {
          _id: { $in: channel.memberIds },
          lastSeenAt: {
            $gte: moment()
              .subtract(61, 'seconds')
              .toDate(),
          },
        },
      },
      { $sample: { size: 1 } },
    ]);

    if (users?.length) {
      assignedUserId = users[0]._id;
    }
  }

  if (assignedUserId) {
    const conversations: IConversationDocument[] = await Conversations.assignUserConversation(
      [conversation.id],
      assignedUserId,
    );

    // notify graphl subscription
    publishConversationsChanged([conversation.id], 'assigneeChanged');

    let assignedUser = await Users.getUser(assignedUserId);

    for (const conversation of conversations) {
      let message = await ConversationMessages.addMessage({
        conversationId: conversation._id,
        content: `${assignedUser.details?.shortName || assignedUser.email} has been assigned to this conversation`,
        fromBot: true,
      });

      graphqlPubsub.publish('conversationClientMessageInserted', {
        conversationClientMessageInserted: message,
      });

      if (condition.value) {
        let content = condition.value;
        let details: IDetail = assignedUser.details?.toObject() || {};

        const keys = Object.keys(details);

        for (const key of keys) {
          content = content.replace(new RegExp(`{{${key}}}`), details[key]);
        }

        handleSendMessage(
          integration,
          conversation,
          {
            conversationId: conversation.id,
            flowActionId: flowAction.id,
            internal: false,
            content,
          },
          assignedUser,
        );
      }
    }
  } else if (condition.error) {
    let user: IUserDocument | null = null;

    if (channel && channel.memberIds?.length) {
      let users = await Users.aggregate([
        {
          $match: {
            brandIds: { $in: [integration.brandId] },
          },
        },
        { $sample: { size: 1 } },
      ]);

      if (users?.length) {
        user = users[0];
      }
    }

    if (!user) {
      let users = await Users.aggregate([
        {
          $match: {
            brandIds: { $in: [integration.brandId] },
          },
        },
        { $sample: { size: 1 } },
      ]);

      if (users?.length) {
        user = users[0];
      }
    }

    if (!user) user = await Users.findOne({ isOwner: true });

    if (user) {
      const conversations: IConversationDocument[] = await Conversations.assignUserConversation(
        [conversation.id],
        user._id,
      );

      // notify graphl subscription
      publishConversationsChanged([conversation.id], 'assigneeChanged');

      for (const conversation of conversations) {
        let message = await ConversationMessages.addMessage({
          conversationId: conversation._id,
          content: `${user.details?.shortName || user.email} has been assigned to this conversation`,
          fromBot: true,
        });

        graphqlPubsub.publish('conversationClientMessageInserted', {
          conversationClientMessageInserted: message,
        });

        handleSendMessage(
          integration,
          conversation,
          {
            conversationId: conversation.id,
            flowActionId: flowAction.id,
            internal: false,
            content: condition.error,
          },
          user,
        );
      }
    }
  }
};

const processSendMessage = async (flowAction: IFlowActionDocument, conversation: IConversationDocument) => {
  const integration = await Integrations.getIntegration(conversation.integrationId);

  if (!integration) return;

  const customer = await Customers.findById(conversation.customerId);

  if (!customer) return;

  const flow = await Flows.findById(integration.flowId);

  if (!flow) return;

  const user = await Users.findById(flow?.assignedUserId);

  if (!user) return;

  const { content }: IFlowActionValue = JSON.parse(flowAction.value || '[]');

  let position = content.length - 1;

  position = Math.round(position * Math.random());

  let lastMessage = await ConversationMessages.findOne({
    userId: conversation.assignedUserId,
    conversationId: conversation.id,
  })
    .sort({ createdAt: -1 })
    .exec();

  if (
    lastMessage &&
    content.includes(lastMessage.content || '') &&
    moment(lastMessage.createdAt).isAfter(moment().subtract(30, 'minutes'))
  )
    return;

  const doc: IConversationMessageAdd = {
    conversationId: conversation.id,
    flowActionId: flowAction.id,
    internal: false,
    content: content[position],
  };

  handleSendMessage(integration, conversation, doc, user);
};

const handleSendMessage = async (
  integration: IIntegrationDocument,
  conversation: IConversationDocument,
  doc: any,
  user: IUserDocument,
) => {
  const message = await ConversationMessages.addMessage(doc, user._id);

  const kind = integration.kind;
  const integrationId = integration.id;
  const conversationId = conversation.id;

  let requestName;
  let type;
  let action;

  // send reply to facebook
  if (kind === KIND_CHOICES.FACEBOOK_MESSENGER) {
    type = 'facebook';
    action = 'reply-messenger';
  }

  // send reply to chatfuel
  if (kind === KIND_CHOICES.CHATFUEL) {
    requestName = 'replyChatfuel';
  }

  if (kind === KIND_CHOICES.TWITTER_DM) {
    requestName = 'replyTwitterDm';
  }

  if (kind === KIND_CHOICES.WHATSPRO) {
    type = 'whatspro';
    requestName = 'replyWhatsPro';
  }

  await sendConversationToIntegrations(
    type,
    integrationId,
    conversationId,
    requestName,
    doc,
    { IntegrationsAPI: new IntegrationsAPI() },
    action,
    message._id,
  );

  const dbMessage = await ConversationMessages.getMessage(message._id);

  // Publishing both admin & client
  publishMessage(dbMessage, conversation.customerId);
};

export default {
  handleMessage,
};
