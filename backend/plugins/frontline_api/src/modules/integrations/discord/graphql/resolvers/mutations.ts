import { IContext } from '~/connectionResolvers';
import {
  IDiscordBot,
  IDiscordBotEditInput,
} from '@/integrations/discord/@types/bot';

export const discordMutations = {
  discordAddBot: (
    _root: undefined,
    args: IDiscordBot & { channelIds?: string[] },
    { models, user }: IContext,
  ) => models.DiscordBots.createBot({ ...args, createdBy: user._id }),

  discordUpdateBot: (
    _root: undefined,
    { _id, ...doc }: { _id: string } & IDiscordBotEditInput,
    { models, user }: IContext,
  ) => models.DiscordBots.updateBot(_id, { ...doc, updatedBy: user._id }),

  discordRemoveBot: (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => models.DiscordBots.removeBot(_id),
};
