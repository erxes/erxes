import { APIUser } from 'discord-api-types/v10';
import { sendAutomationTrigger } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import { IDiscordCustomerDocument } from '@/integrations/discord/@types/customers';
import { IDiscordConversationDocument } from '@/integrations/discord/@types/conversations';
import {
  DiscordActivity,
  DiscordAttachment,
  DiscordEmbed,
  DiscordPoll,
} from '@/integrations/discord/@types/activity';
import {
  isIgnorableActivity,
  resolveDiscordMentions,
} from '@/integrations/discord/activity';
import {
  getChannel,
  getDiscordUser,
  getErrorMessage,
  isThreadChannel,
  rehostImageAttachments,
} from '@/integrations/discord/utils';
import { DISCORD_MESSAGE_TRIGGER_TYPE } from '@/integrations/discord/constants';
import { TDiscordTriggerTarget } from '@/integrations/discord/meta/automation/types';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';

/** Build a Discord CDN avatar URL, or undefined when the user has no avatar hash. */
const avatarUrl = (userId: string, hash?: string | null) =>
  hash ? `https://cdn.discordapp.com/avatars/${userId}/${hash}.png` : undefined;

/** Promise that resolves after `ms` milliseconds. */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// How many find→create/wait rounds getOrCreateCustomer runs before treating a
// still-unlinked row as abandoned and taking its core sync over. The sync is a
// single in-process bridge call, so the backed-off waits (250ms × attempt,
// ~2.5s total) are generous for a live peer.
const CUSTOMER_CREATE_ATTEMPTS = 4;

// How many backed-off re-reads a conversation-create-race loser gives the winner
// to land the core `erxesApiId` link before syncing the adopted row itself.
// Mirrors CUSTOMER_CREATE_ATTEMPTS (~2.5s total): syncing is a single in-process
// bridge call, so this is generous for a live peer. Without the wait, both first
// messages for a key would each mint (and orphan) a separate core conversation.
const CONVERSATION_LINK_ATTEMPTS = 4;

/**
 * Finds or creates the Discord sender as a customer: a plugin-local mirror
 * (`DiscordCustomers`) plus the canonical core customer (via the inbox bridge),
 * linked by `erxesApiId`. Mirrors Facebook's `getOrCreateCustomer` — minus its
 * throw-on-duplicate: the gateway dispatches events concurrently and never
 * redelivers, so a burst of first messages from a new author used to keep only
 * the one that won the create race and lose the rest. Instead, losers adopt the
 * winner's row, the same way the conversation create race is handled below.
 */
// Mints the canonical core customer for a Discord author and returns its id.
// NOTE: every call CREATES a new core contact — the bridge dedupes only by
// email/phone, which Discord never sends — so it must run at most once per
// author. Never call it for a row a concurrent request is already syncing:
// that would orphan a duplicate contact.
const syncCustomerToCore = async (
  subdomain: string,
  bot: IDiscordBotDocument,
  firstName?: string,
  avatar?: string,
) => {
  const response = await receiveInboxMessage(subdomain, {
    action: 'get-create-update-customer',
    payload: JSON.stringify({
      integrationId: bot.erxesApiId,
      firstName,
      avatar,
      isUser: true,
    }),
  });

  if (response.status !== 'success') {
    throw new Error(`Customer creation failed: ${JSON.stringify(response)}`);
  }

  return (response.data as { _id: string })._id;
};

/**
 * One attempt of `getOrCreateCustomer`'s find→create→link round. Returns the
 * customer once it's fully linked, or `undefined` to retry (a concurrent
 * request is still creating/linking it, or lost the create race and should
 * re-read next pass). Split out of the loop so this branching isn't nested
 * inside the `for`, which is what pushed its cognitive complexity over budget.
 */
const attemptGetOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
  activity: DiscordActivity,
  userId: string,
  attempt: number,
) => {
  const existing = await models.DiscordCustomers.findOne({ userId });

  if (existing?.erxesApiId) {
    return existing;
  }

  if (existing) {
    // A concurrent request created the row and is mid-sync (`erxesApiId`
    // lands right after). Don't sync it ourselves — see syncCustomerToCore —
    // wait for the creator instead. If its sync fails it deletes the row and
    // the next pass recreates it; if it crashed and the row stays unlinked,
    // the takeover after the loop self-heals it.
    await sleep(250 * attempt);
    return undefined;
  }

  // No row yet — create it. Enrich with the Discord profile (username +
  // avatar) first. Best-effort: a failure here shouldn't block conversation
  // creation.
  let profile: Partial<APIUser> = {};
  try {
    profile = (await getDiscordUser(bot.token, userId)) || {};
  } catch (e) {
    debugError(`Failed to fetch Discord user ${userId}: ${getErrorMessage(e)}`);
  }

  const firstName =
    profile.global_name || profile.username || activity.author.username;
  const avatar = avatarUrl(userId, profile.avatar);

  let customer;
  try {
    customer = await models.DiscordCustomers.create({
      userId,
      firstName,
      profilePic: avatar,
      integrationId: bot.erxesApiId,
    });
  } catch (e) {
    // A concurrent message from the same author won the create race — loop
    // back and adopt the winner's row instead of failing (which would drop
    // this message for good).
    if (getErrorMessage(e).includes('duplicate')) {
      return undefined;
    }
    throw e;
  }

  // Sync to the core customer record via the inbox bridge. Roll the mirror
  // row back on failure so no permanently-unlinked row is left behind — a
  // racer waiting on it sees it vanish and takes creation over itself.
  try {
    customer.erxesApiId = await syncCustomerToCore(subdomain, bot, firstName, avatar);
    await customer.save();
  } catch (e) {
    await models.DiscordCustomers.deleteOne({ _id: customer._id });
    throw new Error(
      `Failed to sync Discord customer with API: ${getErrorMessage(e)}`,
    );
  }

  return customer;
};

const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
  activity: DiscordActivity,
) => {
  const userId = activity.author.id;

  for (let attempt = 1; attempt <= CUSTOMER_CREATE_ATTEMPTS; attempt++) {
    const customer = await attemptGetOrCreateCustomer(
      models,
      subdomain,
      bot,
      activity,
      userId,
      attempt,
    );

    if (customer) {
      return customer;
    }
  }

  // Wait budget exhausted: the row exists but never got its core link, so its
  // creator died mid-sync (a *failed* sync deletes the row). Without a takeover
  // every future message from this author would wait out the loop and fail here
  // forever. Sync the row ourselves, with the write guarded so a late-finishing
  // creator can't be double-linked.
  const orphan = await models.DiscordCustomers.findOne({ userId });

  if (!orphan) {
    // The row kept being created and rolled back across every attempt — the
    // bridge is failing; there is nothing to adopt.
    throw new Error(`Discord customer ${userId} could not be created`);
  }

  // The creator may have finished between the last loop pass and this re-read.
  if (orphan.erxesApiId) {
    return orphan;
  }

  const erxesApiId = await syncCustomerToCore(
    subdomain,
    bot,
    orphan.firstName,
    orphan.profilePic,
  );

  const claimed = await models.DiscordCustomers.findOneAndUpdate(
    { _id: orphan._id, erxesApiId: null },
    { $set: { erxesApiId } },
    { new: true },
  );

  if (claimed) {
    return claimed;
  }

  // Lost the claim: the original creator finished after all — use its link.
  // (The contact minted above stays orphaned; the rare cost of self-healing.)
  const winner = await models.DiscordCustomers.findOne({ userId });

  if (winner?.erxesApiId) {
    return winner;
  }

  throw new Error(
    `Discord customer ${userId} could not be linked to a core contact`,
  );
};

