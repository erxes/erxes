import { getEnv, sendRequest } from '@erxes/api-utils/src';
import { Conversations, IConversation } from '../models';
import { sendInboxMessage } from '../messageBroker';
import { IRequestParams } from '@erxes/api-utils/src/requests';
import { ConversationMessages } from '../models';

interface IAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
  duration: number;
}

interface IMessage {
  integrationId: string;
  conversationId: string;
  content: string;
  internal: boolean;
  attachments: IAttachment[];
  userId: string;
}

export class ViberAPI {
  private headers: any;
  private subdomain: string;
  private integrationId: string;

  constructor(config: any) {
    this.subdomain = config.subdomain;
    this.integrationId = config.integrationId;
    this.headers = {
      'X-Viber-Auth-Token': config.token
    };
  }

  async registerWebhook(): Promise<any> {
    // used for local testing
    const localDomain: string = 'https://a2de-202-21-104-34.jp.ngrok.io';

    const domain: string = getEnv({ name: 'DOMAIN', subdomain: this.subdomain })
      ? getEnv({ name: 'DOMAIN', subdomain: this.subdomain }) + '/gateway'
      : localDomain;

    const url: string = `${domain}/pl:viber/webhook/${this.integrationId}`;

    const payload: IRequestParams = {
      method: 'POST',
      headers: this.headers,
      url: 'https://chatapi.viber.com/pa/set_webhook',
      body: {
        url,
        event_types: [
          'delivered',
          'seen',
          'failed',
          'subscribed',
          'unsubscribed',
          'conversation_started',
          'message'
        ],
        send_name: true,
        send_photo: true
      }
    };

    try {
      const response = await sendRequest(payload);
      if (response.status === 0) {
        return response;
      } else if (response.status === 2) {
        throw new Error('Invalid Auth Token');
      } else {
        throw new Error(response.status_message);
      }
    } catch (e) {
      throw e.message;
    }
  }

  async sendMessage(message: IMessage): Promise<any> {
    const conversation: IConversation | null = await Conversations.findOne(
      { erxesApiId: message.conversationId },
      { senderId: 1 }
    );

    if (!conversation) {
      throw new Error('conversation not found');
    }

    const name = await this.getName(message.integrationId);
    const plainText: string = message.content.replace(/<[^>]+>/g, '');
    const commonReqestParams = {
      method: 'POST',
      headers: this.headers,
      url: 'https://chatapi.viber.com/pa/send_message'
    };
    const commonBodyParams = {
      receiver: conversation.senderId,
      min_api_version: 1,
      sender: {
        name,
        avatar: null
      },
      tracking_data: 'tracking data'
    };

    const messagePayload: IRequestParams = {
      ...commonReqestParams,
      body: {
        ...commonBodyParams,
        type: 'text',
        text: plainText.slice(0, 512)
      }
    };

    let response: any = {};

    if (plainText.length > 0) {
      response = await sendRequest(messagePayload);
      if (response.status !== 0) {
        if (!conversation) {
          throw new Error('message not sent');
        }
      }
    }

    const sentAttachments: IAttachment[] = [];

    if (message.attachments.length > 0) {
      for (const attachment of message.attachments) {
        let attachmentResponse: any = {};
        if (['image/jpeg', 'image/png'].includes(attachment.type)) {
          const attachmentPayload: IRequestParams = {
            ...commonReqestParams,
            body: {
              ...commonBodyParams,
              type: 'picture',
              text: null,
              media: this.generateAttachmentUrl(attachment.url),
              thumbnail: this.generateAttachmentUrl(attachment.url)
            }
          };
          attachmentResponse = await sendRequest(attachmentPayload);
        } else {
          const attachmentPayload: IRequestParams = {
            ...commonReqestParams,
            body: {
              ...commonBodyParams,
              type: 'document',
              size: attachment.size,
              media: this.generateAttachmentUrl(attachment.url),
              file_name: attachment.url
            }
          };
          attachmentResponse = await sendRequest(attachmentPayload);
        }

        if (attachmentResponse.status === 0) {
          sentAttachments.push(attachment);
        } else {
          throw new Error(attachmentResponse.status_message);
        }
      }
      message.attachments = sentAttachments;
    }

    this.savetoDatabase(conversation, plainText, message);

    return response;
  }

  async getName(integrationId: string): Promise<any> {
    const inboxIntegration = await sendInboxMessage({
      subdomain: this.subdomain,
      action: 'integrations.findOne',
      data: { _id: integrationId },
      isRPC: true,
      defaultValue: null
    });

    if (inboxIntegration) {
      return inboxIntegration.name;
    }

    return 'Viber';
  }

  async savetoDatabase(
    conversation: IConversation,
    plainText: string,
    message: any
  ): Promise<void> {
    await ConversationMessages.create({
      conversationId: conversation._id,
      createdAt: new Date(),
      userId: message.userId,
      customerId: null,
      content: plainText,
      messageType: 'text',
      attachments: message.attachments
    });
  }

  generateAttachmentUrl(urlOrName: string) {
    const DOMAIN = getEnv({ name: 'DOMAIN' });
    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    if (urlOrName.startsWith('http')) {
      return urlOrName;
    }

    if (NODE_ENV === 'development') {
      return `${DOMAIN}/pl:core/read-file?key=${urlOrName}`;
    }

    return `${DOMAIN}/gateway/pl:core/read-file?key=${urlOrName}`;
  }
}
