import {
  ChannelType,
  Client,
  GatewayIntentBits,
  Message,
  TextChannel
} from 'discord.js';
import { receiveMessage } from './receiveMessage';
import { getConfig } from './messageBroker';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { Messages } from './models';
import { debugBase } from '@erxes/api-utils/src/debuggers';

type BotResponse<T> =
  | { status: 'error'; data: string }
  | { status: 'success'; data: T };

export class DiscordBot {
  client: Client;
  isLoggedIn: boolean = false;
  loginTimer;

  constructor() {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
      ]
    });
    client.on('ready', () => {
      console.log(`Logged in as ${client?.user?.tag}!`);
      this.isLoggedIn = true;
    });

    client.on('messageCreate', async message => {
      receiveMessage(message);
    });
    this.client = client;
  }

  getChannel = async (channelId: string): Promise<BotResponse<TextChannel>> => {
    const channel = await this.client.channels.fetch(channelId);
    if (channel == null) {
      return {
        status: 'error',
        data: 'Channel not found'
      };
    }
    if (channel.type !== ChannelType.GuildText) {
      return {
        status: 'error',
        data: 'Channel is not a text channel'
      };
    }
    return { status: 'success', data: channel };
  };

  replyToMessage = async (message, conversationMessage) => {
    const { content } = conversationMessage;
    if (this.isLoggedIn == false) {
      await this.login();
    }

    const result = await this.getChannel(message.channelId);

    if (result.status == 'error') {
      return result;
    }

    const { data: channel } = result;

    const fetchedMessage = await channel.messages.fetch(message.messageId);
    const formattedContent: string = NodeHtmlMarkdown.translate(content);

    const response = await fetchedMessage.reply(formattedContent);
    const newMessage = await Messages.create({
      inboxConversationId: conversationMessage.conversationId,
      inboxIntegrationId: conversationMessage.integrationId,
      channelId: message.channelId,
      messageId: response.id,
      inReplyTo: message.messageId,
      to: [
        {
          name: fetchedMessage.author.username,
          address: fetchedMessage.author.id
        }
      ],
      from: [
        { name: this.client.user?.username, address: this.client.user?.id }
      ],
      body: formattedContent,
      subject: formattedContent
    });

    return { status: 'success', data: newMessage };
  };

  getMessage = async (
    channelId: string,
    messageId: string
  ): Promise<BotResponse<Message>> => {
    if (this.isLoggedIn == false) {
      await this.login();
    }
    const channel = await this.client.channels.fetch(channelId);
    if (channel == null) {
      return {
        status: 'error',
        data: 'Channel not found'
      };
    }
    if (channel.type !== ChannelType.GuildText) {
      return {
        status: 'error',
        data: 'Channel is not a text channel'
      };
    }
    const message = await channel.messages.fetch(messageId);
    return { status: 'success', data: message };
  };

  login = async () => {
    const botToken = await getConfig('DISCORD_BOT_TOKEN', 'os', '');
    if (this.loginTimer) {
      clearTimeout(this.loginTimer);
      this.loginTimer = undefined;
    }
    try {
      await this.client.login(botToken);
    } catch (e) {
      // Try logging in again after 5 minutes
      const retryInMin = 5;
      debugBase(
        `Unable to login with the current DISCORD_BOT_TOKEN retrying in ${retryInMin}`
      );
      this.loginTimer = setTimeout(() => {
        this.login();
      }, 1000 * 60 * retryInMin);
    }
  };
}
