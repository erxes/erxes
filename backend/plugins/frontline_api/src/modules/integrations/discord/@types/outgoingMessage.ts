import {
  type APIActionRowComponent,
  type APIComponentInMessageActionRow,
  type APIEmbed,
  type RESTAPIPoll,
} from 'discord-api-types/v10';

export type DiscordMessageAttachment = { url: string; filename?: string };

export type DiscordPollRequest = RESTAPIPoll;

export type TSendChannelMessageArgs = {
  token: string;
  channelId: string;
  content?: string;
  embeds?: APIEmbed[];
  components?: APIActionRowComponent<APIComponentInMessageActionRow>[];
  files?: DiscordMessageAttachment[];
  poll?: DiscordPollRequest;
  messageReference?:
    | string
    | {
        type: 1;
        messageId: string;
        channelId: string;
        guildId?: string;
      };
};
