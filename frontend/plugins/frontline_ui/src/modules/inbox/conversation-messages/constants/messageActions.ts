import { IntegrationType } from '@/types/Integration';

export const REACTIONS = [
  'love',
  'like',
  'wow',
  'haha',
  'sad',
  'angry',
] as const;

export type Reaction = (typeof REACTIONS)[number];

export const REACTION_EMOJI: Record<string, string> = {
  love: '❤️',
  like: '👍',
  wow: '😮',
  haha: '😂',
  sad: '😢',
  angry: '😠',
};

export const NATIVE_REPLY_KINDS = new Set<string>([
  IntegrationType.FACEBOOK_MESSENGER,
  IntegrationType.DISCORD_MESSENGER,
  IntegrationType.INSTAGRAM_MESSENGER,
]);

export const REACTION_KINDS = new Set<string>([
  IntegrationType.FACEBOOK_MESSENGER,
  IntegrationType.DISCORD_MESSENGER,
  IntegrationType.INSTAGRAM_MESSENGER,
]);

export const INSTAGRAM_REACTION_MESSAGE_KINDS = new Set([
  'text',
  'image',
  'video',
  'audio',
  'file',
]);

export const INLINE_ACTION_KINDS = new Set<string>([
  IntegrationType.FACEBOOK_MESSENGER,
  IntegrationType.INSTAGRAM_MESSENGER,
  IntegrationType.ERXES_MESSENGER,
]);

export const MESSAGE_ACTION_BAR_CLASS =
  'pointer-events-none hidden translate-y-1 items-center rounded-xl border border-border/70 bg-background/95 p-1 opacity-0 shadow-[0_4px_14px_rgba(15,23,42,0.12)] backdrop-blur-md transition-[opacity,transform] duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 has-[[data-state=open]]:pointer-events-auto has-[[data-state=open]]:translate-y-0 has-[[data-state=open]]:opacity-100 motion-reduce:transition-none md:flex [@media(pointer:coarse)]:hidden';
