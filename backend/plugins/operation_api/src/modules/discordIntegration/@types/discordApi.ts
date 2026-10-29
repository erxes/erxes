export type TDiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
};

export type TDiscordGuildMember = {
  user?: TDiscordUser;
  nick?: string | null;
};

export type TDiscordOAuthClient = {
  applicationId: string;
  clientSecret: string;
};

export type TDiscordOAuthToken = {
  access_token: string;
  token_type: string;
  scope: string;
};

export type TDiscordApplication = {
  id: string;
  name: string;
};

export type TDiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
};

export type TDiscordChannel = {
  id: string;
  name: string;
  type: number;
  position?: number;
};

export type TDiscordEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type TDiscordEmbed = {
  author?: { name: string };
  title?: string;
  url?: string;
  description?: string;
  color?: number;
  fields?: TDiscordEmbedField[];
  footer?: { text: string };
  timestamp?: string;
};

export type TDiscordLinkButton = {
  type: 2;
  style: 5;
  label: string;
  url: string;
};

export type TDiscordActionRow = {
  type: 1;
  components: TDiscordLinkButton[];
};

export type TDiscordMessagePayload = {
  content?: string;
  embeds?: TDiscordEmbed[];
  components?: TDiscordActionRow[];
  allowed_mentions?: { parse?: string[]; users?: string[] };
  message_reference?: { message_id: string; fail_if_not_exists?: boolean };
};

export type TDiscordMessage = {
  id: string;
  channel_id: string;
};

export type TDiscordErrorBody = {
  message?: string;
  code?: number;
  retry_after?: number;
  error?: string;
  error_description?: string;
};

export type TDiscordRequestArgs = {
  token: string;
  method?: 'GET' | 'POST' | 'PATCH';
  path: string;
  body?: TDiscordMessagePayload;
};
