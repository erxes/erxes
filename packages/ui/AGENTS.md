# erxes-ui

The design system core-ui and plugin UIs build on (`README.md` says who imports what). Screens
compose these components and the theme's tokens; each component owns how it looks. `vp run check`
enforces that with `@shadcn/lint`, configured in `tools/config/design.ts`, and every finding
points here.

## Tokens

- `src/theme.css` maps tokens to Tailwind utilities; `src/base.css` holds their light and dark
  values on `:root` and `.dark`. Colours are the `--color-*` names there (`bg-muted`,
  `text-muted-foreground`, `border-input`, `text-primary-text`). Primary-coloured text is
  `text-primary-text`; `primary` itself is for fills and borders, since it reads at 2.6:1 as text
  in dark.
- Type, radius, shadow, spacing, easing and animation scales are the `@theme` entries in
  `src/theme.css`. A size the scales lack is a new token there, never `text-[11px]` or
  `ease-[cubic-bezier(…)]`. A layout the scales can't name, such as a fixed grid template, is an
  `@utility` there.
- Classes merge through `cn` (`src/lib/utils.ts`), whose tables `cn build` generates from the
  `@theme` scales, so `cn('shadow-sm', 'shadow-focus')` keeps only the last. After changing
  `@theme`, run `pnpm --filter @erxes/ui cn:tables`; `pnpm check:generated` fails on stale tables.
- No raw palette colours (`bg-gray-100`, `#fff`), no arbitrary values, no `<style>` and no inline
  style properties. A value only known at runtime (a dragged width, a chart series colour) goes
  in a CSS variable: `style={{ '--panel-width': `${width}px` }}` with `w-(--panel-width)`.
- Class names are written out in full, never built (`` `bg-${tone}` ``): a variant map such as
  `{ success: 'bg-success', warning: 'bg-warning' }[tone]`, or a cva variant.

## What a screen may change

`className` on an erxes-ui component carries layout: margin, width, height and size, flex and grid
placement, position, display, and `opacity-0`/`opacity-100` to reveal a control on hover. The
few components that accept more, such as inline text that takes its colour from where it sits,
are the contracts in `tools/config/design.ts`.

Colour, type, padding, gap, border, radius, shadow and motion belong to the component. Plain
elements (`div`, `span`) take any token class, so spacing between a component's children goes on
a plain element inside it.

## When the lint fires

1. Drop the class when the component already looks that way.
2. Use an existing variant or size. The error lists them.
3. Add a variant or size to the component's `cva` (`src/components/<name>.tsx`), named for what
   it is (`muted`, `flush`), not for the screen that needs it. Add one when the design repeats it
   or it is a real state; the screens that hand-rolled the same look switch to it.
4. A composition that restyles a component throughout is its own component here.
5. A contract is for a property the screen owns by nature, and goes in `tools/config/design.ts`
   with the reason.
