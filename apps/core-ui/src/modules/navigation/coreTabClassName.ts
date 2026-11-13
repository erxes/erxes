import { cn } from 'erxes-ui';

/** Every top bar icon button. */
export const coreTabIconClassName = (active = false) =>
  cn('relative size-7 shrink-0', active && 'bg-primary/10 text-primary-text hover:bg-primary/15');
