import { ChannelType } from 'discord-api-types/v10';

export type GuildChannelLike = {
  id: string;
  name?: string;
  type: ChannelType;
  position?: number;
  parent_id?: string | null;
};
