import {
  TDiscordLabel,
  TDiscordMessagePayload,
  TDiscordUser,
} from '@/discordIntegration/@types/discordApi';

export type TDiscordInteractionOption = {
  name: string;
  type: number;
  value?: string | number | boolean;
  options?: TDiscordInteractionOption[];
};

export type TDiscordModalComponent = {
  type: number;
  custom_id?: string;
  value?: string;
  values?: string[];
  component?: TDiscordModalComponent;
  components?: TDiscordModalComponent[];
};

export type TDiscordInteraction = {
  id: string;
  application_id: string;
  type: number;
  token: string;
  guild_id?: string;
  channel_id?: string;
  channel?: { id: string; parent_id?: string | null };
  member?: { user: TDiscordUser; nick?: string | null };
  user?: TDiscordUser;
  data?: {
    name?: string;
    options?: TDiscordInteractionOption[];
    custom_id?: string;
    components?: TDiscordModalComponent[];
  };
};

export type TDiscordModal = {
  custom_id: string;
  title: string;
  components: TDiscordLabel[];
};

export type TDiscordInteractionResponse = {
  type: number;
  data?: (TDiscordMessagePayload & { flags?: number }) | TDiscordModal;
};

export type TDiscordTasksFilter = 'open' | 'all';
