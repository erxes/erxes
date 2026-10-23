/**
 * Chat transcript width presets. `standard` matches the original compact
 * reading column, `wide` is the default (more of the page), `full` uses the
 * whole surface width.
 */
export type AgentChatWidth = 'standard' | 'wide' | 'full';

export const AGENT_CHAT_WIDTH_CLASSES: Record<AgentChatWidth, string> = {
  standard: 'max-w-3xl',
  wide: 'max-w-[1120px]',
  full: 'max-w-none',
};

/** Horizontal padding per width — roomier padding only pays off in `full`. */
export const AGENT_CHAT_WIDTH_PADDING: Record<AgentChatWidth, string> = {
  standard: 'px-4 sm:px-6 lg:px-8',
  wide: 'px-4 sm:px-6 lg:px-8',
  full: 'px-4 sm:px-6 lg:px-8 xl:px-12',
};
