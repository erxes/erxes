import type { IModels } from '~/connectionResolvers';

import { getErrorMessage } from '@/integrations/discord/utils/request';

import { getDiscordUser } from '@/integrations/discord/utils/bot';

import { debugError } from '@/integrations/discord/debuggers';

import { MENTION_TOKEN } from '@/integrations/discord/constants/mentions';

export const resolveMentionsForReply = async (
  models: IModels,
  token: string,
  text: string,
  content: string,
) => {
  const mentionIds = [
    ...new Set([...text.matchAll(MENTION_TOKEN)].map((m) => m[1])),
  ];

  const nameByUserId = new Map<string, string>();
  for (const id of mentionIds) {
    const mentioned = await models.DiscordCustomers.findOne({ userId: id });
    let name = mentioned?.firstName;

    if (!name) {
      try {
        const user = await getDiscordUser(token, id);
        name = user?.global_name || user?.username;
      } catch (e) {
        debugError(
          `Failed to resolve Discord mention name for ${id}: ${getErrorMessage(
            e,
          )}`,
        );
      }
    }

    nameByUserId.set(id, name || 'user');
  }

  const toName = (_m: string, id: string) =>
    `@${nameByUserId.get(id) || 'user'}`;

  return {
    discordText: text.replace(MENTION_TOKEN, (_m, id) => `<@${id}>`),
    mirrorText: text.replace(MENTION_TOKEN, toName),
    displayContent: content.replace(MENTION_TOKEN, toName),
  };
};
