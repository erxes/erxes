import { z } from 'zod';

export const DISCORD_EDIT_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  brandId: z.string().min(1, 'Brand is required'),
});

// Final-step details. Token / application id / public key / guild / Discord
// channels are gathered interactively in the wizard (validated against Discord),
// so they live in component state rather than this schema.
export const DISCORD_INTEGRATION_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  brandId: z.string().min(1, 'Brand is required'),
});

// Permissions the bot needs to serve a Team Inbox channel, OR-ed together.
// Bits 34/38 exceed JS's 32-bit bitwise range, so we compose with BigInt and
// serialize to the decimal string Discord's OAuth2 URL expects.
//   View Channels (10) | Send Messages (11) | Read Message History (16)
//   | Manage Threads (34)  — required to receive PRIVATE thread events without
//     the bot being manually added to each thread
//   | Send Messages in Threads (38) — required for agent replies to post inside
//     threads (separate from Send Messages in a normal channel)
// Bits 34/38 overflow 32-bit bitwise OR, but each bit is distinct so summing
// powers of two is equivalent and stays within Number's safe integer range.
const DISCORD_BOT_PERMISSIONS = (
  2 ** 10 +
  2 ** 11 +
  2 ** 16 +
  2 ** 34 +
  2 ** 38
).toString();

// One-click "Add to server" link for the Developer Portal OAuth2 flow, so the
// user doesn't have to hand-build an invite URL or copy guild/channel IDs.
export const buildDiscordInviteUrl = (applicationId: string) =>
  `https://discord.com/oauth2/authorize?client_id=${applicationId}` +
  `&permissions=${DISCORD_BOT_PERMISSIONS}&scope=bot`;
