import { getEnv } from '@erxes/api-utils/src';
import { Conversations, IConversation } from '../models';
import { sendInboxMessage } from '../messageBroker';
import { ConversationMessages } from '../models';
import fetch from 'node-fetch';
import type { RequestInit, HeaderInit } from 'node-fetch';
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
  private headers: HeaderInit;
  private subdomain: string;
  private integrationId: string;

  constructor(config: any) {
    this.subdomain = config.subdomain;
    this.integrationId = config.integrationId;
    this.headers = {
      'X-Viber-Auth-Token': config.token,
    };
  }

  async registerWebhook(): Promise<any> {
    // used for local testing
    const localDomain: string = 'https://8e09-103-212-118-66.ngrok-free.app';

    const domain: string = getEnv({ name: 'DOMAIN', subdomain: this.subdomain })
      ? getEnv({ name: 'DOMAIN', subdomain: this.subdomain }) + '/gateway'
      : localDomain;

    const url: string = `${domain}/pl:viber/webhook/${this.integrationId}`;

    try {
      const response = await fetch('https://chatapi.viber.com/pa/set_webhook', {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          event_types: [
            'delivered',
            'seen',
            'failed',
            'subscribed',
            'unsubscribed',
            'conversation_started',
            'message',
          ],
          send_name: true,
          send_photo: true,
        }),
      }).then((res) => res.json());
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
      { senderId: 1 },
    );

    if (!conversation) {
      throw new Error('conversation not found');
    }

    const name = await this.getName(message.integrationId);
    const plainText: string = message.content.replace(/<[^>]+>/g, '');
    const commonReqestParams: RequestInit = {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
    };
    const url = 'https://chatapi.viber.com/pa/send_message';
    const commonBodyParams = {
      receiver: conversation.senderId,
      min_api_version: 1,
      sender: {
        name,
        avatar: null,
      },
      tracking_data: 'tracking data',
    };

    const messagePayload: RequestInit = {
      ...commonReqestParams,
      body: JSON.stringify({
        ...commonBodyParams,
        type: 'text',
        text: plainText.slice(0, 512),
      }),
    };

    let response: any = {};

    if (plainText.length > 0) {
      response = await fetch(url, messagePayload).then((res) => res.json());
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
          const attachmentPayload: RequestInit = {
            ...commonReqestParams,
            body: JSON.stringify({
              ...commonBodyParams,
              type: 'picture',
              text: null,
              media: this.generateAttachmentUrl(attachment.url),
              thumbnail: this.generateAttachmentUrl(attachment.url),
            }),
          };
          attachmentResponse = await fetch(url, attachmentPayload).then((res) =>
            res.json(),
          );
        } else {
          const attachmentPayload: RequestInit = {
            ...commonReqestParams,
            body: JSON.stringify({
              ...commonBodyParams,
              type: 'document',
              size: attachment.size,
              media: this.generateAttachmentUrl(attachment.url),
              file_name: attachment.url,
            }),
          };
          attachmentResponse = await fetch(url, attachmentPayload).then((res) =>
            res.json(),
          );
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
      defaultValue: null,
    });

    if (inboxIntegration) {
      return inboxIntegration.name;
    }

    return 'Viber';
  }

  async savetoDatabase(
    conversation: IConversation,
    plainText: string,
    message: any,
  ): Promise<void> {
    await ConversationMessages.create({
      conversationId: conversation._id,
      createdAt: new Date(),
      userId: message.userId,
      customerId: null,
      content: plainText,
      messageType: 'text',
      attachments: message.attachments,
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
