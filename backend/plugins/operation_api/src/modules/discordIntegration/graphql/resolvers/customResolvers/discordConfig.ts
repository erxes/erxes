import { IDiscordConfig } from '@/discordIntegration/@types/discordConfig';

export const OperationDiscordConfig = {
  mention: ({ mention }: IDiscordConfig) => mention ?? 'none',
  mentionEvents: ({ mentionEvents }: IDiscordConfig) => mentionEvents ?? [],
};
