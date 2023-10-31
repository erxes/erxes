import * as strip from 'strip';
import axios from 'axios';
import * as request from 'request-promise';
import { generateModels } from '../../models';
import { debug } from '../../configs';
import { userIds } from '../middlewares/userMiddleware';
import {
  createOrUpdateConversation,
  createOrUpdateCustomer,
  isFollowedUser
} from '../controllers';
import { zaloSend } from '../../zalo';
import { generateAttachmentUrl } from '../../utils';

export const conversationMessagesBroker = ({
  consumeRPCQueue,
  consumeQueue
}) => {
  consumeRPCQueue(
    'zalo:conversationMessages.find',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ConversationMessages.find(data).lean()
      };
    }
  );

  consumeRPCQueue(
    'zalo:api_to_integrations',

    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { action, type, payload } = data;
      const doc = JSON.parse(payload || '{}');

      let response: any = null;

      if (type !== 'zalo') {
        return {
          status: 'success',
          errorMessage: 'Wrong kind'
        };
      }
      try {
        const {
          integrationId,
          conversationId,
          content = '',
          attachments = [],
          extraInfo
        } = doc;

        const conversation = await models.Conversations.getConversation({
          erxesApiId: conversationId
        });

        const { recipientId, senderId, zaloConversationId } = conversation;

        const conversationMessage = await models.ConversationMessages.findOne({
          conversationId: conversation?._id
        });

        console.log(
          'conversationMessage:',
          conversation?._id,
          conversationMessage
        );

        let recipient: { [key: string]: any } = {
          message_id: conversationMessage?.mid
        };
        let message: { [key: string]: any } = {
          text: strip(content)
        };

        // anonymous user id has a-f character. user has number only
        let isAnonymousUser = !Number(senderId);

        // check if user isFollower
        // const isFollower = await isFollowedUser(senderId, { models, oa_id: recipientId })
        // console.log('isFollower', isFollower);

        if (isAnonymousUser) {
          recipient = {
            anonymous_id: senderId,
            conversation_id: zaloConversationId
          };
        }

        if (attachments?.length) {
          console.log('attachments: ', attachments?.[0]);

          let element = attachments?.[0];
          let type = element.type?.startsWith('image') ? 'template' : 'file';
          let template_type = element.type?.startsWith('image')
            ? 'media'
            : 'file';
          message = {
            text: strip(content),
            attachment: {
              type,
              payload: {
                template_type
              }
            }
          };

          let attachmentUrl = generateAttachmentUrl(element.url);
          let file = await axios
            .get(attachmentUrl, { responseType: 'stream' })
            .then(res => res.data);

          let uploadedFile = await zaloSend(
            'upload/image',
            { file },
            {
              models,
              oa_id: recipientId,
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          console.log('uploadedFile', uploadedFile);

          if (template_type === 'media' && uploadedFile?.error === 0) {
            message.attachment.payload.elements = [
              {
                media_type: 'image',
                ...uploadedFile?.data
              }
            ];
          }
        }

        console.log('start messageSent:', message, recipient);

        const messageSent = await zaloSend(
          'message',
          {
            recipient,
            message
          },
          { models, oa_id: recipientId }
        );

        console.log(messageSent);

        const localMessage = await models.ConversationMessages.addMessage(
          {
            ...doc,
            content: strip(content),
            // inbox conv id comes, so override
            conversationId: conversation._id,
            mid: messageSent?.data?.message_id
          },
          doc.userId
        );

        response = {
          data: localMessage.toObject()
        };

        response.status = 'success';
      } catch (e) {
        response = {
          status: 'error',
          errorMessage: e.message
        };
      }

      return response;
    }
  );

  consumeQueue('zalo:notification', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { payload, type } = data;

    switch (type) {
      case 'addUserId':
        userIds.push(payload._id);
        break;
      default:
        break;
    }
  });
};
