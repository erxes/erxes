export const CONVERSATION_STATUS_COLORS = {
  new: 'var(--muted-foreground)',
  open: 'var(--warning)',
  closed: 'var(--primary)',
  resolved: 'var(--success)',
} as const;

export const CONVERSATION_STATUS_TEXT_CLASSES = {
  new: 'text-muted-foreground',
  open: 'text-warning',
  closed: 'text-primary',
  resolved: 'text-success',
} as const;

export type ConversationStatus = keyof typeof CONVERSATION_STATUS_COLORS;
