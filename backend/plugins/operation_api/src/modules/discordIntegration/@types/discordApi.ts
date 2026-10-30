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
  verify_key: string;
  interactions_endpoint_url?: string | null;
};

export type TDiscordApplicationUpdate = {
  interactions_endpoint_url: string | null;
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

export type TDiscordButton = {
  type: 2;
  style: 1 | 2;
  label: string;
  custom_id: string;
  disabled?: boolean;
};

export type TDiscordTextInput = {
  type: 4;
  custom_id: string;
  style: 1 | 2;
  required?: boolean;
  max_length?: number;
  placeholder?: string;
};

export type TDiscordSelectOption = {
  label: string;
  value: string;
  description?: string;
  default?: boolean;
};

export type TDiscordStringSelect = {
  type: 3;
  custom_id: string;
  placeholder?: string;
  required?: boolean;
  min_values?: number;
  max_values?: number;
  options: TDiscordSelectOption[];
};

export type TDiscordLabel = {
  type: 18;
  label: string;
  description?: string;
  component: TDiscordTextInput | TDiscordStringSelect;
};

export type TDiscordActionRow = {
  type: 1;
  components: Array<TDiscordLinkButton | TDiscordButton>;
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

export type TDiscordCommandOption = {
  type: number;
  name: string;
  description: string;
  required?: boolean;
  choices?: { name: string; value: string | number }[];
  options?: TDiscordCommandOption[];
};

export type TDiscordSlashCommand = {
  name: string;
  description: string;
  type: number;
  options?: TDiscordCommandOption[];
};

export type TDiscordRequestArgs = {
  token: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?:
    | TDiscordMessagePayload
    | TDiscordSlashCommand[]
    | TDiscordApplicationUpdate;
};
