import { Document } from 'mongoose';

export type TDiscordBotHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'broken'
  | 'syncing';

export interface IDiscordBotHealth {
  status: TDiscordBotHealthStatus;
  // Whether the bot token was accepted by Discord on the last save.
  isTokenValid?: boolean;
  // The bot's Discord username, resolved from the token when it is valid.
  botUsername?: string;
  lastVerifiedAt?: Date;
  lastError?: string;
}

export interface IDiscordBot {
  name: string;
  // Discord application (client) id
  applicationId: string;
  // Bot token used for REST calls (Authorization: Bot <token>) and the Gateway
  token: string;
  // Optional default guild (server) the bot operates in
  guildId?: string;
  // Human name of that guild, for display (e.g. the sidebar's server groups).
  // Stored at creation when the wizard knows it; otherwise self-healed from
  // Discord REST the first time it's needed.
  guildName?: string;
  // Optional default channel messages are sent to when an action omits one
  channelId?: string;
  description?: string;
  // Inbox integration id this bot is linked to (the canonical record)
  erxesApiId?: string;
  health?: IDiscordBotHealth;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface IDiscordBotDocument extends IDiscordBot, Document {
  _id: string;
}

export type IDiscordBotEditInput = Partial<
  Pick<
    IDiscordBot,
    | 'name'
    | 'applicationId'
    | 'token'
    | 'guildId'
    | 'guildName'
    | 'channelId'
    | 'description'
    | 'erxesApiId'
  >
>;
