import type { IModels } from '~/connectionResolvers';

import type { IDiscordBotDocument } from '@/integrations/discord/@types/bot';

import type { IDiscordCustomerDocument } from '@/integrations/discord/@types/customers';

import type { IDiscordConversationDocument } from '@/integrations/discord/@types/conversations';

import type {
  DiscordActivity,
  DiscordAttachment,
} from '@/integrations/discord/@types/activity';

import {
  getChannel,
  isThreadChannel,
} from '@/integrations/discord/utils/channels';

import { getErrorMessage } from '@/integrations/discord/utils/request';

import { debugError } from '@/integrations/discord/debuggers';

import { receiveInboxMessage } from '@/inbox/receiveMessage';

import { sleep } from '@/integrations/discord/utils/delay';

import { CONVERSATION_LINK_ATTEMPTS } from '@/integrations/discord/constants/persistence';

/**
 * Resolves a Discord channel id to its display name and, if it's a thread,
 * its parent channel's id/name — used when minting a new conversation so the
 * inbox can nest the thread under its parent. Best-effort: a lookup failure
 * must not block conversation creation, so failures are logged and swallowed.
 */
const resolveDiscordChannelInfo = async (token: string, channelId: string) => {
  let channelName: string | undefined;
  let isThread = false;
  let parentChannelId: string | undefined;
  let parentChannelName: string | undefined;

  try {
    const channelInfo = await getChannel(token, channelId);
    channelName = channelInfo?.name ?? undefined;

    if (channelInfo && isThreadChannel(channelInfo) && channelInfo.parent_id) {
      isThread = true;
      parentChannelId = channelInfo.parent_id;
      try {
        parentChannelName =
          (await getChannel(token, channelInfo.parent_id))?.name ?? undefined;
      } catch (e) {
        debugError(
          `Failed to resolve Discord parent channel ${
            channelInfo.parent_id
          }: ${getErrorMessage(e)}`,
        );
      }
    }
  } catch (e) {
    debugError(
      `Failed to resolve Discord channel ${channelId}: ${getErrorMessage(e)}`,
    );
  }

  return { channelName, isThread, parentChannelId, parentChannelName };
};

/**
 * Finds the conversation mirror for a Discord channel (one per channel; a
 * thread keeps its own channelId, so each thread is its own conversation), or
 * creates it on the channel's first message. On a concurrent create race,
 * adopts the winner's row instead of failing so this message still lands —
 * mirrors `attemptGetOrCreateCustomer`'s race handling. `createdInThisCall`
 * tells the caller whether it created the row — the only case a later
 * sync-failure rollback may delete it.
 */
export const findOrCreateDiscordConversation = async (
  models: IModels,
  bot: IDiscordBotDocument,
  activity: DiscordActivity,
  displayContent: string,
) => {
  const { channelId, author, timestamp } = activity;

  let conversation = await models.DiscordConversations.findOne({
    channelId: { $eq: channelId },
  });

  if (conversation) {
    conversation.content = displayContent || '';
    return { conversation, createdInThisCall: false };
  }

  // Resolve the channel id to its human name (e.g. 'general') for display in
  // the inbox, and detect whether it's a thread so the inbox can nest it
  // under its parent channel. The same `getChannel` call yields the thread's
  // `type` and `parent_id`, so thread detection costs no extra request.
  const { channelName, isThread, parentChannelId, parentChannelName } =
    await resolveDiscordChannelInfo(bot.token, channelId);

  try {
    conversation = await models.DiscordConversations.create({
      timestamp,
      channelId,
      channelName,
      isThread,
      parentChannelId,
      parentChannelName,
      authorId: author.id,
      guildId: activity.guildId,
      content: displayContent,
      integrationId: bot.erxesApiId,
    });
    return { conversation, createdInThisCall: true };
  } catch (e) {
    // A concurrent message for the same channel won the create race — adopt
    // the winner instead of failing so this message still lands. The
    // winner's row is not ours: `createdInThisCall` stays false so a later
    // sync failure here can't delete the row the winner is still linking.
    if (getErrorMessage(e).includes('duplicate')) {
      conversation = await models.DiscordConversations.findOne({
        channelId: { $eq: channelId },
      });
    }
    if (!conversation) {
      throw new Error(getErrorMessage(e));
    }
    return { conversation, createdInThisCall: false };
  }
};

/**
 * Concurrency: two first messages for the same channel race in
 * `findOrCreateDiscordConversation` — the Gateway dispatches events without
 * awaiting, and backfill replays run alongside live traffic. The mirror-row
 * create race is resolved there by adopting the winner's row, but that row's
 * core link (`erxesApiId`) only lands a beat later, right after the winner's
 * own inbox sync returns. If we adopt the row while it's still unlinked and
 * then sync it ourselves, BOTH calls mint a separate core conversation; the
 * row binds to one and the other is orphaned (holding a single stray
 * message). So a call that did NOT create the row waits here for the creator
 * to land the link, re-reading the row, before syncing anything itself.
 * Mirrors the customer create-race wait.
 */
