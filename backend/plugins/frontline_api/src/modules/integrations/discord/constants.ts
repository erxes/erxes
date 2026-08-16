export const DISCORD_API_URL = 'https://discord.com/api/v10';

// Inbox integration `kind` for Discord. The inbox derives the service name from
// `kind.split('-')[0]` ('discord') and the reply action from `split('-')[1]`
// ('messenger' -> 'reply-messenger'), mirroring 'facebook-messenger'.
export const DISCORD_INBOX_KIND = 'discord-messenger';

// erxes automation identifiers. Discord is a messaging integration, so the
// triggers fire on Discord channel events (mirrors `frontline:facebook.messages`).
export const DISCORD_MODULE_NAME = 'discord';

// Automation "collections" — arbitrary identifiers for each custom trigger /
// action. Each maps to a `<plugin>:<module>.<collection>` automation type. They
// must end in 's' so the engine's pluralization leaves them untouched (see
// getFallbackTRPCModuleName / normalizeAutomationType).
export const DISCORD_MESSAGE_COLLECTION = 'messages';

// `<plugin>:<module>.<collection>` automation types.
export const DISCORD_MESSAGE_TRIGGER_TYPE = 'frontline:discord.messages';
