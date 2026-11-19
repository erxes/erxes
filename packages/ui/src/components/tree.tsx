import React from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import { cva } from 'class-variance-authority';

import { cn } from 'erxes-ui/lib/utils';
import { Button } from './button';
import { Spinner } from './spinner';

/** How far a row at `depth` starts from the tree's left edge. */
const indentOf = (depth: number) => `${depth * 1.25 + 0.25}rem`;

const TreeRoot = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div role="tree" className={cn('flex flex-col', className)} {...props} />
);

const treeRowVariants = cva(
  'group/tree-row flex h-9 items-center gap-2 rounded-md pr-2 pl-(--tree-indent) text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      interactive: { true: 'cursor-pointer hover:bg-accent' },
      selected: { true: 'bg-primary/10 text-primary-text hover:bg-primary/10' },
      muted: { true: 'text-muted-foreground' },
    },
  },
);

/** Moves focus to the item before or after this one, in the order they are drawn. */
const focusBy = (from: HTMLElement, step: 1 | -1) => {
  const items = [
    ...(from.closest('[role="tree"]')?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []),
  ];

  items[items.indexOf(from) + step]?.focus();
};

type TreeRowProps = Omit<React.ComponentProps<'div'>, 'onSelect'> & {
  /** 0 for a row at the top. */
  depth: number;
  /** Whether its children show; leave it out for a row that has none. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** What the open and close button says to a screen reader. */
  expandLabel?: string;
  /** Its children are still loading. */
  loading?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  /** Dimmed, such as a unit that is turned off. */
  muted?: boolean;
};

const TreeRow = ({
  depth,
  expanded,
  onExpandedChange,
  expandLabel,
  loading,
  selected,
  onSelect,
  muted,
  className,
  children,
  ...props
}: TreeRowProps) => {
  const cssVariables: Record<`--${string}`, string> = { '--tree-indent': indentOf(depth) };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    const actions = new Map<string, (() => void) | undefined>([
      ['Enter', onSelect],
      [' ', onSelect],
      ['ArrowRight', expanded === false ? () => onExpandedChange?.(true) : undefined],
      ['ArrowLeft', expanded ? () => onExpandedChange?.(false) : undefined],
      ['ArrowDown', () => focusBy(event.currentTarget, 1)],
      ['ArrowUp', () => focusBy(event.currentTarget, -1)],
    ]);

    const action = actions.get(event.key);

    if (!action) return;

    event.preventDefault();
    action();
  };

  return (
    <div
      role="treeitem"
      tabIndex={onSelect ? 0 : undefined}
      aria-level={depth + 1}
      aria-selected={selected}
      aria-expanded={expanded}
      style={cssVariables}
      className={cn(
        treeRowVariants({ interactive: Boolean(onSelect), selected, muted }),
        className,
      )}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      {...props}
    >
      {expanded === undefined ? (
        <span className="size-6 shrink-0" />
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          tabIndex={-1}
          aria-label={expandLabel}
          onClick={(event) => {
            event.stopPropagation();
            onExpandedChange?.(!expanded);
          }}
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <IconChevronRight className={cn('transition-transform', expanded && 'rotate-90')} />
          )}
        </Button>
      )}
      {children}
    </div>
  );
};

/** A line at a row's depth that is not an item: "show more", or a new row being typed. */
const TreeLine = ({
  depth,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { depth: number }) => {
  const cssVariables: Record<`--${string}`, string> = { '--tree-indent': indentOf(depth) };

  return (
    <div
      role="none"
      style={cssVariables}
      className={cn('flex h-9 items-center gap-2 pr-2 pl-(--tree-indent)', className)}
      {...props}
    >
      <span className="size-6 shrink-0" />
      {children}
    </div>
  );
};

/** The column names over a tree whose rows hold more than a name. */
const TreeHeader = ({ className, children, ...props }: React.ComponentProps<'div'>) => (
  <div
    aria-hidden
    className={cn(
      'flex h-8 flex-none items-center gap-2 border-b pr-2 pl-1 text-xs font-medium text-muted-foreground',
      className,
    )}
    {...props}
  >
    <span className="size-6 shrink-0" />
    {children}
  </div>
);

/**
 * Rows indented under their parents, which open and close.
 * An org structure, or categories.
 * `<Tree.Row depth expanded onExpandedChange selected onSelect>` is one item; the arrow keys move
 * between rows and open or close them, Enter selects. `Tree.Line` holds what sits among the
 * rows without being one, and `Tree.Header` names the columns. Draw only the rows that are open.
 */
export const Tree = Object.assign(TreeRoot, {
  Row: TreeRow,
  Line: TreeLine,
  Header: TreeHeader,
});
