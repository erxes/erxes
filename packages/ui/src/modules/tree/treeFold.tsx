import { IconCaretDownFilled } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { Button } from 'erxes-ui/components/button';
import { keyedAtom } from 'erxes-ui/lib/keyed-atom';
import { cn } from 'erxes-ui/lib/utils';

/*
 * The fold state of a tree of rows, as 3.x kept it. Each row has an `order`, its path from the
 * root ("01/", "01/02/"): a row's children are the rows whose order starts with its own. A tree
 * keeps the orders of its folded rows, so it hides every row under one of them.
 */

/** The folded rows' orders per tree id, and how many rows the tree had when they were folded. */
const foldedState = keyedAtom<{ length: number | undefined; folded: string[] }>({
  length: undefined,
  folded: [],
});

/** A tree's id, whether its rows come in tree order, and how many there are. */
export interface TreeOptions {
  id: string;
  /** The rows come in tree order, so they indent and fold; a search result is flat. */
  ordered?: boolean;
  /** How many rows the tree has: a change opens every row again. */
  length?: number;
}

const TreeOptionsContext = createContext<TreeOptions | null>(null);

/** A tree's fold state for its rows; every row opens again when `length` changes. */
export const TreeProvider = ({
  id,
  ordered,
  length,
  children,
}: TreeOptions & { children: ReactNode }) => {
  const options = useMemo(() => ({ id, ordered, length }), [id, ordered, length]);

  return <TreeOptionsContext.Provider value={options}>{children}</TreeOptionsContext.Provider>;
};

/** The order of a row, without the slashes its own name adds and the one at its end. */
export const fixOrder = ({ order, name }: { order?: string | null; name?: string | null }) => {
  let fixed = order ?? '';

  if (name?.includes('/')) fixed = fixed.replace(name, name.replaceAll('/', ''));

  return fixed.endsWith('/') ? fixed.slice(0, -1) : fixed;
};

/** How deep a row sits: the slashes in its fixed order. */
export const levelOf = (fixedOrder: string) => fixedOrder.match(/\//g)?.length ?? 0;

/** Whether the row of `order` is folded or hidden under a folded row, and how to fold it. */
export const useTreeFold = (order: string | null | undefined) => {
  const context = useContext(TreeOptionsContext);

  if (!context) throw new Error('A tree row must be inside its tree’s provider');

  const [state, setState] = useAtom(foldedState(context.id));
  // Folds made while the tree had another number of rows no longer hold.
  const folded = state.length === context.length ? state.folded : [];
  const own = order ?? '';

  return {
    ordered: context.ordered,
    isHidden: folded.includes(own),
    isHiddenByParent: folded.some((parent) => own.startsWith(parent) && own.length > parent.length),
    toggle: () =>
      setState({
        length: context.length,
        folded: folded.includes(own) ? folded.filter((item) => item !== own) : [...folded, own],
      }),
  };
};

/** The caret that folds a row's children, turned while they are hidden; none without children. */
export const TreeArrow = ({ order, hasChildren }: { order: string; hasChildren: boolean }) => {
  const { toggle, isHidden } = useTreeFold(order);

  if (!hasChildren) return null;

  return (
    // A span: the arrow sits inside the row's own button (a table cell, a picker item).
    <Button
      variant="ghost"
      size="icon"
      nativeButton={false}
      render={<span />}
      tabIndex={-1}
      onClick={(event) => {
        event.stopPropagation();
        toggle();
      }}
    >
      <IconCaretDownFilled className={cn('transition-transform', isHidden && '-rotate-90')} />
    </Button>
  );
};
