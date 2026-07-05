import { APIUser } from 'discord-api-types/v10';
import { sendAutomationTrigger } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import { DiscordActivity } from '@/integrations/discord/@types/activity';
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

const avatarUrl = (userId: string, hash?: string | null) =>
  hash ? `https://cdn.discordapp.com/avatars/${userId}/${hash}.png` : undefined;

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
const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
  activity: DiscordActivity,
) => {
  const userId = activity.author.id;

  // Mints the canonical core customer for this author and returns its id.
  // NOTE: every call CREATES a new core contact — the bridge dedupes only by
  // email/phone, which Discord never sends — so it must run at most once per
  // author. Never call it for a row a concurrent request is already syncing:
  // that would orphan a duplicate contact.
  const syncCustomerToCore = async (firstName?: string, avatar?: string) => {
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

  for (let attempt = 1; attempt <= CUSTOMER_CREATE_ATTEMPTS; attempt++) {
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
      continue;
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
        continue;
      }
      throw e;
    }

    // Sync to the core customer record via the inbox bridge. Roll the mirror
    // row back on failure so no permanently-unlinked row is left behind — a
    // racer waiting on it sees it vanish and takes creation over itself.
    try {
      customer.erxesApiId = await syncCustomerToCore(firstName, avatar);
      await customer.save();
    } catch (e) {
      await models.DiscordCustomers.deleteOne({ _id: customer._id });
      throw new Error(
        `Failed to sync Discord customer with API: ${getErrorMessage(e)}`,
      );
    }

    return customer;
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

  const {
    channelId,
    author,
    content,
    messageId,
    timestamp,
    attachments,
    poll,
    embeds,
  } = activity;

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
  // stamp would leave the unfurl with no message to attach to. A poll/embed-only
  // message has no text `content`, so the conversation-list preview falls back to
  // the poll question or embed title.
  const extraData = {
    ...(poll && { poll }),
    ...(embeds?.length && { embeds }),
    discordMessageId: messageId,
  };
  const previewContent =
    displayContent ||
    (poll ? poll.question || 'Poll' : '') ||
    embeds?.find((embed) => embed.title || embed.url)?.title ||
    (embeds?.length ? 'Link' : '');

  try {
    const customer = await getOrCreateCustomer(models, subdomain, bot, activity);

    // One inbox conversation per Discord channel (a thread keeps its own
    // channelId, so each thread is its own conversation).
    let conversation = await models.DiscordConversations.findOne({
      channelId: { $eq: channelId },
    });

    // Whether the mirror row was created by THIS call — the only case the
    // sync-failure rollback below may delete it. A found row (or one a
    // concurrent create race won) is not ours to roll back.
    let createdInThisCall = false;

    if (!conversation) {
      // Resolve the channel id to its human name (e.g. 'general') for display
      // in the inbox, and detect whether it's a thread so the inbox can nest it
      // under its parent channel. Best-effort: a failure must not block the
      // conversation. The same `getChannel` call yields the thread's `type` and
      // `parent_id`, so thread detection costs no extra request.
      let channelName: string | undefined;
      let isThread = false;
      let parentChannelId: string | undefined;
      let parentChannelName: string | undefined;
      try {
        const channelInfo = await getChannel(bot.token, channelId);
        channelName = channelInfo?.name ?? undefined;

        if (channelInfo && isThreadChannel(channelInfo) && channelInfo.parent_id) {
          isThread = true;
          parentChannelId = channelInfo.parent_id;
          try {
            parentChannelName =
              (await getChannel(bot.token, channelInfo.parent_id))?.name ??
              undefined;
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
        createdInThisCall = true;
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
      }
    } else {
      conversation.content = displayContent || '';
    }

    // Concurrency: two first messages for the same channel race here —
    // the Gateway dispatches events without awaiting, and backfill replays run
    // alongside live traffic. The mirror-row create race is resolved above by
    // adopting the winner's row, but that row's core link (`erxesApiId`) only
    // lands a beat later, right after the winner's own inbox sync returns. If we
    // adopt the row while it's still unlinked and then sync it ourselves, BOTH
    // calls mint a separate core conversation; the row binds to one and the other
    // is orphaned (holding a single stray message). So a call that did NOT create
    // the row waits for the creator to land the link, re-reading the row, before
    // syncing anything itself. Mirrors the customer create race above.
    if (!createdInThisCall && !conversation.erxesApiId) {
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
          conversation = refreshed;
          break;
        }
      }
    }

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

    // Sync the conversation to the inbox. A channel conversation isn't owned by
    // a single customer, so we set the owner only when first creating it (the
    // initiating author) and never reassign it on later updates — otherwise the
    // inbox would flip the owner to whoever spoke last. Each message still
    // carries its own author via `create-conversation-message`.
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

      if (isFirstSync) {
        // Guard the first link so two concurrent first-messages for this key
        // can't each bind their own freshly-minted core conversation onto the
        // row (a blind save would let the last writer win and orphan the other's
        // conversation). Only the write that finds the row still unlinked keeps
        // its minted conversation; the loser adopts the winner's link and orphans
        // its own — the rare, self-healing cost, exactly like the customer
        // takeover above. Both writers therefore agree on one link, so the second
        // message lands in the same conversation as the first.
        const claimed = await models.DiscordConversations.findOneAndUpdate(
          { _id: conversation._id, erxesApiId: null },
          { $set: { erxesApiId: mintedApiId } },
          { new: true },
        );

        if (claimed) {
          conversation = claimed;
        } else {
          const winner = await models.DiscordConversations.findById(
            conversation._id,
          );
          if (winner?.erxesApiId) {
            conversation = winner;
          } else {
            // The row vanished between the sync and the claim (its creator rolled
            // it back on a failure): re-attach our minted link so the message
            // still lands rather than being dropped.
            conversation.erxesApiId = mintedApiId;
            await conversation.save();
          }
        }
      } else {
        conversation.erxesApiId = mintedApiId;
        await conversation.save();
      }
    } catch (e) {
      // Roll back only a row this call created. A pre-existing conversation
      // must survive a transient sync failure: deleting it would orphan its
      // mirrored messages and sever the inbox link (`erxesApiId`), so the next
      // inbound message would mint a duplicate inbox conversation with the
      // history detached. Left in place, the sync simply retries on the next
      // inbound message.
      if (createdInThisCall) {
        await models.DiscordConversations.deleteOne({ _id: conversation._id });
      }
      throw new Error(getErrorMessage(e));
    }

    // Create the mirror message row. The duplicate catch below is the hard
    // idempotency guard against the live-dispatch race (the early existence
    // check above is a best-effort short-circuit, not a lock).
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

      // Enroll automations listening on inbound Discord messages (AI Agent etc.).
      // Skipped during history backfill so replayed messages don't trigger bots.
      //
      // Note: the "<bot> is typing…" indicator is intentionally NOT started here.
      // Starting it on every inbound message lights up channels/messages that no
      // automation ever answers. Instead it's started from the trigger match
      // (checkCustomTrigger), so it only shows when an automation actually
      // matches and is composing a reply — mirroring Facebook's behavior.
      if (!skipAutomation) {
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
      }
    } catch (e) {
      throw new Error(
        getErrorMessage(e).includes('duplicate')
          ? 'Concurrent request: message duplication'
          : getErrorMessage(e),
      );
    }
  } catch (error) {
    throw new Error(
      `Error processing Discord message: ${getErrorMessage(error)}`,
    );
  }
};
