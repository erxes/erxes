import type React from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from 'erxes-ui/lib/utils';

const variants = cva(
  'inline-flex items-center justify-center gap-2 px-3 whitespace-nowrap rounded text-sm transition outline-offset-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 font-medium cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'border-primary border relative transition duration-300 ease-in-out before:duration-300 before:ease-in-out before:transition-opacity rounded shadow-button-primary before:pointer-events-none before:absolute before:inset-0 before:rounded before:bg-linear-to-b before:from-white/20 before:opacity-50 hover:before:opacity-100 bg-primary text-primary-foreground after:pointer-events-none after:absolute after:inset-0 after:bg-white/10 after:bottom-1/2 after:rounded after:mix-blend-overlay text-shadow-xs/25',
        destructive:
          'border-destructive border relative transition duration-300 ease-in-out before:duration-300 before:ease-in-out before:transition-opacity rounded shadow-button-primary before:pointer-events-none before:absolute before:inset-0 before:rounded before:bg-linear-to-b before:from-white/20 before:opacity-50 hover:before:opacity-100 bg-destructive text-destructive-foreground after:pointer-events-none after:absolute after:inset-0 after:bg-white/10 after:bottom-1/2 after:rounded after:mix-blend-overlay text-shadow-xs/25',
        outline: 'shadow-sm bg-background shadow-button-outline hover:bg-accent',
        secondary: 'bg-accent text-foreground hover:bg-border',
        ghost: 'hover:bg-accent-foreground/10',
        /** Top bar and app switcher: the current page and an open menu are tinted primary. */
        nav: 'hover:bg-accent-foreground/10 aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary-text aria-[current=page]:hover:bg-primary/15 data-popup-open:bg-primary/10 data-popup-open:text-primary-text data-popup-open:hover:bg-primary/15',
        /** Fills a table cell edge to edge; focus is an inset ring. */
        cell: 'rounded-none px-2 hover:bg-accent-foreground/10 focus-visible:outline-none focus-visible:relative focus-visible:z-10 focus-visible:shadow-subtle',
        /** A joined part of a filter chip; the last part keeps the chip's right corners. */
        segment:
          'rounded-none last:rounded-r bg-background hover:bg-accent-foreground/10 focus-visible:z-10 focus-visible:outline-none focus-visible:shadow-focus',
        /** An empty slot to add something to. */
        dashed: 'border border-dashed text-muted-foreground hover:bg-muted',
        /** Floats over an image or a lightbox. */
        overlay: 'rounded-full bg-background/80 hover:bg-background',
        /** A round "+" that inserts between two items, such as automation steps. */
        insert:
          'rounded-full border bg-background text-muted-foreground shadow-xs transition-transform hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground data-popup-open:scale-110 data-popup-open:border-primary data-popup-open:bg-primary data-popup-open:text-primary-foreground',
        /** An action that reads as a link: outlined, primary text (3.x's `link`). */
        link: 'bg-background shadow-button-outline hover:bg-accent text-primary-text',
        /** A value that fills a table cell and opens its picker: square, regular weight. */
        value: 'rounded-none px-2 font-normal hover:bg-accent-foreground/10',
      },
      /**
       * The ground under any variant. `border` stands out on a sidebar-coloured panel (3.x's add
       * buttons under a line table); `tint` is the tone's colour at 10% (3.x's Remove selected,
       * `variant="secondary" tone="destructive" fill="tint"`).
       */
      fill: { default: '', border: 'bg-border', tint: '' },
      /** Picked among its siblings, such as a voucher in a list to choose from. */
      selected: { false: '', true: 'bg-primary/10 hover:bg-primary/10' },
      tone: {
        default: '',
        /** Secondary actions; pressed or with its menu open it reads as foreground on accent. */
        muted:
          'text-muted-foreground hover:text-foreground aria-pressed:bg-accent aria-pressed:text-foreground data-popup-open:bg-accent data-popup-open:text-foreground',
        destructive: 'text-destructive-text',
        primary: 'text-primary-text',
        /** Something not final yet, such as 3.x's Save on a draft voucher. */
        warning: 'text-warning-text',
      },
      size: {
        default: 'h-7 py-1',
        sm: 'h-6 text-xs after:rounded-xs after:absolute px-2 gap-1',
        xs: 'h-6 text-xs px-1 gap-1.5',
        lg: 'h-8 font-semibold',
        icon: 'size-7 p-0',
        /** No padding or corners: the button is its content, such as an image. */
        flush: 'h-auto p-0 rounded-none',
        /** An entry in a list whose text wraps over lines: at least 2.25rem high, regular weight. */
        multiline: 'h-auto min-h-9 py-1 whitespace-normal font-normal',
      },
    },
    compoundVariants: [
      { fill: 'tint', tone: ['default', 'muted'], className: 'bg-accent' },
      { fill: 'tint', tone: 'destructive', className: 'bg-destructive/10' },
      // Primary's tint has a rule round it (3.x's import guide button).
      {
        fill: 'tint',
        tone: 'primary',
        className: 'border border-primary/30 bg-primary/10 hover:bg-primary/15',
      },
      { fill: 'tint', tone: 'warning', className: 'bg-warning/10' },
    ],
    defaultVariants: {
      variant: 'default',
      tone: 'default',
      size: 'default',
      fill: 'default',
      selected: false,
    },
  },
);

/**
 * Button classes by `variant`, `tone` and `size`, to style a link as one.
 * The size variants override the base padding, gap and text size, so the classes go through
 * tailwind-merge. Without it a link styled as a small button gets whichever rule the CSS
 * happens to list last.
 */
export const buttonVariants = (props?: Parameters<typeof variants>[0]) => cn(variants(props));

/** Base UI button props plus the button's variants. */
export type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>;

/**
 * A button in the theme's variants, tones and sizes; native by default. `selected` marks the
 * one picked among its siblings and tells assistive tech it is pressed.
 * Links styled as buttons put `buttonVariants` on the link instead.
 */
export const Button = ({
  className,
  variant,
  tone,
  size,
  fill,
  selected,
  ...props
}: ButtonProps) => (
  <ButtonPrimitive
    aria-pressed={selected ?? undefined}
    className={buttonVariants({ variant, tone, size, fill, selected, className })}
    {...props}
  />
);