export const waitForConversationLink = async (
  models: IModels,
  conversation: IDiscordConversationDocument,
  createdInThisCall: boolean,
) => {
  if (createdInThisCall || conversation.erxesApiId) {
    return conversation;
  }

  for (let attempt = 1; attempt <= CONVERSATION_LINK_ATTEMPTS; attempt++) {
    await sleep(250 * attempt);
    const refreshed = await models.DiscordConversations.findById(
      conversation._id,
    );
    // Row gone → the creator's sync failed and rolled it back; stop waiting
    // and (re)link it ourselves below. Linked → adopt the winner's link.
    if (!refreshed) {
      break;
    }
    if (refreshed.erxesApiId) {
      return refreshed;
    }
  }

  return conversation;
};

/**
 * Syncs the conversation to the inbox (mints or updates its core-side
 * conversation) and links the mirror row via `erxesApiId`. A channel
 * conversation isn't owned by a single customer, so the owner is set only
 * when first creating it (the initiating author) and never reassigned on
 * later updates — otherwise the inbox would flip the owner to whoever spoke
 * last; each message still carries its own author via
 * `create-conversation-message`. On the first sync for a row, guards the
 * claim so two concurrent first-messages for the same channel can't each bind
 * their own freshly-minted core conversation onto it (a blind save would let
 * the last writer win and orphan the other's conversation) — only the write
 * that finds the row still unlinked keeps its minted conversation; the loser
 * adopts the winner's link, or, if the row vanished (its creator rolled it
 * back on failure), re-attaches its own so the message isn't dropped. Rolls
 * back a row THIS call created if the sync itself fails; a pre-existing
 * conversation must survive a transient failure (deleting it would orphan its
 * mirrored messages and sever the inbox link) and is left in place to retry
 * on the next message.
 */
export const syncConversationToCore = async ({
  models,
  subdomain,
  bot,
  conversation,
  createdInThisCall,
  customer,
  previewContent,
  storedAttachments,
  timestamp,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
  conversation: IDiscordConversationDocument;
  createdInThisCall: boolean;
  customer: IDiscordCustomerDocument;
  previewContent: string;
  storedAttachments: DiscordAttachment[];
  timestamp: Date;
}) => {
  const isFirstSync = !conversation.erxesApiId;

  try {
    const data = {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        ...(isFirstSync ? { customerId: customer.erxesApiId } : {}),
        integrationId: bot.erxesApiId,
        content: previewContent,
        attachments: storedAttachments,
        conversationId: conversation.erxesApiId,
        updatedAt: timestamp,
      }),
    };

    const response = await receiveInboxMessage(subdomain, data);

    if (response.status !== 'success') {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(response)}`,
      );
    }

    const mintedApiId = (response.data as { _id: string })._id;

    if (!isFirstSync) {
      conversation.erxesApiId = mintedApiId;
      await conversation.save();
      return conversation;
    }

    const claimed = await models.DiscordConversations.findOneAndUpdate(
      { _id: conversation._id, erxesApiId: null },
      { $set: { erxesApiId: mintedApiId } },
      { new: true },
    );

    if (claimed) {
      return claimed;
    }

    const winner = await models.DiscordConversations.findById(conversation._id);
    if (winner?.erxesApiId) {
      return winner;
    }

    // The row vanished between the sync and the claim (its creator rolled it
    // back on a failure): re-attach our minted link so the message still
    // lands rather than being dropped.
    const restored = await models.DiscordConversations.findOneAndUpdate(
      { channelId: conversation.channelId },
      { $setOnInsert: { ...conversation.toObject(), erxesApiId: mintedApiId } },
      { upsert: true, new: true },
    ).catch((error: unknown) => {
      if (!getErrorMessage(error).includes('duplicate')) throw error;
      return models.DiscordConversations.findOne({
        channelId: conversation.channelId,
      });
    });
    if (!restored) {
      throw new Error(
        'Discord conversation disappeared while restoring its inbox link',
      );
    }
    if (restored.erxesApiId) {
      return restored;
    }
    // A concurrent creator may have restored an unlinked row first.
    const linked = await models.DiscordConversations.findOneAndUpdate(
      { _id: restored._id, erxesApiId: null },
      { $set: { erxesApiId: mintedApiId } },
      { new: true },
    );
    const linkedConversation =
      linked || (await models.DiscordConversations.findById(restored._id));
    if (!linkedConversation?.erxesApiId) {
      throw new Error(
        'Discord conversation disappeared while linking to the inbox',
      );
    }
    return linkedConversation;
  } catch (e) {
    // Roll back only a row this call created — see the doc comment above.
    if (createdInThisCall) {
      await models.DiscordConversations.deleteOne({
        _id: conversation._id,
        erxesApiId: null,
      });
    }
    throw new Error(getErrorMessage(e));
  }
};