// Best display-text fallback for a Discord message's inbox preview: its
// (mention-resolved) text, else the poll question, else the first embed's
// title, else a generic "Link" label — in that priority order. A
// poll/embed-only message has no text `content`, so this is what the
// conversation-list preview falls back to.
const buildMessagePreview = (
  displayContent: string,
  poll?: DiscordPoll,
  embeds?: DiscordEmbed[],
) =>
  displayContent ||
  (poll ? poll.question || 'Poll' : '') ||
  embeds?.find((embed) => embed.title || embed.url)?.title ||
  (embeds?.length ? 'Link' : '');

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
          `Failed to resolve Discord parent channel ${channelInfo.parent_id}: ${getErrorMessage(e)}`,
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
const findOrCreateDiscordConversation = async (
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
const waitForConversationLink = async (
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
const syncConversationToCore = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
  conversation: IDiscordConversationDocument,
  createdInThisCall: boolean,
  customer: IDiscordCustomerDocument,
  previewContent: string,
  storedAttachments: DiscordAttachment[],
  timestamp: Date,
) => {
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

    const winner = await models.DiscordConversations.findById(
      conversation._id,
    );
    if (winner?.erxesApiId) {
      return winner;
    }

    // The row vanished between the sync and the claim (its creator rolled it
    // back on a failure): re-attach our minted link so the message still
    // lands rather than being dropped.
    conversation.erxesApiId = mintedApiId;
    await conversation.save();
    return conversation;
  } catch (e) {
    // Roll back only a row this call created — see the doc comment above.
    if (createdInThisCall) {
      await models.DiscordConversations.deleteOne({ _id: conversation._id });
    }
    throw new Error(getErrorMessage(e));
  }
};

/**
 * Persists the mirror message row, syncs it into the inbox conversation
 * (store + realtime publish), and enrolls automations listening on inbound
 * Discord messages (AI Agent etc.) — skipped during history backfill so
 * replayed messages don't re-trigger them. The duplicate catch is the hard
 * idempotency guard against the live-dispatch race (the caller's earlier
 * existence check is a best-effort short-circuit, not a lock).
 *
 * Note: the "<bot> is typing…" indicator is intentionally NOT started here.
 * Starting it on every inbound message lights up channels/messages that no
 * automation ever answers. Instead it's started from the trigger match
 * (checkCustomTrigger), so it only shows when an automation actually matches
 * and is composing a reply — mirroring Facebook's behavior.
 */
const persistAndDispatchMessage = async ({
  models,
  subdomain,
  bot,
  activity,
  conversation,
  customer,
  displayContent,
  storedAttachments,
  extraData,
  timestamp,
  skipAutomation,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
  activity: DiscordActivity;
  conversation: IDiscordConversationDocument;
  customer: IDiscordCustomerDocument;
  displayContent: string;
  storedAttachments: DiscordAttachment[];
  extraData: Record<string, unknown>;
  timestamp: Date;
  skipAutomation: boolean;
}) => {
  const { channelId, author, content, messageId } = activity;

  try {
    await models.DiscordConversationMessages.create({
      conversationId: conversation._id,
      messageId,
      createdAt: timestamp,
      content: displayContent,
      customerId: customer.erxesApiId,
      attachments: storedAttachments,
    });

    // Persist the message into the inbox message store (so the conversation
    // detail renders it) AND publish the real-time event. The
    // `create-conversation-message` action does both; the publish-only
    // `pConversationClientMessageInserted` left the detail thread empty.
    await receiveInboxMessage(subdomain, {
      action: 'create-conversation-message',
      metaInfo: 'replaceContent',
      payload: JSON.stringify({
        conversationId: conversation.erxesApiId,
        content: displayContent || '',
        customerId: customer.erxesApiId,
        createdAt: timestamp,
        attachments: storedAttachments,
        extraData,
      }),
    });

    debugDiscord(
      `Stored Discord message ${messageId} in conversation ${conversation.erxesApiId}`,
    );

    if (skipAutomation) {
      return;
    }

    const target: TDiscordTriggerTarget = {
      _id: messageId,
      content: content || '',
      conversationId: conversation.erxesApiId,
      customerId: customer.erxesApiId,
      channelId,
      guildId: activity.guildId,
      authorId: author.id,
      botId: bot._id,
      createdAt: timestamp,
    };

    sendAutomationTrigger(
      subdomain,
      {
        type: DISCORD_MESSAGE_TRIGGER_TYPE,
        targets: [target],
      },
      { transport: 'trpc' },
    );
  } catch (e) {
    throw new Error(
      getErrorMessage(e).includes('duplicate')
        ? 'Concurrent request: message duplication'
        : getErrorMessage(e),
    );
  }
};

