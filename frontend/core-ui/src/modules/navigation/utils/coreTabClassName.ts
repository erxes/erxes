import { cn } from 'erxes-ui';

// In the notch layout the top bar sits on a colored frame (group/layout).
export const coreTabIconClassName = (active = false) =>
  cn(
    'relative size-7 shrink-0',
    'group-data-[notch=true]/layout:text-primary-foreground/80 group-data-[notch=true]/layout:hover:bg-primary-foreground/15 group-data-[notch=true]/layout:hover:text-primary-foreground',
    active &&
      'bg-primary/10 text-primary hover:bg-primary/15 group-data-[notch=true]/layout:bg-primary-foreground/20 group-data-[notch=true]/layout:text-primary-foreground group-data-[notch=true]/layout:hover:bg-primary-foreground/25',
  );
