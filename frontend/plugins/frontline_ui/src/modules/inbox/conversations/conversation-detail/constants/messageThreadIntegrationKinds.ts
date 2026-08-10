import { IntegrationType } from '@/types/Integration';

/**
 * Integration kinds whose conversations render as a message thread.
 *
 * This is an ALLOW-list, not a filter: a kind that is absent renders no bubbles
 * at all, so a channel added here is the only thing that makes its stored
 * messages visible in the inbox. Kinds left out — `imap`, `calls`, the Facebook
 * and Instagram post kinds — are not silently broken; each has its own detail
 * component wired in `ConversationIntegrationDetail` that owns the whole
 * message area instead.
 */
export const MESSAGE_THREAD_INTEGRATION_KINDS: string[] = [
  IntegrationType.ERXES_MESSENGER,
  'lead',
  IntegrationType.DISCORD_MESSENGER,
  IntegrationType.WHATSAPP_MESSENGER,
];