/**
 * Ingests one inbound Discord channel message: dual-writes a local mirror +
 * the canonical inbox conversation/message (linked by `erxesApiId`) and
 * publishes the real-time `conversationMessageInserted` event so it appears
 * live in the agent inbox. The Discord analogue of Facebook's `receiveMessage`.
 */
export const receiveDiscordMessage = async ({
  models,
  subdomain,
  bot,
  activity,
  skipAutomation = false,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
  activity: DiscordActivity;
  // History backfill replays old messages; it must not re-enroll automations
  // (AI Agent, notifications) as if they just arrived.
  skipAutomation?: boolean;
}) => {
  if (isIgnorableActivity(activity)) {
    return;
  }

  // Without a linked inbox integration there is nowhere to route the message.
  if (!bot.erxesApiId) {
    debugError(
      `Discord bot ${bot._id} has no linked inbox integration (erxesApiId); skipping message ${activity.messageId}`,
    );
    return;
  }

  const { messageId, content, attachments, poll, embeds } = activity;

  // What we store + show in the inbox: `<@ID>` mentions rewritten to `@Name`.
  // The raw `content` is still used for automation triggers so trigger matching
  // keeps seeing exactly what Discord sent.
  const displayContent = resolveDiscordMentions(content, activity.mentions);

  // Re-host inbound images to erxes storage so they survive Discord's ~24h CDN
  // URL expiry; videos/files keep their CDN URL. Best-effort, never throws.
  const storedAttachments = await rehostImageAttachments(subdomain, attachments);

  // Structured payloads (poll, embed preview cards) travel on the message's
  // `extraData` and render as cards. The Discord message id is *always* stamped
  // alongside so later events can find this inbox message back: a poll-vote event
  // refreshes tallies, and — since Discord unfurls link/Tenor/Giphy previews a
  // moment after the message and re-delivers it via MESSAGE_UPDATE — the edit
  // handler attaches `embeds` then. Stamping unconditionally is essential for that
  // last case: a plain link has no poll/embeds at create time, so a conditional
  // stamp would leave the unfurl with no message to attach to.
  const extraData = {
    ...(poll && { poll }),
    ...(embeds?.length && { embeds }),
    discordMessageId: messageId,
  };
  const previewContent = buildMessagePreview(displayContent, poll, embeds);

  try {
    const customer = await getOrCreateCustomer(models, subdomain, bot, activity);

    const created = await findOrCreateDiscordConversation(
      models,
      bot,
      activity,
      displayContent,
    );

    let conversation = await waitForConversationLink(
      models,
      created.conversation,
      created.createdInThisCall,
    );

    // Idempotency guard, ahead of the conversation sync: a re-run history
    // backfill replays messages we've already ingested. The
    // `create-or-update-conversation` sync below resets the inbox conversation to
    // status OPEN with empty `readUserIds`, so running it for a message that adds
    // nothing new would reopen and un-read a closed conversation. Bail out here
    // instead — the Discord message id is globally unique, so an existing mirror
    // row means this exact message was already stored (the create below is still
    // the hard idempotency guard for the live-dispatch race).
    const existingMessage = await models.DiscordConversationMessages.findOne({
      messageId: { $eq: messageId },
    });

    if (existingMessage) {
      return;
    }

    conversation = await syncConversationToCore(
      models,
      subdomain,
      bot,
      conversation,
      created.createdInThisCall,
      customer,
      previewContent,
      storedAttachments,
      activity.timestamp,
    );

    await persistAndDispatchMessage({
      models,
      subdomain,
      bot,
      activity,
      conversation,
      customer,
      displayContent,
      storedAttachments,
      extraData,
      timestamp: activity.timestamp,
      skipAutomation,
    });
  } catch (error) {
    throw new Error(
      `Error processing Discord message: ${getErrorMessage(error)}`,
    );
  }
};
