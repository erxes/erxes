import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import {
  DiscordActivity,
  DiscordPollVoteEvent,
} from '@/integrations/discord/@types/activity';
import {
  isIgnorableActivity,
  normalizeDiscordPoll,
  resolveDiscordMentions,
} from '@/integrations/discord/activity';
import { getMessage } from '@/integrations/discord/utils';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';

/**
 * Resolves the local conversation that owns a previously-stored Discord message.
 * Edit and poll-vote events both reference a message we've already ingested, so
 * we recover the conversation (and its inbox `erxesApiId`) through the message
 * mirror rather than re-deriving channel+author. Returns `null` when the message
 * predates the integration (nothing to route).
 */
const resolveConversationByMessageId = async (
  models: IModels,
  messageId: string,
) => {
  if (!messageId) {
    return null;
  }

  const message = await models.DiscordConversationMessages.findOne({
    messageId: { $eq: messageId },
  });

  if (!message?.conversationId) {
    return null;
  }

  const conversation = await models.DiscordConversations.findById(
    message.conversationId,
  );

  if (!conversation?.erxesApiId) {
    return null;
  }

  return { message, conversation };
};

/**
 * Merges `extraPatch` into the inbox message that mirrors `discordMessageId`
 * (located via the `extraData.discordMessageId` stamp set when the message was
 * stored) and re-publishes `conversationMessageInserted`. Shared by the live
 * structured-content updates — poll-vote tallies and asynchronously-unfurled
 * embeds. Re-emitting the same message `_id` with fresh `extraData` updates the
 * card in place (the frontend replaces a same-id message rather than appending),
 * so no separate "message updated" subscription is needed. No-op when the poll/
 * embed predates the stamping or isn't mirrored to the inbox.
 */
const updateInboxMessageExtra = async (
  models: IModels,
  discordMessageId: string,
  extraPatch: Record<string, unknown>,
): Promise<boolean> => {
  // Set each patched key by path (`extraData.poll`, `extraData.embeds`) so Mongo
  // merges into the existing `extraData` server-side. This does it in one
  // round-trip (no read-then-merge, no re-read to publish) AND is atomic per
  // key: a concurrent poll-vote and embed unfurl patch different sub-keys, so
  // they can't clobber each other the way a whole-object read-merge-write would.
  // `extraData` is guaranteed to exist on any matched row (that's how it's
  // located), and `discordMessageId` is left untouched since only the patched
  // keys are set.
  const setOps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(extraPatch)) {
    setOps[`extraData.${key}`] = value;
  }

  const updated = await models.ConversationMessages.findOneAndUpdate(
    { 'extraData.discordMessageId': discordMessageId },
    { $set: setOps },
    { new: true },
  );

  if (!updated) {
    return false;
  }

  // `{ new: true }` returns the post-update doc, so the same round-trip yields
  // both the conversation id (topic) and the fresh `extraData` (payload).
  await graphqlPubsub.publish(
    `conversationMessageInserted:${updated.conversationId}`,
    { conversationMessageInserted: updated },
  );

  return true;
};

/**
 * `MESSAGE_UPDATE` → keeps the inbox in sync with a Discord edit. Updates the
 * local mirror's content so AI context / history reflect the edit. Discord also
 * unfurls link/Tenor/Giphy previews asynchronously and re-delivers the message
 * here with `embeds[]` populated, so this is where preview cards are refreshed
 * onto the inbox message.
 */
export const receiveDiscordMessageEdit = async ({
  models,
  activity,
}: {
  models: IModels;
  activity: DiscordActivity;
}) => {
  if (isIgnorableActivity(activity)) {
    return;
  }

  const resolved = await resolveConversationByMessageId(
    models,
    activity.messageId,
  );

  if (!resolved) {
    return;
  }

  const { message, conversation } = resolved;

  // Surface newly-unfurled previews (link cards, Tenor/Giphy) on the inbox
  // message. Only set when embeds are present: a plain text edit re-delivers the
  // message with an empty `embeds[]`, and we must not wipe an existing preview
  // card on such an update.
  if (activity.embeds?.length) {
    await updateInboxMessageExtra(models, activity.messageId, {
      embeds: activity.embeds,
    });
  }

  // Discord re-delivers a message via MESSAGE_UPDATE for two reasons: a genuine
  // user edit, or an automatic embed unfurl. The unfurl payload is partial and
  // omits `content`, so a present `content` field is what distinguishes a real
  // edit. We branch on it to avoid (a) blanking the mirror's stored text — which
  // AI context / history read — when the unfurl carries no content, and (b)
  // firing the "message edited" automation on every link a user posts.
  const editedContent =
    typeof activity.raw?.content === 'string' ? activity.content : undefined;

  if (editedContent === undefined) {
    return;
  }

  // Mirror stores the display form (`<@ID>` -> `@Name`) to match ingestion.
  const displayContent = resolveDiscordMentions(
    editedContent,
    activity.mentions,
  );

  // Keep the mirror current so generateAiContext/history show the edited text.
  await models.DiscordConversationMessages.updateOne(
    { _id: message._id },
    { $set: { content: displayContent, updatedAt: new Date() } },
  );

  debugDiscord(
    `Discord message ${activity.messageId} edited in conversation ${conversation.erxesApiId}`,
  );
};

/**
 * `MESSAGE_POLL_VOTE_ADD` / `MESSAGE_POLL_VOTE_REMOVE` → refreshes the poll's
 * vote tallies in the inbox. The vote event carries only the answer id (not the
 * updated counts), so we re-fetch the message to read Discord's authoritative
 * `poll.results`, update the stored inbox message's `extraData.poll`, and
 * re-publish `conversationMessageInserted` so the open poll card updates live
 * (the inbox message is normalized by `_id`, so re-emitting it with fresh
 * `extraData` updates the card in place rather than duplicating it).
 */
export const receiveDiscordPollVote = async ({
  models,
  bot,
  event,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
  event: DiscordPollVoteEvent;
}) => {
  if (!event.messageId || !event.channelId) {
    return;
  }

  // Re-read the authoritative tallies from Discord (the vote event omits them).
  let poll;
  try {
    const fetched = await getMessage(
      bot.token,
      event.channelId,
      event.messageId,
    );
    poll = normalizeDiscordPoll(fetched?.poll);
  } catch (e) {
    debugError(
      `Failed to fetch Discord poll ${event.messageId}: ${(e as Error).message}`,
    );
    return;
  }

  if (!poll) {
    return;
  }

  const updated = await updateInboxMessageExtra(models, event.messageId, {
    poll,
  });

  if (updated) {
    debugDiscord(`Updated Discord poll ${event.messageId} tallies`);
  }
};
