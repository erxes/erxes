import type { IModels } from '~/connectionResolvers';
import { type TInboxRelayDoc } from '@/integrations/discord/@types/inboxRelay';
import { handleDiscordTypingRelay } from '@/integrations/discord/controller/relayTyping';
import {
  handleDiscordReaction,
  handleDiscordPinMessenger,
} from '@/integrations/discord/services/messages/actions';
import { handleDiscordReplyMessenger } from '@/integrations/discord/services/messages/reply';

/** Route inbox relay actions to the appropriate Discord operation. */
export const handleDiscordMessage = (
  models: IModels,
  msg: { action: string; payload: string },
  subdomain: string,
) => {
  const { action, payload } = msg;
  const doc: TInboxRelayDoc = JSON.parse(payload || '{}');

  if (action === 'typing') {
    return handleDiscordTypingRelay(models, doc);
  }

  if (action === 'react-messenger') {
    return handleDiscordReaction(models, doc);
  }

  if (action === 'pin-messenger') {
    return handleDiscordPinMessenger(models, doc, subdomain);
  }

  if (action === 'reply-messenger') {
    return handleDiscordReplyMessenger(models, subdomain, doc);
  }

  return { status: 'success' };
};
