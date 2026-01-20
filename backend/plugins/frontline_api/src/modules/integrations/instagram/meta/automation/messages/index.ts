import { debugError } from "@/integrations/instagram/debuggers";
import { checkContentConditions } from '@/integrations/instagram/meta/automation/utils/messageUtils';
import { IModels } from '~/connectionResolvers';
import { generateMessages, generateObjectToWait, getData, sendMessage } from '../messages/utils';
import { IInstagramConversation, IInstagramConversationDocument } from "../../../@types/conversations";
import { IInstagramCustomerDocument } from "../../../@types/customers";
import { AutomationExecutionSetWaitCondition, EXECUTE_WAIT_TYPES } from "erxes-api-shared/core-modules";

export const checkMessageTrigger = async (subdomain, { target, config }) => {
    const { conditions = [], botId } = config;
    if (target.botId !== botId) {
      return;
    }
    const payload = target?.payload || {};
    const { persistentMenuId, isBackBtn } = payload;
    if (persistentMenuId && isBackBtn) {
      await sendAutomationsMessage({
        subdomain,
        action: "excutePrevActionExecution",
        data: {
          query: {
            triggerType: "instagram:messages",
            "target.botId": botId,
            "target.conversationId": target.conversationId,
            "target.customerId": target.customerId
          }
        },
        isRPC: true
      }).catch((error) => {
        debugError(error.message);
      });
  
      return false;
    }
  
    for (const {
      isSelected,
      type,
      persistentMenuIds,
      conditions: directMessageCondtions = []
    } of conditions) {
      if (isSelected) {
        if (type === "getStarted" && target.content === "Get Started") {
          return true;
        }
  
        if (type === "persistentMenu" && payload) {
          if ((persistentMenuIds || []).includes(String(persistentMenuId))) {
            return true;
          }
        }
  
        if (type === "direct") {
          if (directMessageCondtions?.length > 0) {
            return !!checkContentConditions(
              target?.content || "",
              directMessageCondtions
            );
          } else if (!!target?.content) {
            return true;
          }
        }
      }
      continue;
    }
  };


  export const actionCreateMessage = async (
    models: IModels,
    subdomain,
    action,
    execution
  ) => {
    const { target, triggerType, triggerConfig } = execution || {};
    const { config } = action || {};
    if (
      !["instagram:messages", "instagram:comments", "instagram:ads"].includes(
        triggerType
      )
    ) {
      throw new Error("Unsupported trigger type");
    }
    const {
      conversation,
      customer,
      integration,
      bot,
      senderId,
      recipientId,
      botId
    } = await getData(models, subdomain, triggerType, target, triggerConfig);
  
    let result: any[] = [];
  
    try {
      const messages = await generateMessages(
        subdomain,
        config,
        conversation,
        customer
      );
  
      if (!messages?.length) {
        return "There are no generated messages to send.";
      }
  
      for (const { botData, inputData, ...message } of messages) {
        let resp;
  
        try {
          resp = await sendMessage(models, bot, {
            senderId,
            recipientId,
            integration,
            message
          });
        } catch (error) {
          debugError(error.message);
          throw new Error(error.message);
        }
  
        if (!resp) {
          throw new Error("Something went wrong to send this message");
        }
  
        const conversationMessage = await models.InstagramConversationMessage.addMessage({
          conversationId: conversation._id as string,
          content: "<p>Bot Message</p>",
          internal: false,
          mid: resp.message_id,
          botId,
          botData,
          fromBot: true
        });

        //findmust
        // const conversationObj = conversation.toObject();
        // const doc = {
        //   ...conversationObj,
        //   _id: conversationObj._id.toString(),
        //   conversationId: conversation.erxesApiId,
        // };
        // await pConversationClientMessageInserted(subdomain, doc);

        // sendInboxMessage({
        //   subdomain,
        //   action: "conversationClientMessageInserted",
        //   data: {
        //     ...conversationMessage.toObject(),
        //     conversationId: conversation.erxesApiId
        //   }
        // });
  
        result.push(conversationMessage);
      }
  
      const { optionalConnects = [] } = config;
  
      if (!optionalConnects?.length) {
        return result;
      }
      // return {
      //   result,
      //   objToWait: generateObjectToWait({
      //     messages: config?.messages || [],
      //     conversation,
      //     customer,
      //     optionalConnects
      //   })
      // };
      // changed same as facebook
      return {
        result,
        waitCondition: generateConditionWaitToAction({
          config,
          conversation,
          customer,
        })
      };
    } catch (error) {
      debugError(error.message);
      throw new Error(error.message);
    }
  };

  const generateConditionWaitToAction = ({
    config,
    customer,
    conversation,
  }: {
    config: any;
    conversation: IInstagramConversationDocument;
    customer: IInstagramCustomerDocument;
  }): AutomationExecutionSetWaitCondition => {
    return {
      type: EXECUTE_WAIT_TYPES.CHECK_OBJECT,
      propertyName: 'payload.btnId',
      expectedState: {
        conversationId: conversation._id,
        customerId: customer.erxesApiId,
      },
      shouldCheckOptionalConnect: true,
    };
  };
