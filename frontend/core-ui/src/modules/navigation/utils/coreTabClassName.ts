import { cn } from 'erxes-ui';

// Framed layouts (notch, sidebar): dark frames need light text, light frames keep defaults.
export const coreTabIconClassName = (active = false) =>
  cn(
    'relative size-7 shrink-0 transition-[background-color,color,transform,box-shadow] duration-150 active:scale-95',
    'dark:group-data-[framed=true]/layout:text-primary-foreground/80 dark:group-data-[framed=true]/layout:hover:bg-primary-foreground/15 dark:group-data-[framed=true]/layout:hover:text-primary-foreground',
    active &&
      'bg-primary/12 text-primary shadow-2xs ring-1 ring-primary/15 hover:bg-primary/18 dark:group-data-[framed=true]/layout:bg-primary-foreground/20 dark:group-data-[framed=true]/layout:text-primary-foreground dark:group-data-[framed=true]/layout:ring-primary-foreground/20 dark:group-data-[framed=true]/layout:hover:bg-primary-foreground/25',
  );
