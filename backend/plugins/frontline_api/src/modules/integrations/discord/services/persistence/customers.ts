import { sleep } from '@/integrations/discord/utils/delay';

import type { APIUser } from 'discord-api-types/v10';

import type { IModels } from '~/connectionResolvers';

import type { IDiscordBotDocument } from '@/integrations/discord/@types/bot';

import type { DiscordActivity } from '@/integrations/discord/@types/activity';

import { getDiscordUser } from '@/integrations/discord/utils/bot';

import { getErrorMessage } from '@/integrations/discord/utils/request';

import { debugError } from '@/integrations/discord/debuggers';

import { receiveInboxMessage } from '@/inbox/receiveMessage';

import { CUSTOMER_CREATE_ATTEMPTS } from '@/integrations/discord/constants/persistence';

/** Build a Discord CDN avatar URL, or undefined when the user has no avatar hash. */
const avatarUrl = (userId: string, hash?: string | null) =>
  hash ? `https://cdn.discordapp.com/avatars/${userId}/${hash}.png` : undefined;

/**
 * Mints the canonical core customer for a Discord author and returns its id.
 * NOTE: every call CREATES a new core contact — the bridge dedupes only by
 * email/phone, which Discord never sends — so it must run at most once per
 * author. Never call it for a row a concurrent request is already syncing:
 * that would orphan a duplicate contact.
 */
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
    customer.erxesApiId = await syncCustomerToCore(
      subdomain,
      bot,
      firstName,
      avatar,
    );
    await customer.save();
  } catch (e) {
    await models.DiscordCustomers.deleteOne({ _id: customer._id });
    throw new Error(
      `Failed to sync Discord customer with API: ${getErrorMessage(e)}`,
    );
  }

  return customer;
};

/**
 * Finds or creates the Discord sender as a customer: a plugin-local mirror
 * (`DiscordCustomers`) plus the canonical core customer (via the inbox bridge),
 * linked by `erxesApiId`. Mirrors Facebook's `getOrCreateCustomer` — minus its
 * throw-on-duplicate: the gateway dispatches events concurrently and never
 * redelivers, so a burst of first messages from a new author used to keep only
 * the one that won the create race and lose the rest. Instead, losers adopt the
 * winner's row, the same way the conversation create race is handled below.
 */
export const getOrCreateCustomer = async (
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
