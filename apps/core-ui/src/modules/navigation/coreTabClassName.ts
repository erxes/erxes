import { cn } from 'erxes-ui';

/** Every top bar icon button, as in old core-ui. */
export const coreTabIconClassName = (active = false) =>
  cn('relative size-7 shrink-0', active && 'bg-primary/10 text-primary hover:bg-primary/15');
